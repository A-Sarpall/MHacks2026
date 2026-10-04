import type { InputAction } from "../../lib/types";

export type RingMode = "normal" | "review" | "scanning" | "autoscan" | "message" | "help";

export type RingCommand =
  | "capture"
  | "backchannel"
  | "queue"
  | "next"
  | "select"
  | "retake"
  | "tapback"
  | "cancel";

export const RING_MAPPINGS: Record<RingMode, Record<InputAction, RingCommand>> = {
  normal: { click: "capture", double: "backchannel", hold: "queue" },
  review: { click: "capture", double: "retake", hold: "queue" },
  scanning: { click: "next", double: "retake", hold: "select" },
  autoscan: { click: "select", double: "retake", hold: "cancel" },
  // A text just arrived: the same double-click that says "Yes" in person sends a thumbs-up tapback.
  message: { click: "capture", double: "tapback", hold: "queue" },
  // "I need help" panel open: click says it aloud, hold texts the first contact, double closes.
  help: { click: "next", double: "cancel", hold: "select" },
};

export const RING_HINTS: Record<RingMode, string> = {
  normal: "click: take picture · double: quick reply · hold: queue sentence",
  review: "double: wrong? retake wider · click: next picture",
  scanning: "click: next · hold: choose · double: retake",
  autoscan: "click: choose · double: retake · hold: cancel",
  message: "double: 👍 to their text · click: take picture · hold: queue sentence",
  help: "click: say it aloud · hold: text your first contact · double: close",
};

export function commandFor(mode: RingMode, action: InputAction): RingCommand {
  return RING_MAPPINGS[mode][action];
}
