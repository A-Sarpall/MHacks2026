import type { Backchannel } from "./types";

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakNow(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    currentUtterance = utterance;
    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };
    utterance.onerror = (e) => {
      currentUtterance = null;
      reject(e);
    };
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
