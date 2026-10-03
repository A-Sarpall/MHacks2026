import type { SourceSettings } from "../settings";
import { BleStillSource } from "./BleStillSource";
import { FileSource } from "./FileSource";
import { WebcamSource } from "./WebcamSource";
import { WebSocketSource } from "./WebSocketSource";
import type { FrameSource } from "./types";

export * from "./types";
export * from "./orient";
export { WebcamSource } from "./WebcamSource";
export { FileSource, pickImageFiles } from "./FileSource";
export { WebSocketSource } from "./WebSocketSource";
export { BleStillSource, JpegAssembler } from "./BleStillSource";
export { RING_BLE, ringBle } from "./bleLink";

export function createSource(s: SourceSettings, opts: { deviceId?: string } = {}): FrameSource {
  switch (s.kind) {
    case "webcam":
      return new WebcamSource({ deviceId: opts.deviceId });
    case "ws":
      return new WebSocketSource({ url: s.wsUrl, mode: s.wsMode });
    case "ble":
      return new BleStillSource();
    case "file":
      return new FileSource();
  }
}
