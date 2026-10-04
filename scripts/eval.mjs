import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import { createServer } from "vite";
import { meanSweep, pickLowConfidence, pickPersonal, worstPersonal } from "../src/vision/core/evalScore.ts";

const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : def;
};
const flag = (name) => argv.includes(`--${name}`);
const backends = opt("backends", "webgpu,wasm").split(",");
const dirs = opt("dirs", "test-images,test-images-public");
const outDir = opt("out", "eval-results");

const pct = (x) => `${Math.round(x * 100)}%`;
const row = (name, s) =>
  `| ${name} | ${s.n} | ${pct(s.top1)} | ${pct(s.top3)} | ${pct(s.auto)} | ${pct(s.wrongAuto)} | ${pct(s.notSure)} | ${Math.round(s.avgMs)} / ${Math.round(s.p95Ms)} | ${Math.round(s.avgTotalMs)} | ${Object.entries(s.sources).map(([k, v]) => `${k} ${v}`).join(", ")} |`;
const HEAD = "| | n | top-1 | top-3 | auto | wrong auto | not sure | naming ms avg/p95 | total ms | answered by |\n|---|---|---|---|---|---|---|---|---|---|";

function markdown(reports) {
  const out = ["# Cue recognition eval", ""];
  for (const r of reports) {
    out.push(`## ${r.device} (${new Date(r.startedAt).toISOString().slice(0, 10)}, ${Math.round(r.ms / 1000)} s)`, "");
    if (r.missing.length) out.push(`No labels.json in: ${r.missing.join(", ")}`, "");
    for (const f of r.folders) {
      out.push(`### ${f.folder}, ${f.aimMode} aim`, "", HEAD, row("all", f.summary));
      for (const [t, s] of Object.entries(f.byTag)) out.push(row(t, s));
      out.push("");
      out.push("| image | expected | answer | score | | choices |", "|---|---|---|---|---|---|");
      for (const { result: c } of f.cases) {
        out.push(`| ${c.file} | ${c.expected} | ${c.empty ? "(not sure)" : c.best} | ${pct(c.bestScore)} | ${c.low ? "scanner" : "auto"} | ${c.choices.slice(0, 3).join(", ")} |`);
      }
      out.push("");
    }
    for (const s of r.sweeps) {
      out.push(`### ${s.folder}, confidence sweep (centre aim)`, "", HEAD.replace("| |", "| threshold |"));
      for (const x of s.rows) out.push(row(String(x.threshold), x.summary));
      out.push("", `Picked: ${s.picked ? s.picked.threshold : "none with zero wrong auto-commits"}`, "");
    }
    for (const folder of new Set(r.conditions.map((c) => c.folder))) {
      const rows = r.conditions.filter((c) => c.folder === folder);
      const variants = [...new Set(rows.map((x) => x.variant))];
      out.push(`### ${folder}, degraded conditions (centre aim): top-1 / wrong auto / auto / naming ms`, "");
      out.push(`| condition | ${variants.join(" | ")} |`, `|---|${variants.map(() => "---").join("|")}|`);
      for (const c of new Set(rows.map((x) => x.condition))) {
        const cells = variants.map((v) => {
          const s = rows.find((x) => x.variant === v && x.condition === c)?.summary;
          return s ? `${pct(s.top1)} / ${pct(s.wrongAuto)} / ${pct(s.auto)} / ${Math.round(s.avgMs)}` : "";
        });
        out.push(`| ${c} | ${cells.join(" | ")} |`);
      }
      out.push("");
    }
    for (const p of r.personal) {
      out.push(`### ${p.folder}, personal objects (${p.objects} taught from augmented views)`, "");
      out.push(`Picked threshold ${p.picked?.threshold ?? "none"}, margin ${p.picked?.margin ?? "-"}; full pipeline with it: matched ${pct(p.pipeline.matched)}, false matches ${pct(p.pipeline.falseMatched)}, naming ${Math.round(p.pipeline.avgMs)} ms`, "");
      const own = p.queries.map((q) => q.own).sort((a, b) => a - b);
      const other = p.queries.map((q) => Math.max(...q.others.map((o) => o.cos))).sort((a, b) => b - a);
      out.push(`Own-object cosine: min ${own[0]?.toFixed(3)}, median ${own[Math.floor(own.length / 2)]?.toFixed(3)}. Best other-object cosine: max ${other[0]?.toFixed(3)}, median ${other[Math.floor(other.length / 2)]?.toFixed(3)}.`, "");
      out.push("| image | own | closest other | cos |", "|---|---|---|---|");
      for (const q of p.queries) {
        const o = [...q.others].sort((a, b) => b.cos - a.cos)[0];
        out.push(`| ${q.file} | ${q.own.toFixed(3)} | ${o?.file ?? ""} | ${o?.cos.toFixed(3) ?? ""} |`);
      }
      out.push("");
    }
  }
  if (reports.length > 1) {
    const folders = [...new Set(reports.flatMap((r) => r.sweeps.map((s) => s.folder)))];
    out.push(`## Thresholds picked across ${reports.map((r) => r.device).join(" + ")} (confidence: mean over backends; personal: worst case)`, "");
    for (const folder of folders) {
      const conf = meanSweep(reports.map((r) => r.sweeps.find((s) => s.folder === folder)?.rows ?? []));
      const lc = pickLowConfidence(conf);
      out.push(`- ${folder}: confidence threshold ${lc ? `${lc.threshold} (auto-commit ${pct(lc.summary.auto)}, wrong auto-commits ${pct(lc.summary.wrongAuto)})` : "none"}`);
      const pers = worstPersonal(reports.map((r) => r.personal.find((p) => p.folder === folder)?.sweep ?? []));
      const pp = pickPersonal(pers);
      out.push(`- ${folder}: personal threshold ${pp ? `${pp.threshold}, margin ${pp.margin} (matched ${pct(pp.trueMatch)}, false matches ${pct(pp.falseMatch)})` : "none with zero false matches"}`);
    }
    out.push("");
  }
  return out.join("\n");
}

if (flag("report-only")) {
  const reports = await Promise.all(backends.map(async (b) => JSON.parse(await readFile(`${outDir}/${b}.json`, "utf8"))));
  await writeFile(`${outDir}/summary.md`, markdown(reports));
  console.log(`wrote ${outDir}/summary.md`);
  process.exit(0);
}

const server = await createServer({ logLevel: "warn", server: { port: 5199 } });
await server.listen();
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch({
  channel: "chrome",
  headless: !flag("headed"),
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist"],
});
const reports = [];
try {
  await mkdir(outDir, { recursive: true });
  for (const backend of backends) {
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error(`[${backend}] page error:`, e.message));
    const params = new URLSearchParams({ eval: "1", dirs });
    if (backend === "wasm") params.set("siglip", "wasm");
    if (flag("no-sweep")) params.set("sweep", "0");
    if (flag("no-personal")) params.set("personal", "0");
    if (flag("claude")) params.set("claude", "1");
    if (flag("conditions")) params.set("conditions", "1");
    console.log(`[${backend}] ${base}?${params}`);
    await page.goto(`${base}?${params}`);
    let last = "";
    const timer = setInterval(async () => {
      const t = await page.locator("[data-testid=eval-progress]").textContent().catch(() => "");
      if (t && t !== last) process.stdout.write(`\r[${backend}] ${(last = t).slice(0, 100).padEnd(100)}`);
    }, 1000);
    await page.waitForFunction(() => window.__cueEval || window.__cueEvalError, null, { timeout: 30 * 60_000 });
    clearInterval(timer);
    process.stdout.write("\n");
    const error = await page.evaluate(() => window.__cueEvalError);
    if (error) throw new Error(`[${backend}] ${error}`);
    const report = await page.evaluate(() => window.__cueEval);
    if (backend !== report.device) console.warn(`[${backend}] ran on ${report.device}`);
    reports.push(report);
    await writeFile(`${outDir}/${backend}.json`, JSON.stringify(report, null, 2));
    await page.close();
  }
  const md = markdown(reports);
  await writeFile(`${outDir}/summary.md`, md);
  console.log(md.split("\n").filter((l) => l.startsWith("#") || l.startsWith("| all") || l.startsWith("Picked") || l.startsWith("- ")).join("\n"));
} finally {
  await browser.close();
  await server.close();
}
