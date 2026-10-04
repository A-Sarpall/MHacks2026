import { useEffect, useState } from "react";
import type { EvalSummary } from "../core/evalScore";
import { runEval, type AimMode, type EvalOptions, type EvalReport } from "./runEval";

declare global {
  interface Window {
    __cueEval?: EvalReport;
    __cueEvalError?: string;
  }
}

function optionsFromUrl(): EvalOptions {
  const q = new URLSearchParams(window.location.search);
  const list = (k: string, d: string) => (q.get(k) ?? d).split(",").map((s) => s.trim()).filter(Boolean);
  return {
    dirs: list("dirs", "test-images,test-images-public"),
    aimModes: list("aim", "centre,labelled").filter((m): m is AimMode => m === "centre" || m === "labelled"),
    sweep: q.get("sweep") !== "0",
    personal: q.get("personal") !== "0",
    claude: q.get("claude") === "1",
    conditions: q.get("conditions") === "1",
  };
}

let running: Promise<EvalReport> | null = null;
let progressCb: (t: string) => void = () => {};

const pct = (x: number) => `${Math.round(x * 100)}%`;

function SummaryRow({ name, s }: { name: string; s: EvalSummary }) {
  return (
    <tr className="border-t border-gray-100">
      <td className="pr-3">{name}</td>
      <td className="pr-3">{s.n}</td>
      <td className="pr-3">{pct(s.top1)}</td>
      <td className="pr-3">{pct(s.top3)}</td>
      <td className="pr-3">{pct(s.auto)}</td>
      <td className="pr-3">{pct(s.wrongAuto)}</td>
      <td className="pr-3">{pct(s.broad)}</td>
      <td className="pr-3">{pct(s.notSure)}</td>
      <td className="pr-3">{Math.round(s.avgMs)} / {Math.round(s.p95Ms)}</td>
      <td className="pr-3">{Math.round(s.avgTotalMs)}</td>
      <td>{Object.entries(s.sources).map(([k, v]) => `${k} ${v}`).join(", ")}</td>
    </tr>
  );
}

const HEAD = ["", "n", "top-1", "top-3", "auto", "wrong auto", "broad", "not sure", "naming ms avg/p95", "total ms", "answered by"];

export function EvalPage() {
  const [opts] = useState(optionsFromUrl);
  const [progress, setProgress] = useState("starting");
  const [report, setReport] = useState<EvalReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    progressCb = (t) => !cancelled && setProgress(t);
    running ??= runEval({ ...opts, onProgress: (t) => progressCb(t) });
    running
      .then((r) => {
        window.__cueEval = r;
        if (!cancelled) setReport(r);
      })
      .catch((err: unknown) => {
        const msg = String((err as Error)?.message ?? err);
        window.__cueEvalError = msg;
        if (!cancelled) setError(msg);
      });
    return () => {
      cancelled = true;
    };
  }, [opts]);

  const download = () => {
    if (!report) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `cue-eval-${report.device}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-sm">
      <h1 className="text-xl font-bold mb-1">Cue recognition eval</h1>
      <p className="text-gray-500 mb-4" data-testid="eval-progress">
        {error ? <span className="text-red-600">{error}</span> : report ? `Done in ${Math.round(report.ms / 1000)} s on ${report.device}` : progress}
      </p>
      {report && (
        <div className="flex flex-col gap-6">
          <button onClick={download} className="self-start px-3 py-1.5 rounded-lg border border-gray-200 bg-white">
            Download JSON
          </button>
          {report.missing.length > 0 && <p className="text-amber-700">No labels.json in: {report.missing.join(", ")}</p>}
          {report.folders.map((f) => (
            <section key={`${f.folder}-${f.aimMode}`} className="bg-white rounded-xl p-4 border border-gray-100">
              <h2 className="font-semibold mb-2">
                {f.folder} · {f.aimMode} aim
              </h2>
              <table className="mb-3">
                <thead>
                  <tr className="text-left text-gray-500">{HEAD.map((h) => <th key={h} className="pr-3">{h}</th>)}</tr>
                </thead>
                <tbody>
                  <SummaryRow name="all" s={f.summary} />
                  {Object.entries(f.byTag).map(([t, s]) => <SummaryRow key={t} name={t} s={s} />)}
                </tbody>
              </table>
              <table>
                <tbody>
                  {f.cases.map(({ result: r }) => (
                    <tr key={r.file} className="border-t border-gray-100">
                      <td className="pr-3">{r.file}</td>
                      <td className="pr-3">{r.expected}</td>
                      <td className="pr-3 font-medium">{r.empty ? "(not sure)" : r.best}</td>
                      <td className="pr-3">{pct(r.bestScore)}</td>
                      <td className="pr-3">{r.low ? "scanner" : "auto"}</td>
                      <td className="pr-3 text-gray-500">{r.choices.slice(0, 3).join(", ")}</td>
                      <td>{Math.round(r.ms)} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
          {report.sweeps.map((s) => (
            <section key={s.folder} className="bg-white rounded-xl p-4 border border-gray-100">
              <h2 className="font-semibold mb-2">{s.folder} · confidence threshold sweep (centre aim)</h2>
              <table>
                <thead>
                  <tr className="text-left text-gray-500">{HEAD.map((h, i) => <th key={h} className="pr-3">{i === 0 ? "threshold" : h}</th>)}</tr>
                </thead>
                <tbody>
                  {s.rows.map((r) => <SummaryRow key={r.threshold} name={String(r.threshold)} s={r.summary} />)}
                </tbody>
              </table>
              <p className="mt-2">Picked: {s.picked ? s.picked.threshold : "none with zero wrong auto-commits"}</p>
            </section>
          ))}
          {[...new Set(report.conditions.map((c) => c.folder))].map((folder) => {
            const rows = report.conditions.filter((c) => c.folder === folder);
            const variants = [...new Set(rows.map((r) => r.variant))];
            const conds = [...new Set(rows.map((r) => r.condition))];
            return (
              <section key={`cond-${folder}`} className="bg-white rounded-xl p-4 border border-gray-100">
                <h2 className="font-semibold mb-2">{folder} · degraded conditions (centre aim) · top-1 / wrong auto / broad / auto / re-oriented / median sharpness</h2>
                <table>
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="pr-3">condition</th>
                      {variants.map((v) => <th key={v} className="pr-3">{v}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {conds.map((c) => (
                      <tr key={c} className="border-t border-gray-100">
                        <td className="pr-3">{c}</td>
                        {variants.map((v) => {
                          const s = rows.find((r) => r.variant === v && r.condition === c)?.summary;
                          return <td key={v} className="pr-3">{s ? `${pct(s.top1)} / ${pct(s.wrongAuto)} / ${pct(s.broad)} / ${pct(s.auto)} / ${pct(s.turned)} / ${Math.round(s.medianSharpness)}` : ""}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            );
          })}
          {report.personal.map((p) => (
            <section key={p.folder} className="bg-white rounded-xl p-4 border border-gray-100">
              <h2 className="font-semibold mb-2">{p.folder} · personal objects ({p.objects} taught)</h2>
              <p className="mb-2">
                Picked threshold {p.picked?.threshold ?? "none"}, margin {p.picked?.margin ?? "-"} · full pipeline: matched{" "}
                {pct(p.pipeline.matched)}, false matches {pct(p.pipeline.falseMatched)}, {Math.round(p.pipeline.avgMs)} ms
              </p>
              <table>
                <thead>
                  <tr className="text-left text-gray-500">
                    {["file", "own cos", "best other", "cos"].map((h) => <th key={h} className="pr-3">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {p.queries.map((q) => {
                    const other = [...q.others].sort((a, b) => b.cos - a.cos)[0];
                    return (
                      <tr key={q.file} className="border-t border-gray-100">
                        <td className="pr-3">{q.file}</td>
                        <td className="pr-3">{q.own.toFixed(3)}</td>
                        <td className="pr-3">{other?.file}</td>
                        <td>{other?.cos.toFixed(3)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
