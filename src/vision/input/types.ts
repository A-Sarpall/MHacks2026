import type { InputAction } from "../../lib/types";
import type { StatusInfo } from "../sources/types";

export type FeedbackKind = "on-target" | "captured" | "highlight" | "select" | "error";

export interface ButtonInput {
  readonly id: string;
  readonly label: string;
  start(handler: (action: InputAction) => void): void;
  stop(): void;
  status?(): StatusInfo;
  onStatus?(cb: (info: StatusInfo) => void): () => void;
  feedback?(kind: FeedbackKind): void;
  pair?(): Promise<void>;
}

export const FEEDBACK_CODES: Record<FeedbackKind, number> = {
  "on-target": 1,
  captured: 2,
  highlight: 3,
  select: 4,
  error: 5,
};

export function parseButtonMessage(text: string): InputAction | null {
  const t = text.trim();
  if (t === "click" || t === "double" || t === "hold") return t;
  try {
    const msg = JSON.parse(t) as { type?: unknown; action?: unknown };
    if (msg.type === "button" && (msg.action === "click" || msg.action === "double" || msg.action === "hold")) {
      return msg.action;
    }
  } catch {
    return null;
  }
  return null;
}

export const BUTTON_BYTES: Record<number, InputAction> = { 1: "click", 2: "double", 3: "hold" };
