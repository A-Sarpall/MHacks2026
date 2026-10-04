import type { InputAction } from "../../lib/types";

export type RingMode =
  | "normal"
  | "review"
  | "scanning"
  | "autoscan"
  | "message"
  | "help"
  | "quick"
  | "intents"
  | "sentences"
  | "slot";

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
  // "I need help" panel open: click says it aloud, hold texts the selected people (else the first contact), double closes.
  help: { click: "next", double: "cancel", hold: "select" },
  quick: { click: "next", double: "back", hold: "select" },
  intents: { click: "next", double: "back", hold: "select" },
  sentences: { click: "next", double: "back", hold: "select" },
  slot: { click: "next", double: "back", hold: "select" },
};

export const RING_HINTS: Record<RingMode, string> = {
  normal: "Space (click): take picture · D (double): quick reply · H (hold): queue sentence",
  review: "D (double): wrong? retake wider · Space (click): next picture",
  scanning: "Space (click): next · H (hold): choose · D (double): retake",
  autoscan: "Space (click): choose · D (double): retake · H (hold): cancel",
  message: "D (double): 👍 to their text · Space (click): take picture · H (hold): queue sentence",
  help: "Space (click): say it aloud · H (hold): text the selected people · D (double): close",
  quick: "Space (click): next phrase · H (hold): say it · D (double): close",
  intents: "Space (click): next · H (hold): choose · D (double): back",
  sentences: "Space (click): next · H (hold): choose · D (double): back to intents",
  slot: "Space (click): next choice · H (hold): choose (the last one says it) · D (double): back",
};

export function commandFor(mode: RingMode, action: InputAction): RingCommand {
  return RING_MAPPINGS[mode][action];
}
