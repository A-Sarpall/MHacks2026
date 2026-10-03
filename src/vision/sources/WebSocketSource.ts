import {
  StatusEmitter,
  collectBurst,
  decodeJpeg,
  type FrameSource,
  type SourceMode,
  type StatusInfo,
} from "./types";
import { wsLink, type WsLink } from "./wsLink";

export interface WebSocketSourceOptions {
  url: string;
  mode?: SourceMode;
  captureTimeoutMs?: number;
  burstGapMs?: number;
}

export function wsCaptureMessage(count: number): string {
  return JSON.stringify({ type: "capture", count });
}

interface Sink {
  push: (frame: ImageBitmap) => void;
  end: () => void;
  ending: boolean;
}

export class WebSocketSource implements FrameSource {
  readonly kind = "ws" as const;
  readonly label = "Wi-Fi camera";
  readonly mode: SourceMode;
  private link: WsLink;
  private status_ = new StatusEmitter();
  private cb: ((frame: ImageBitmap, time: number) => void) | null = null;
  private sink: Sink | null = null;
  private unsubs: (() => void)[] = [];
  private held = false;
  private decoding = 0;
  private timeoutMs: number;
  private gapMs: number;

  constructor(opts: WebSocketSourceOptions) {
    this.mode = opts.mode ?? "stream";
    this.link = wsLink(opts.url);
    this.timeoutMs = opts.captureTimeoutMs ?? 5000;
    this.gapMs = opts.burstGapMs ?? 600;
  }

  status(): StatusInfo {
    return this.status_.get();
  }

  onStatus(cb: (info: StatusInfo) => void): () => void {
    return this.status_.on(cb);
  }

  onFrame(cb: ((frame: ImageBitmap, time: number) => void) | null): void {
    this.cb = cb;
  }

  async start(): Promise<void> {
    if (this.held) return;
    this.unsubs.push(
      this.link.onStatus((info) => this.status_.set(info.status, info.message)),
      this.link.onBinary((data) => void this.receive(data)),
      this.link.onText((text) => {
        if (!text.includes('"burst-end"') || !this.sink) return;
        this.sink.ending = true;
        this.flushEnd();
      })
    );
    this.held = true;
    this.link.acquire();
    const info = this.link.status();
    this.status_.set(info.status, info.message);
  }

  stop(): void {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    if (this.held) this.link.release();
    this.held = false;
    this.sink = null;
    this.status_.set("idle");
  }

  feedback(kind: string): void {
    this.link.send(JSON.stringify({ type: "feedback", kind }));
  }

  async capture(): Promise<ImageBitmap> {
    const [first, ...rest] = await this.captureBurst(1);
    rest.forEach((f) => f.close());
    return first;
  }

  async captureBurst(count: number): Promise<ImageBitmap[]> {
    if (this.link.status().status !== "live") {
      throw new Error("Wi-Fi camera is not connected");
    }
    return collectBurst({ count, timeoutMs: this.timeoutMs, gapMs: this.gapMs }, (push, end) => {
      const sink: Sink = { push, end, ending: false };
      this.sink = sink;
      if (this.mode === "still") this.link.send(wsCaptureMessage(count));
      return () => {
        if (this.sink === sink) this.sink = null;
      };
    });
  }

  private flushEnd(): void {
    if (this.sink?.ending && this.decoding === 0) this.sink.end();
  }

  private async receive(data: ArrayBuffer): Promise<void> {
    if (!this.sink && (!this.cb || this.decoding > 0)) return;
    this.decoding++;
    try {
      const frame = await decodeJpeg(data);
      if (this.sink) this.sink.push(frame);
      else if (this.cb) this.cb(frame, performance.now());
      else frame.close();
    } catch (err) {
      console.warn("[ws-source] bad frame", err);
    } finally {
      this.decoding--;
      this.flushEnd();
    }
  }
}
