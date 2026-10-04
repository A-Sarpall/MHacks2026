import type { InputAction } from "../../lib/types";
import type { ButtonInput, FeedbackKind } from "./types";

export class InputHub {
  private inputs: ButtonInput[] = [];
  private handler: ((action: InputAction, from: string) => void) | null = null;
  private local: ((kind: FeedbackKind) => void) | null = null;

  setInputs(inputs: ButtonInput[]): void {
    const keep = new Set(inputs);
    for (const old of this.inputs) if (!keep.has(old)) old.stop();
    const fresh = inputs.filter((i) => !this.inputs.includes(i));
    this.inputs = inputs;
    if (this.handler) for (const i of fresh) this.startOne(i);
  }

  list(): ButtonInput[] {
    return this.inputs;
  }

  start(handler: (action: InputAction, from: string) => void): void {
    this.handler = handler;
    for (const i of this.inputs) this.startOne(i);
  }

  stop(): void {
    this.handler = null;
    for (const i of this.inputs) i.stop();
  }

  setLocalFeedback(fn: ((kind: FeedbackKind) => void) | null): void {
    this.local = fn;
  }

  feedback(kind: FeedbackKind): void {
    for (const i of this.inputs) i.feedback?.(kind);
    this.local?.(kind);
  }

  private startOne(i: ButtonInput): void {
    i.start((action) => this.handler?.(action, i.id));
  }
}

let audio: AudioContext | null = null;

const TONES: Record<FeedbackKind, { hz: number; ms: number; vibrate: number[] }> = {
  "on-target": { hz: 880, ms: 60, vibrate: [30] },
  captured: { hz: 660, ms: 90, vibrate: [60] },
  highlight: { hz: 520, ms: 40, vibrate: [15] },
  select: { hz: 990, ms: 120, vibrate: [40, 40, 40] },
  error: { hz: 220, ms: 250, vibrate: [200] },
};

export function browserFeedback(kind: FeedbackKind): void {
  const tone = TONES[kind];
  navigator.vibrate?.(tone.vibrate);
  try {
    audio ??= new AudioContext();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.value = tone.hz;
    gain.gain.setValueAtTime(0.08, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + tone.ms / 1000);
    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + tone.ms / 1000);
  } catch {
    return;
  }
}
