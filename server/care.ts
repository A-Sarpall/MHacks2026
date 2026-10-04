// Care state the agents work from: when as-needed medicines were last taken (FinchNode has no
// administration times, so Qu keeps its own log), what the user said today, and pain reports.
// In memory on purpose: it is demo state, reseeded on every hub start.
import type { Med, Profile } from "./meds.ts";

export interface PainEvent {
  id: string;
  level: number | null;
  at: number;
}

export interface PrnStatus {
  name: string;
  strength: string | null;
  reason: string | null;
  intervalHours: number | null;
  lastTakenAt: number | null;
  hoursSince: number | null;
}

const PAIN_WORDS = /pain|ache|arthritis|knee|head|sore|migraine/i;
const HOUR = 3_600_000;

export class CareState {
  private doses = new Map<string, number>(); // med key -> last taken (ms)
  private said: { text: string; at: number }[] = [];
  private pain: { event: PainEvent; delivered: boolean }[] = [];
  private seq = 0;

  recordDose(key: string, at = Date.now()): void {
    this.doses.set(key.toLowerCase(), at);
  }

  lastDose(key: string): number | null {
    return this.doses.get(key.toLowerCase()) ?? null;
  }

  /** Demo data: the FinchNode record has no dose times, so pretend the as-needed pain medicine was last taken 9 h ago. */
  seedDemo(p: Profile, now = Date.now()): void {
    for (const m of p.meds) if (m.prn && PAIN_WORDS.test(m.reason ?? "") && !this.doses.has(m.key)) this.doses.set(m.key, now - 9 * HOUR);
  }

  logSaid(text: string, at = Date.now()): void {
    if (text.trim()) this.said = [...this.said, { text: text.trim(), at }].slice(-50);
  }

  enqueuePain(level: number | null, at = Date.now()): PainEvent {
    const event = { id: `pain_${++this.seq}`, level, at };
    this.pain.push({ event, delivered: false });
    return event;
  }

  /** The Care agent polls this; each pain report is handed out once. */
  nextPain(): PainEvent | null {
    const p = this.pain.find((x) => !x.delivered);
    if (!p) return null;
    p.delivered = true;
    return p.event;
  }

  prnStatus(meds: Med[], now = Date.now()): PrnStatus[] {
    return meds
      .filter((m) => m.prn)
      .map((m) => {
        const last = this.lastDose(m.key);
        return {
          name: m.short,
          strength: m.strength,
          reason: m.reason,
          intervalHours: m.intervalHours,
          lastTakenAt: last,
          hoursSince: last === null ? null : Math.round(((now - last) / HOUR) * 10) / 10,
        };
      });
  }

  summary(p: Profile, now = Date.now()) {
    const startOfDay = new Date(now).setHours(0, 0, 0, 0);
    return {
      patient: p.name,
      age: p.age,
      conditions: p.conditions,
      allergies: p.allergies,
      activeMedicines: p.meds.filter((m) => !m.prn).length,
      asNeeded: this.prnStatus(p.meds, now),
      saidRecently: this.said.slice(-6).map((s) => ({ text: s.text, minutesAgo: Math.round((now - s.at) / 60_000) })),
      painToday: this.pain.filter((x) => x.event.at >= startOfDay).map((x) => ({ level: x.event.level, minutesAgo: Math.round((now - x.event.at) / 60_000) })),
    };
  }
}
