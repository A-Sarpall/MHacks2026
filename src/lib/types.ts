export type InputAction = "click" | "double" | "hold";

// Pixel box in video-frame coordinates (unmirrored)
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

// One detector output for one frame
export interface RawDetection {
  label: string;
  score: number;
  box: Box;
}

// A detection followed across frames by the tracker
export interface TrackedObject {
  id: number;
  label: string;
  score: number;
  box: Box;
  hits: number;
  misses: number;
}

export interface LabelGuess {
  label: string;
  score: number;
  source: "detector" | "classifier" | "claude" | "vocab" | "personal";
}

// An object the user captured and identified; shown as a tile
export interface CapturedObject {
  id: string;
  label: string;
  confidence: number;
  source: LabelGuess["source"] | "manual";
  alternatives: LabelGuess[];
  thumbnail: string; // data URL of the crop
  refining: boolean; // waiting on Claude vision
}

export type CueStatus =
  | "loading"
  | "idle"
  | "identifying"
  | "composing"
  | "speaking"
  | "queued";

export interface CueState {
  status: CueStatus;
  captures: CapturedObject[];
  selectedTileIds: string[];
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
  "hold-on",
  "wow",
  "okay",
  "thanks",
] as const;

export type Backchannel = (typeof BACKCHANNELS)[number];
