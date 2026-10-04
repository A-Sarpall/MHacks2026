import { describe, expect, it } from "vitest";
import {
  matches,
  outcome,
  personalSweep,
  pickLowConfidence,
  pickPersonal,
  summarizeCases,
  meanSweep,
  worstPersonal,
  type CaseResult,
  type EvalSummary,
} from "./evalScore";

const spec = { label: "mug", accept: ["coffee cup"] };
const result = (over: Partial<CaseResult>): CaseResult => ({
  file: "x.jpg",
  expected: "mug",
  tags: [],
  best: "mug",
  bestScore: 0.5,
  source: "vocab",
  low: false,
  empty: false,
  blurry: false,
  broad: false,
  turned: 0,
  sharpness: 100,
  expectedGeneric: null,
  level: 0,
  choices: ["mug"],
  ms: 100,
  totalMs: 150,
  ...over,
});

describe("eval scoring", () => {
  it("matches labels loosely", () => {
    expect(matches("Mug", spec)).toBe(true);
    expect(matches("a coffee cup", spec)).toBe(true);
    expect(matches("mugs", spec)).toBe(true);
    expect(matches("glass", spec)).toBe(false);
    expect(matches("pills", { label: "pill" })).toBe(true);
    expect(matches("glass", { label: "glasses" })).toBe(false);
  });

  it("classifies outcomes", () => {
    expect(outcome(result({}), spec)).toEqual({ top1: true, top3: true, auto: true, wrongAuto: false, notSure: false, broad: false });
    expect(outcome(result({ best: "cup", choices: ["cup", "bowl", "mug"] }), spec)).toMatchObject({
      top1: false,
      top3: true,
      wrongAuto: true,
    });
    expect(outcome(result({ best: "cup", low: true, choices: ["cup", "mug"] }), spec)).toMatchObject({
      auto: false,
      wrongAuto: false,
      top3: true,
    });
    expect(outcome(result({ empty: true }), spec)).toMatchObject({ top1: false, top3: false, notSure: true, auto: false });
  });

  it("counts a broad category word as safe, not wrong", () => {
    const fruit = { label: "banana" };
    const r = result({ best: "fruit", broad: true, expectedGeneric: "fruit", choices: ["fruit", "banana"] });
    expect(outcome(r, fruit)).toMatchObject({ top1: false, top3: true, auto: true, wrongAuto: false, broad: true });
    const wrong = result({ best: "drink", broad: true, expectedGeneric: "fruit", choices: ["drink"] });
    expect(outcome(wrong, fruit)).toMatchObject({ wrongAuto: true, broad: false });
  });

  it("summarises rates, latency and sources", () => {
    const s = summarizeCases([
      { result: result({ ms: 100 }), spec },
      { result: result({ best: "cup", choices: ["cup"], ms: 300, source: "personal" }), spec },
      { result: result({ empty: true, ms: 200 }), spec },
      { result: result({ low: true, ms: 400 }), spec },
    ]);
    expect(s).toMatchObject({ n: 4, top1: 0.5, top3: 0.5, auto: 0.5, wrongAuto: 0.25, notSure: 0.25, broad: 0, blurry: 0, turned: 0, medianSharpness: 100, avgMs: 250, p95Ms: 400 });
    expect(s.sources).toEqual({ vocab: 2, personal: 1, none: 1 });
  });

  it("picks the highest threshold that keeps exact automation within reach of the best, at the lowest wrong auto-commit rate", () => {
    const sum = (auto: number, wrongAuto: number) => ({ auto, wrongAuto }) as EvalSummary;
    const rows = [
      { threshold: 0.2, summary: sum(0.8, 0.1) },
      { threshold: 0.3, summary: sum(0.6, 0.04) },
      { threshold: 0.35, summary: sum(0.6, 0.04) },
      { threshold: 0.5, summary: sum(0.3, 0.04) },
    ];
    expect(pickLowConfidence(rows)?.threshold).toBe(0.35);
    expect(pickLowConfidence(rows, 0.1)?.threshold).toBe(0.2);
    expect(pickLowConfidence([])).toBeNull();
    const close = [...rows, { threshold: 0.45, summary: sum(0.56, 0.04) }];
    expect(pickLowConfidence(close)?.threshold).toBe(0.45);
    expect(pickLowConfidence(close, 0, 0)?.threshold).toBe(0.35);
    const broad = [...rows, { threshold: 0.6, summary: { ...sum(0.6, 0.04), broad: 0.2 } }];
    expect(pickLowConfidence(broad)?.threshold).toBe(0.35);
  });

  it("combines sweeps from several backends by their mean", () => {
    const sum = (auto: number, wrongAuto: number) => ({ auto, wrongAuto, top1: 0, top3: 0, notSure: 0, broad: 0, blurry: 0, turned: 0, medianSharpness: 0, avgMs: 0, avgTotalMs: 0 }) as EvalSummary;
    const gpu = [
      { threshold: 0.3, summary: sum(0.76, 0.08) },
      { threshold: 0.35, summary: sum(0.64, 0.04) },
    ];
    const cpu = [
      { threshold: 0.3, summary: sum(0.84, 0.08) },
      { threshold: 0.35, summary: sum(0.8, 0.08) },
      { threshold: 0.5, summary: sum(0.68, 0.12) },
    ];
    const both = meanSweep([gpu, cpu]);
    expect(both.map((r) => r.threshold)).toEqual([0.3, 0.35]);
    expect(both[1].summary.wrongAuto).toBeCloseTo(0.06);
    expect(both[1].summary.auto).toBeCloseTo(0.72);
    expect(pickLowConfidence(both)?.threshold).toBe(0.35);
  });

  it("sweeps personal thresholds and keeps false matches at zero", () => {
    const queries = [
      { file: "a", own: 0.95, others: [{ file: "b", cos: 0.7 }] },
      { file: "b", own: 0.9, others: [{ file: "a", cos: 0.86 }] },
      { file: "c", own: 0.88, others: [{ file: "d", cos: 0.6 }] },
    ];
    const rows = personalSweep(queries, [0.8, 0.85, 0.87, 0.9], [0, 0.02, 0.05]);
    const at = (t: number, m: number) => rows.find((r) => r.threshold === t && r.margin === m)!;
    expect(at(0.8, 0)).toMatchObject({ trueMatch: 1, falseMatch: 1 / 3 });
    expect(at(0.87, 0)).toMatchObject({ trueMatch: 1, falseMatch: 0 });
    expect(at(0.85, 0.05)).toMatchObject({ trueMatch: 2 / 3, falseMatch: 1 / 3 });
    expect(pickPersonal(rows)).toMatchObject({ threshold: 0.87, margin: 0.02, trueMatch: 1 });
  });

  it("combines personal sweeps by their worst case", () => {
    const row = (threshold: number, trueMatch: number, falseMatch: number) => ({ threshold, margin: 0.02, trueMatch, falseMatch, confused: 0 });
    const both = worstPersonal([
      [row(0.87, 1, 0.08), row(0.92, 1, 0)],
      [row(0.87, 0.9, 0), row(0.92, 0.8, 0)],
    ]);
    expect(both).toEqual([row(0.87, 0.9, 0.08), row(0.92, 0.8, 0)]);
    expect(pickPersonal(both)?.threshold).toBe(0.92);
  });

  it("counts a query that matches the wrong taught object as confused", () => {
    const rows = personalSweep([{ file: "a", own: 0.8, others: [{ file: "b", cos: 0.9 }] }], [0.85], [0]);
    expect(rows[0]).toMatchObject({ trueMatch: 0, confused: 1, falseMatch: 1 });
  });
});
