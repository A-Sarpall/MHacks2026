import type { FrameInput, FrameProvider, SentenceFrame } from "./frame";

export async function modelFrame(input: FrameInput, signal: AbortSignal): Promise<SentenceFrame | null> {
  void input;
  void signal;
  return null;
}

export const modelFrameProvider: FrameProvider = {
  id: "model",
  frame: modelFrame,
};
