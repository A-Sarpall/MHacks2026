#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, dirname } from "node:path";

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : dflt;
};
const reportPaths = (opt("reports", "") || "").split(",").filter(Boolean);
const labelsPath = opt("labels", "test-images-public/labels.json");
const outPath = opt("out", "eval-results/phase1/baseline.md");
if (reportPaths.length === 0) {
  console.error("usage: node scripts/eval-stats.mjs --reports a.json,b.json --labels labels.json --out out.md");
  process.exit(1);
}

const normLabel = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/^(a|an|the) /, "")
    .replace(/\s+/g, " ")
    .trim();
const singular = (s) => (s.length > 3 && s.endsWith("s") && !s.endsWith("ss") ? s.slice(0, -1) : s);
const matches = (label, spec) => {
  const got = singular(normLabel(label));
  return [spec.label, ...(spec.accept ?? [])].some((a) => singular(normLabel(a)) === got);
};
const outcome = (r, spec) => {
  const broad = !r.empty && r.broad && r.expectedGeneric != null && normLabel(r.best) === normLabel(r.expectedGeneric);
  const top1 = !r.empty && matches(r.best, spec);
  const top3 = !r.empty && (r.choices ?? []).slice(0, 3).some((c) => matches(c, spec));
  const auto = !r.low && !r.empty;
  return { top1, top3, auto, wrongAuto: auto && !top1 && !broad, notSure: !!r.empty, broad };
};

const Z95 = 1.959963984540054;
const Z80 = 0.8416212335729143;
function wilson(k, n, z = Z95) {
  if (!n) return [0, 0];
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}
const pct = (x) => (x == null ? "not reachable (gain capped by baseline)" : `${(100 * x).toFixed(1)}%`);
const ci = (k, n) => {
  const [lo, hi] = wilson(k, n);
  return `${pct(n ? k / n : 0)} [${pct(lo)}, ${pct(hi)}]`;
};
const p95 = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil(s.length * 0.95) - 1)];
};
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function unpairedMde(p0, n, alpha = 0.05, power = 0.8) {
  const za = Z95;
  const zb = Z80;
  let lo = 0;
  let hi = 1 - p0;
  for (let i = 0; i < 60; i++) {
    const d = (lo + hi) / 2;
    const p1 = p0 + d;
    const pbar = (p0 + p1) / 2;
    const se0 = Math.sqrt(2 * pbar * (1 - pbar) / n);
    const se1 = Math.sqrt((p0 * (1 - p0) + p1 * (1 - p1)) / n);
    const pow = 1 - normCdf((za * se0 - d) / se1);
    if (pow >= power) hi = d;
    else lo = d;
  }
  return hi >= (1 - p0) * (1 - 1e-6) ? null : hi;
}
function mcnemarMde(n, alpha = 0.05, power = 0.8) {
  const za = Z95;
  const zb = Z80;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i++) {
    const d = (lo + hi) / 2;
    const disc = 2 * d + 0.1;
    const b = ((disc + d) / 2) * n;
    const c = ((disc - d) / 2) * n;
    if (c < 0) {
      hi = d;
      continue;
    }
    const need = Math.pow(za * Math.sqrt(disc) + zb * Math.sqrt(disc - d * d), 2) / (d * d);
    if (n >= need) hi = d;
    else lo = d;
  }
  return hi;
}
function normCdf(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x >= 0 ? 1 - p : p;
}

let labels = {};
try {
  labels = JSON.parse(readFileSync(labelsPath, "utf8"));
} catch (e) {
  console.error(`labels not readable (${labelsPath}): ${e.message}; held-out n = 0`);
}
const labelEntries = Object.entries(labels).filter(([, v]) => v && typeof v === "object");
const heldoutN = labelEntries.filter(([, v]) => v.split === "heldout").length;
const devN = labelEntries.length - heldoutN;

const out = [];
const L = (s = "") => out.push(s);
L(`# Phase 1 baseline statistics`);
L();
L(`Generated ${new Date().toISOString()} from: ${reportPaths.join(", ")}`);
L(`Labels: ${labelsPath} (${labelEntries.length} entries, ${devN} dev, ${heldoutN} held-out; missing split counts as dev)`);
L();
L(`Rates are count/n over the folder. Intervals are 95% Wilson score intervals: centre = (p + z²/2n)/(1 + z²/n), half-width = z·sqrt(p(1-p)/n + z²/4n²)/(1 + z²/n), z = 1.96.`);
L();

const folderCases = [];
let devTop1 = null;
let devWrongAuto = null;
let devN0 = 0;

for (const rp of reportPaths) {
  let rep;
  try {
    rep = JSON.parse(readFileSync(rp, "utf8"));
  } catch (e) {
    L(`## ${rp}: unreadable (${e.message})`);
    continue;
  }
  const backend = rep.device ?? "unknown";
  L(`## ${basename(rp)} — backend ${backend}${rep.claude ? " + claude" : ""} (${rep.startedAt ?? "?"})`);
  L();
  L(`| folder | aim | n | top-1 | top-3 | auto | wrong auto-commit | not sure | naming ms avg / p95 | total ms avg |`);
  L(`|---|---|---|---|---|---|---|---|---|---|`);
  for (const f of rep.folders ?? []) {
    const cases = f.cases ?? [];
    const n = cases.length;
    const outs = cases.map((c) => outcome(c.result, c.spec));
    const cnt = (k) => outs.filter((o) => o[k]).length;
    const ms = cases.map((c) => c.result.ms);
    const tot = cases.map((c) => c.result.totalMs);
    L(
      `| ${f.folder} | ${f.aimMode} | ${n} | ${ci(cnt("top1"), n)} | ${ci(cnt("top3"), n)} | ${ci(cnt("auto"), n)} | ${ci(cnt("wrongAuto"), n)} | ${ci(cnt("notSure"), n)} | ${mean(ms).toFixed(0)} / ${p95(ms).toFixed(0)} | ${mean(tot).toFixed(0)} |`,
    );
    folderCases.push({ report: basename(rp), backend, folder: f.folder, aim: f.aimMode, cases, outs });
    const isDev = cases.filter((c) => (labels[c.result.file]?.split ?? "dev") !== "heldout");
    if (devTop1 === null && isDev.length) {
      const o = isDev.map((c) => outcome(c.result, c.spec));
      devTop1 = o.filter((x) => x.top1).length / o.length;
      devWrongAuto = o.filter((x) => x.wrongAuto).length / o.length;
      devN0 = o.length;
    }
  }
  L();
}

L(`## Smallest detectable held-out improvement (alpha 0.05 two-sided, power 80%)`);
L();
L(`Baseline from the first dev folder (${devN0} dev cases): top-1 = ${pct(devTop1 ?? 0)}, wrong auto-commit = ${pct(devWrongAuto ?? 0)}. Held-out n = ${heldoutN}.`);
L();
L(`Unpaired two-proportion z-test (two independent samples of n each): power = 1 - Φ((z_α/2·sqrt(2·p̄(1-p̄)/n) - δ) / sqrt((p0(1-p0) + p1(1-p1))/n)), p̄ = (p0+p1)/2, p1 = p0+δ; δ solved by bisection for power = 0.8.`);
L(`Paired McNemar test: with discordant fraction D = 2δ + 0.10 and net gain δ, required n = (z_α/2·sqrt(D) + z_β·sqrt(D - δ²))² / δ²; δ solved by bisection for n = held-out n (δ is the change in rate = (b - c)/n).`);
L();
if (heldoutN > 0) {
  L(`| metric | baseline | unpaired MDE (abs) | McNemar MDE (abs) |`);
  L(`|---|---|---|---|`);
  for (const [name, p0] of [["top-1", devTop1 ?? 0], ["wrong auto-commit", devWrongAuto ?? 0]]) {
    const base = name === "top-1" ? p0 : 1 - p0;
    L(`| ${name} | ${pct(p0)} | ${pct(unpairedMde(Math.min(base, 0.999), heldoutN))} | ${pct(mcnemarMde(heldoutN))} |`);
  }
  L();
  L(`For wrong auto-commit the gain is a reduction; the unpaired MDE is computed on the complement rate (1 - wrongAuto) so the same formula applies.`);
} else {
  L(`Held-out n is 0: no detectable-improvement figures. Reference values for n = 50, 100, 200 at this baseline:`);
  L();
  L(`| n | top-1 unpaired MDE | top-1 McNemar MDE | wrong-auto unpaired MDE | wrong-auto McNemar MDE |`);
  L(`|---|---|---|---|---|`);
  for (const n of [50, 100, 200]) {
    const t = Math.min(devTop1 ?? 0.5, 0.999);
    const w = Math.min(1 - (devWrongAuto ?? 0), 0.999);
    L(`| ${n} | ${pct(unpairedMde(t, n))} | ${pct(mcnemarMde(n))} | ${pct(unpairedMde(w, n))} | ${pct(mcnemarMde(n))} |`);
  }
}
L();

L(`## Failure classes`);
L();
for (const fc of folderCases) {
  L(`### ${fc.report} / ${fc.folder} / ${fc.aim} aim`);
  L();
  const confusion = new Map();
  const byTag = new Map();
  const wrongAutos = [];
  const notSures = [];
  fc.cases.forEach((c, i) => {
    const o = fc.outs[i];
    const r = c.result;
    const tags = c.spec?.tags ?? r.tags ?? ["untagged"];
    for (const t of tags) {
      const e = byTag.get(t) ?? { n: 0, miss: 0, wrongAuto: 0, notSure: 0 };
      e.n++;
      if (!o.top1) e.miss++;
      if (o.wrongAuto) e.wrongAuto++;
      if (o.notSure) e.notSure++;
      byTag.set(t, e);
    }
    if (!o.top1) {
      const key = `${r.expected} → ${r.empty ? "(not sure)" : r.best}`;
      confusion.set(key, (confusion.get(key) ?? 0) + 1);
    }
    if (o.wrongAuto) wrongAutos.push(r);
    if (o.notSure) notSures.push(r);
  });
  L(`Confusion pairs (expected → answer, top-1 misses):`);
  L();
  L(`| expected → answer | count |`);
  L(`|---|---|`);
  for (const [k, v] of [...confusion.entries()].sort((a, b) => b[1] - a[1])) L(`| ${k} | ${v} |`);
  if (confusion.size === 0) L(`| (none) | 0 |`);
  L();
  L(`Failure rate by tag (ranked by images lost = top-1 misses):`);
  L();
  L(`| tag | n | top-1 misses | miss rate | wrong auto | not sure |`);
  L(`|---|---|---|---|---|---|`);
  for (const [t, e] of [...byTag.entries()].sort((a, b) => b[1].miss - a[1].miss))
    L(`| ${t} | ${e.n} | ${e.miss} | ${ci(e.miss, e.n)} | ${e.wrongAuto} | ${e.notSure} |`);
  L();
  L(`Wrong auto-commits (${wrongAutos.length}):`);
  L();
  L(`| file | expected | answer | score |`);
  L(`|---|---|---|---|`);
  for (const r of wrongAutos.sort((a, b) => b.bestScore - a.bestScore)) L(`| ${r.file} | ${r.expected} | ${r.best} | ${pct(r.bestScore ?? 0)} |`);
  if (!wrongAutos.length) L(`| (none) | | | |`);
  L();
  L(`Not-sure cases (${notSures.length}):`);
  L();
  L(`| file | expected | best score | source |`);
  L(`|---|---|---|---|`);
  for (const r of notSures.sort((a, b) => (a.bestScore ?? 0) - (b.bestScore ?? 0))) L(`| ${r.file} | ${r.expected} | ${pct(r.bestScore ?? 0)} | ${r.source ?? "none"} |`);
  if (!notSures.length) L(`| (none) | | | |`);
  L();
}

L(`## Paired flips between folders sharing file names`);
L();
const byKey = new Map();
for (const fc of folderCases) {
  const key = `${fc.report}/${fc.aim}`;
  if (!byKey.has(key)) byKey.set(key, []);
  byKey.get(key).push(fc);
}
let anyPairs = false;
for (const [key, group] of byKey) {
  if (group.length < 2) continue;
  const first = group[0];
  const firstMap = new Map(first.cases.map((c, i) => [c.result.file, first.outs[i]]));
  for (const other of group.slice(1)) {
    let rw = 0;
    let wr = 0;
    let shared = 0;
    const flips = [];
    other.cases.forEach((c, i) => {
      const a = firstMap.get(c.result.file);
      if (!a) return;
      shared++;
      const b = other.outs[i];
      if (a.top1 && !b.top1) {
        rw++;
        flips.push(`${c.result.file}: right → wrong (${c.result.empty ? "(not sure)" : c.result.best})`);
      }
      if (!a.top1 && b.top1) {
        wr++;
        flips.push(`${c.result.file}: wrong → right`);
      }
    });
    if (!shared) continue;
    anyPairs = true;
    L(`### ${key}: ${first.folder} → ${other.folder} (${shared} shared files)`);
    L();
    L(`- right → wrong: ${rw}`);
    L(`- wrong → right: ${wr}`);
    L(`- net top-1 change: ${wr - rw} (McNemar discordant pairs = ${rw + wr})`);
    for (const f of flips) L(`  - ${f}`);
    L();
  }
}
if (!anyPairs) L(`No two folders in the same report and aim mode share file names.`);
L();

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, out.join("\n"));
console.log(`wrote ${outPath} (${out.length} lines)`);
