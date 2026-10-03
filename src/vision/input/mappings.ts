import type { InputAction } from "../../lib/types";

export type RingMode = "normal" | "review" | "scanning" | "autoscan";

export type RingCommand =
  | "capture"
  | "backchannel"
  | "queue"
  | "next"
  | "select"
  | "retake"
  | "cancel";

export const RING_MAPPINGS: Record<RingMode, Record<InputAction, RingCommand>> = {
  normal: { click: "capture", double: "backchannel", hold: "queue" },
  review: { click: "capture", double: "retake", hold: "queue" },
  scanning: { click: "next", double: "retake", hold: "select" },
  autoscan: { click: "select", double: "retake", hold: "cancel" },
};

export const RING_HINTS: Record<RingMode, string> = {
  normal: "click: take picture · double: quick reply · hold: queue sentence",
  review: "double: wrong? retake wider · click: next picture",
  scanning: "click: next · hold: choose · double: retake",
  autoscan: "click: choose · double: retake · hold: cancel",
};

export function commandFor(mode: RingMode, action: InputAction): RingCommand {
  return RING_MAPPINGS[mode][action];
}
