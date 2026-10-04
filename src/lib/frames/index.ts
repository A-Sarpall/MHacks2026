import { modelFrameProvider } from "./model";
import { profileFrameProvider } from "./profileFrames";
import type { FrameProvider } from "./frame";

export * from "./frame";
export { resolveFrame, type Resolved } from "./resolve";
export { profileFrame, profileFrameProvider } from "./profileFrames";
export { modelFrame, modelFrameProvider } from "./model";

const QUERY = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);

export const FRAME_TIMEOUT_MS = 8000;

export function activeFrameProviders(choice: string | null = QUERY.get("frames")): FrameProvider[] {
  if (choice === "profile") return [profileFrameProvider];
  if (choice === "model") return [modelFrameProvider];
  return [modelFrameProvider, profileFrameProvider];
}
