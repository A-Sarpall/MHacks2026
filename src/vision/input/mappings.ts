import type { InputAction } from "../../lib/types";

export type RingMode = "normal" | "review" | "scanning" | "autoscan" | "message" | "pain";

export type RingCommand =
  | "capture"
  | "backchannel"
  | "yes"
  | "queue"
  | "next"
  | "select"
  | "retake"
  | "tapback"
  | "cancel";

export const RING_MAPPINGS: Record<RingMode, Record<InputAction, RingCommand>> = {
  normal: { click: "capture", double: "yes", hold: "queue" },
  review: { click: "capture", double: "retake", hold: "queue" },
  scanning: { click: "next", double: "retake", hold: "select" },
  autoscan: { click: "select", double: "retake", hold: "cancel" },
  // A text just arrived: the same double-click that says "Yes" in person sends a thumbs-up tapback.
  message: { click: "capture", double: "tapback", hold: "queue" },
  // Pain panel open: click steps the 1-10 level, hold sends it, double closes.
  pain: { click: "next", double: "cancel", hold: "select" },
};

export const RING_HINTS: Record<RingMode, string> = {
  normal: "click: take picture · double: Yes! · hold: queue sentence",
  review: "double: wrong? retake wider · click: next picture",
  scanning: "click: next · hold: choose · double: retake",
  autoscan: "click: choose · double: retake · hold: cancel",
  message: "double: 👍 to their text · click: take picture · hold: queue sentence",
  pain: "click: next level · hold: send · double: close",
};

export function commandFor(mode: RingMode, action: InputAction): RingCommand {
  return RING_MAPPINGS[mode][action];
}
