import { describe, expect, it } from "vitest";
import { RepeatCoalescer } from "./coalesce";

describe("repeat coalescing", () => {
  it("sends a message the first time and holds identical repeats inside the window", () => {
    const c = new RepeatCoalescer(120_000, 30_000);
    expect(c.offer("Stop", 0)).toEqual({ action: "send", text: "Stop", count: 1 });
    expect(c.offer("Stop", 5_000)).toEqual({ action: "hold", text: "Stop", count: 2 });
    expect(c.offer("Stop", 9_000)).toEqual({ action: "hold", text: "Stop", count: 3 });
    expect(c.pending()).toBe(true);
  });

  it("summarises held repeats once the user has been quiet", () => {
    const c = new RepeatCoalescer(120_000, 30_000);
    c.offer("Stop", 0);
    c.offer("Stop", 5_000);
    c.offer("Stop", 9_000);
    expect(c.flush(20_000)).toBeNull();
    expect(c.flush(39_001)).toBe("Stop (said 3 times)");
    expect(c.flush(60_000)).toBeNull();
    expect(c.pending()).toBe(false);
  });

  it("a different message goes out at once and starts a new run", () => {
    const c = new RepeatCoalescer(120_000, 30_000);
    c.offer("Stop", 0);
    c.offer("Stop", 5_000);
    expect(c.offer("I need a break", 6_000)).toEqual({ action: "send", text: "I need a break", count: 1 });
  });

  it("the same message after the window is a fresh send", () => {
    const c = new RepeatCoalescer(120_000, 30_000);
    c.offer("Stop", 0);
    expect(c.offer("Stop", 130_000)).toEqual({ action: "send", text: "Stop", count: 1 });
  });
});
