import type { InputAction } from "../../lib/types";

export type RingMode =
  | "normal"
  | "review"
  | "scanning"
  | "autoscan"
  | "message"
  | "pain"
  | "quick"
  | "intents"
  | "sentences"
  | "verbs"
  | "endings";

export type RingCommand =
  | "capture"
  | "backchannel"
  | "queue"
  | "next"
  | "select"
  | "retake"
  | "tapback"
  | "back"
  | "cancel";

export const RING_MAPPINGS: Record<RingMode, Record<InputAction, RingCommand>> = {
  normal: { click: "capture", double: "backchannel", hold: "queue" },
  review: { click: "capture", double: "retake", hold: "queue" },
  scanning: { click: "next", double: "retake", hold: "select" },
  autoscan: { click: "select", double: "retake", hold: "cancel" },
  // A text just arrived: the same double-click that says "Yes" in person sends a thumbs-up tapback.
  message: { click: "capture", double: "tapback", hold: "queue" },
  // Pain panel open: click steps the 1-10 level, hold sends it, double closes.
  pain: { click: "next", double: "cancel", hold: "select" },
  quick: { click: "next", double: "back", hold: "select" },
  intents: { click: "next", double: "back", hold: "select" },
  sentences: { click: "next", double: "back", hold: "select" },
  verbs: { click: "next", double: "back", hold: "select" },
  endings: { click: "next", double: "back", hold: "select" },
};

export const RING_HINTS: Record<RingMode, string> = {
  normal: "click: take picture · double: quick reply · hold: queue sentence",
  review: "double: wrong? retake wider · click: next picture",
  scanning: "click: next · hold: choose · double: retake",
  autoscan: "click: choose · double: retake · hold: cancel",
  message: "double: 👍 to their text · click: take picture · hold: queue sentence",
  pain: "click: next level · hold: send · double: close",
  quick: "click: next phrase · hold: say it · double: close",
  intents: "click: next · hold: choose · double: back",
  sentences: "click: next sentence · hold: say it · double: back to intents",
  verbs: "click: next word · hold: choose · double: back to sentences",
  endings: "click: next ending · hold: say it · double: back to words",
};

export function commandFor(mode: RingMode, action: InputAction): RingCommand {
  return RING_MAPPINGS[mode][action];
}
