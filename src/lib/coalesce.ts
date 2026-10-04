export interface Offer {
  action: "send" | "hold";
  text: string;
  count: number;
}

export class RepeatCoalescer {
  private last: { text: string; at: number; count: number; held: number } | null = null;

  private windowMs: number;
  private quietMs: number;

  constructor(windowMs = 120_000, quietMs = 30_000) {
    this.windowMs = windowMs;
    this.quietMs = quietMs;
  }

  offer(text: string, now: number): Offer {
    const l = this.last;
    if (l && l.text === text && now - l.at < this.windowMs) {
      l.at = now;
      l.count++;
      l.held++;
      return { action: "hold", text, count: l.count };
    }
    this.last = { text, at: now, count: 1, held: 0 };
    return { action: "send", text, count: 1 };
  }

  flush(now: number): string | null {
    const l = this.last;
    if (!l || l.held === 0 || now - l.at < this.quietMs) return null;
    const summary = `${l.text} (said ${l.count} times)`;
    l.held = 0;
    return summary;
  }

  pending(): boolean {
    return (this.last?.held ?? 0) > 0;
  }

  quietDelay(): number {
    return this.quietMs;
  }
}
