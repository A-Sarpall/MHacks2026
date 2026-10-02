export type InputAction = "click" | "double" | "hold";

export interface Detection {
  label: string;
  confidence: number;
}

export type CueStatus =
  | "idle"
  | "detecting"
  | "composing"
  | "speaking"
  | "queued";

export interface CueState {
  status: CueStatus;
  detections: Detection[];
  selectedTiles: string[];
  selectedCoreWords: string[];
  candidates: string[];
  queuedSentence: string | null;
}

export const CORE_WORDS = [
  "want",
  "no",
  "more",
  "go",
  "help",
  "yes",
  "question",
] as const;

export type CoreWord = (typeof CORE_WORDS)[number];

export const BACKCHANNELS = [
  "yes",
  "no",
  "haha",
  "mm-hmm",
  "wait",
  "wow",
  "okay",
  "thanks",
] as const;

export type Backchannel = (typeof BACKCHANNELS)[number];
