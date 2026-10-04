import type { Backchannel } from "./types";

let currentUtterance: SpeechSynthesisUtterance | null = null;
let rate = 0.95;

export function setSpeechRate(r: number): void {
  rate = Math.min(2, Math.max(0.5, r));
}

export function speechRate(): number {
  return rate;
}

export function speakNow(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    currentUtterance = utterance;
    // Some systems never fire onend (no voices installed) — don't hang the UI
    const safety = setTimeout(
      () => finish(),
      3000 + text.split(/\s+/).length * 600
    );
    const finish = (err?: unknown) => {
      clearTimeout(safety);
      if (currentUtterance === utterance) currentUtterance = null;
      if (err) reject(err);
      else resolve();
    };
    utterance.onend = () => finish();
    utterance.onerror = (e) =>
      // "interrupted"/"canceled" just mean another utterance took over
      e.error === "interrupted" || e.error === "canceled" ? finish() : finish(e);
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return currentUtterance !== null;
}

// Backchannels use SpeechSynthesis with short, punchy delivery
const BACKCHANNEL_TEXT: Record<Backchannel, string> = {
  yes: "Yes!",
  no: "No.",
  haha: "Ha ha!",
  "mm-hmm": "Mm hmm.",
  wait: "Wait.",
  "hold-on": "Hold on.",
  wow: "Wow!",
  okay: "Okay.",
  thanks: "Thanks!",
};

export function playBackchannel(id: Backchannel): void {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(BACKCHANNEL_TEXT[id]);
  utterance.rate = 1.3;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

// TTS interface for swapping to ElevenLabs later
export interface TTSEngine {
  speak(text: string): Promise<void>;
  stop(): void;
  playBackchannel(id: Backchannel): void;
}

export const browserTTS: TTSEngine = {
  speak: speakNow,
  stop: stopSpeaking,
  playBackchannel,
};
