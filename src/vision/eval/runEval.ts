import { detectImageFrame, initDetector } from "../../lib/detect";
import { hasClaude } from "../../lib/claude";
import { aimPoint, aimZone, rankCandidates, type Candidate, type Point } from "../core/aim";
import { DEFAULT_NAMING, type NamingConfig } from "../core/escalate";
import {
  personalSweep,
  pickLowConfidence,
  pickPersonal,
  summarizeCases,
  type CaseResult,
  type EvalSummary,
  type LabelFile,
  type LabelSpec,
  type PersonalQuery,
  type PersonalSweepRow,
  type SweepRow,
} from "../core/evalScore";
import { DEFAULT_PERSONAL, nearestPersonal, type PersonalEntry, type PersonalMatchConfig } from "../core/personalMatch";
import { rankFrames, sharpness } from "../core/sharpness";
import { askClaude, nameTarget, type NamingResult } from "../naming";
import { teachSample } from "../personal";
import { initSiglip, siglipState } from "../siglip";
import { FileSource, IDENTITY, captureFrames, orientFrame, withTimeout } from "../sources";

export type AimMode = "centre" | "labelled";

export interface EvalOptions {
  dirs: string[];
  aimModes: AimMode[];
  sweep: boolean;
  personal: boolean;
  claude: boolean;
  onProgress?: (text: string) => void;
}

export interface FolderReport {
  folder: string;
  aimMode: AimMode;
  summary: EvalSummary;
  byTag: Record<string, EvalSummary>;
  cases: { result: CaseResult; spec: LabelSpec }[];
}

export interface PersonalReport {
  folder: string;
  objects: number;
  sweep: PersonalSweepRow[];
  picked: PersonalSweepRow | null;
  queries: PersonalQuery[];
  pipeline: { cfg: PersonalMatchConfig; matched: number; falseMatched: number; n: number; avgMs: number };
}

export interface EvalReport {
  device: string;
  claude: boolean;
  startedAt: string;
  ms: number;
  naming: NamingConfig;
  missing: string[];
  folders: FolderReport[];
  sweeps: { folder: string; rows: SweepRow[]; picked: SweepRow | null }[];
  personal: PersonalReport[];
}

interface Prepared {
  file: string;
  spec: LabelSpec;
  image: HTMLCanvasElement;
  prepMs: number;
}

const BASE = import.meta.env.BASE_URL;
const SWEEP = [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.6];
const PERSONAL_THRESHOLDS = [0.7, 0.75, 0.8, 0.82, 0.85, 0.87, 0.9, 0.92];
const PERSONAL_MARGINS = [0, 0.01, 0.02, 0.04];

function snapshot(frame: ImageBitmap): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = frame.width;
  canvas.height = frame.height;
  canvas.getContext("2d")!.drawImage(frame, 0, 0);
  return canvas;
}

async function loadLabels(dir: string): Promise<LabelFile | null> {
  const res = await fetch(`${BASE}${dir}/labels.json`);
  if (!res.ok) return null;
  try {
    return (await res.json()) as LabelFile;
  } catch {
    return null;
  }
}

async function prepare(dir: string, file: string, spec: LabelSpec): Promise<Prepared> {
  const t0 = performance.now();
  const source = new FileSource([`${BASE}${dir}/${file}`]);
  await source.start();
  try {
    const shot = await withTimeout(captureFrames(source, { count: 1, discard: 0, delayMs: 0 }), 10_000);
    const ranked = rankFrames(
      shot.frames.map((f) => {
        const item = orientFrame(f, IDENTITY);
        return { item, sharpness: sharpness(item, aimZone(item.width, item.height, { zoneFrac: 0.5, offset: { dx: 0, dy: 0 } })) };
      })
    );
    const image = snapshot(ranked[0].item);
    ranked.forEach((r) => r.item.close());
    return { file, spec, image, prepMs: performance.now() - t0 };
  } finally {
    source.stop();
  }
}

function aimFor(p: Prepared, mode: AimMode): Point {
  const { width: w, height: h } = p.image;
  if (mode === "labelled" && p.spec.aim) return { x: p.spec.aim[0] * w, y: p.spec.aim[1] * h };
  return aimPoint(w, h, { dx: 0, dy: 0 });
}

function candidatesFor(image: HTMLCanvasElement, aim: Point): { candidates: Candidate[]; ms: number } {
  const t0 = performance.now();
  const dets = detectImageFrame(image).map((d, i) => ({ ...d, id: i + 1 }));
  const candidates = rankCandidates(dets, image.width, image.height, aim, { maxCandidates: 4, aimCropFrac: 0.4 });
  return { candidates, ms: performance.now() - t0 };
}

function choicesOf(res: NamingResult): string[] {
  const out: string[] = [];
  for (const l of [...res.options.map((o) => o.label), ...res.best.capture.alternatives.map((a) => a.label)]) {
    if (!out.includes(l)) out.push(l);
  }
  return out;
}

async function runCase(
  p: Prepared,
  aim: Point,
  candidates: Candidate[],
  detMs: number,
  cfg: NamingConfig,
  personal: PersonalEntry[],
  claude: boolean,
  personalCfg?: PersonalMatchConfig
): Promise<CaseResult> {
  const res = await nameTarget(
    { image: p.image, candidates, aim },
    { startLevel: 0, maxOptions: 4, cfg, namer: { personal, personalCfg } }
  );
  let best = res.best.label;
  let source = res.best.capture.source;
  let choices = res.empty ? [] : choicesOf(res);
  let empty = res.empty;
  let ms = res.ms;
  if (claude && res.low) {
    const t0 = performance.now();
    const guess = await askClaude(res.best, res.options);
    ms += performance.now() - t0;
    if (guess && res.empty) {
      best = guess.label;
      source = "claude";
      choices = [guess.label];
      empty = false;
    } else if (guess && !choices.includes(guess.label)) {
      choices.splice(1, 0, guess.label);
    }
  }
  return {
    file: p.file,
    expected: p.spec.label,
    tags: p.spec.tags ?? [],
    best,
    bestScore: res.best.score,
    source,
    low: res.low,
    empty,
    level: res.level,
    choices,
    ms,
    totalMs: p.prepMs + detMs + ms,
  };
}

function byTag(cases: { result: CaseResult; spec: LabelSpec }[]): Record<string, EvalSummary> {
  const tags = new Set(cases.flatMap((c) => c.spec.tags ?? []));
  const out: Record<string, EvalSummary> = {};
  for (const t of tags) out[t] = summarizeCases(cases.filter((c) => (c.spec.tags ?? []).includes(t)));
  return out;
}

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function augment(image: HTMLCanvasElement, aim: Point, rand: () => number): { image: HTMLCanvasElement; aim: Point } {
  const { width: w, height: h } = image;
  const short = Math.min(w, h);
  const s = 0.85 + rand() * 0.3;
  const shift = { x: (rand() - 0.5) * 0.12 * short, y: (rand() - 0.5) * 0.12 * short };
  const angle = ((rand() - 0.5) * 12 * Math.PI) / 180;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, w, h);
  ctx.filter = `brightness(${0.8 + rand() * 0.4}) contrast(${0.85 + rand() * 0.3}) saturate(${0.8 + rand() * 0.4})`;
  const to = { x: aim.x + shift.x, y: aim.y + shift.y };
  ctx.translate(to.x, to.y);
  ctx.rotate(angle);
  ctx.scale(s, s);
  ctx.translate(-aim.x, -aim.y);
  ctx.drawImage(image, 0, 0);
  return { image: canvas, aim: { x: Math.min(w, Math.max(0, to.x)), y: Math.min(h, Math.max(0, to.y)) } };
}

async function evalPersonal(folder: string, prepared: Prepared[], progress: (t: string) => void): Promise<PersonalReport> {
  const entries: PersonalEntry[] = [];
  const queryViews: { file: string; image: HTMLCanvasElement; aim: Point; centre: Float32Array }[] = [];
  for (const [i, p] of prepared.entries()) {
    progress(`personal: teaching ${p.file}`);
    const rand = mulberry(1000 + i);
    const aim = aimFor(p, "labelled");
    const embeddings: Float32Array[] = [];
    for (let k = 0; k < 3; k++) {
      const v = augment(p.image, aim, rand);
      const sample = await teachSample({ image: v.image, aim: v.aim, candidates: candidatesFor(v.image, v.aim).candidates });
      embeddings.push(...sample.embeddings);
    }
    entries.push({ id: p.file, name: `taught:${p.file}`, embeddings });
    const q = augment(p.image, aim, rand);
    const qs = await teachSample({ image: q.image, aim: q.aim });
    queryViews.push({ file: p.file, image: q.image, aim: q.aim, centre: qs.embeddings[0] });
  }
  const queries: PersonalQuery[] = queryViews.map((q) => {
    const hits = nearestPersonal(q.centre, entries);
    return {
      file: q.file,
      own: hits.find((h) => h.id === q.file)?.cos ?? -1,
      others: hits.filter((h) => h.id !== q.file).map((h) => ({ file: h.id, cos: h.cos })),
    };
  });
  const sweep = personalSweep(queries, PERSONAL_THRESHOLDS, PERSONAL_MARGINS);
  const picked = pickPersonal(sweep);
  const cfg: PersonalMatchConfig = picked
    ? { ...DEFAULT_PERSONAL, threshold: picked.threshold, margin: picked.margin }
    : DEFAULT_PERSONAL;
  let matched = 0;
  let falseMatched = 0;
  let totalMs = 0;
  for (const q of queryViews) {
    progress(`personal: recognising ${q.file}`);
    const p = prepared.find((x) => x.file === q.file)!;
    const { candidates, ms: detMs } = candidatesFor(q.image, q.aim);
    const view: Prepared = { ...p, image: q.image, prepMs: 0 };
    const withOwn = await runCase(view, q.aim, candidates, detMs, DEFAULT_NAMING, entries, false, cfg);
    totalMs += withOwn.ms;
    if (withOwn.source === "personal" && withOwn.best === `taught:${q.file}`) matched++;
    const without = await runCase(view, q.aim, candidates, detMs, DEFAULT_NAMING, entries.filter((e) => e.id !== q.file), false, cfg);
    if (without.source === "personal") falseMatched++;
  }
  const n = queryViews.length;
  return {
    folder,
    objects: entries.length,
    sweep,
    picked,
    queries,
    pipeline: { cfg, matched: matched / Math.max(1, n), falseMatched: falseMatched / Math.max(1, n), n, avgMs: totalMs / Math.max(1, n) },
  };
}

export async function runEval(opts: EvalOptions): Promise<EvalReport> {
  const t0 = performance.now();
  const progress = opts.onProgress ?? (() => {});
  progress("loading models");
  await Promise.all([initDetector(), initSiglip()]);
  const report: EvalReport = {
    device: siglipState().device ?? "unknown",
    claude: opts.claude && hasClaude(),
    startedAt: new Date().toISOString(),
    ms: 0,
    naming: DEFAULT_NAMING,
    missing: [],
    folders: [],
    sweeps: [],
    personal: [],
  };
  for (const dir of opts.dirs) {
    const labels = await loadLabels(dir);
    if (!labels) {
      report.missing.push(dir);
      continue;
    }
    const prepared: Prepared[] = [];
    for (const [file, spec] of Object.entries(labels)) {
      progress(`${dir}: loading ${file}`);
      try {
        prepared.push(await prepare(dir, file, spec));
      } catch (err) {
        console.warn("[eval] could not load", file, err);
      }
    }
    for (const mode of opts.aimModes) {
      const cases: { result: CaseResult; spec: LabelSpec }[] = [];
      for (const p of prepared) {
        progress(`${dir} (${mode} aim): ${p.file}`);
        const aim = aimFor(p, mode);
        const { candidates, ms } = candidatesFor(p.image, aim);
        cases.push({ result: await runCase(p, aim, candidates, ms, DEFAULT_NAMING, [], report.claude), spec: p.spec });
      }
      report.folders.push({ folder: dir, aimMode: mode, summary: summarizeCases(cases), byTag: byTag(cases), cases });
    }
    if (opts.sweep) {
      const rows: SweepRow[] = [];
      for (const t of SWEEP) {
        const cfg = { ...DEFAULT_NAMING, lowConfidence: t };
        const cases: { result: CaseResult; spec: LabelSpec }[] = [];
        for (const p of prepared) {
          progress(`${dir}: sweep ${t} ${p.file}`);
          const aim = aimFor(p, "centre");
          const { candidates, ms } = candidatesFor(p.image, aim);
          cases.push({ result: await runCase(p, aim, candidates, ms, cfg, [], false), spec: p.spec });
        }
        rows.push({ threshold: t, summary: summarizeCases(cases) });
      }
      report.sweeps.push({ folder: dir, rows, picked: pickLowConfidence(rows) });
    }
    if (opts.personal) report.personal.push(await evalPersonal(dir, prepared, progress));
  }
  report.ms = performance.now() - t0;
  progress("done");
  return report;
}
