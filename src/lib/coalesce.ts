export interface Offer {
  action: "send" | "hold";
  text: string;
  count: number;
}

export class RepeatCoalescer {
  private last: { text: string; at: number; count: number; held: number; reportedAt: number } | null = null;
  private windowMs: number;
  private updateMs: number;

  constructor(windowMs = 120_000, updateMs = 30_000) {
    this.windowMs = windowMs;
    this.updateMs = updateMs;
  }

  offer(text: string, now: number): Offer {
    const l = this.last;
    if (l && l.text === text && now - l.at < this.windowMs) {
      l.at = now;
      l.count++;
      l.held++;
      return { action: "hold", text, count: l.count };
    }
    this.last = { text, at: now, count: 1, held: 0, reportedAt: now };
    return { action: "send", text, count: 1 };
  }

  flush(now: number): string | null {
    const l = this.last;
    if (!l || l.held === 0 || now - l.reportedAt < this.updateMs) return null;
    l.held = 0;
    l.reportedAt = now;
    return `${l.text} (said ${l.count} times)`;
  }

  pending(): boolean {
    return (this.last?.held ?? 0) > 0;
  }

  nextUpdateIn(now: number): number {
    const l = this.last;
    if (!l) return this.updateMs;
    return Math.max(0, this.updateMs - (now - l.reportedAt));
  }
}
