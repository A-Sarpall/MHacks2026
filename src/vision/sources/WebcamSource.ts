import { StatusEmitter, type FrameSource, type StatusInfo } from "./types";

export interface WebcamOptions {
  deviceId?: string;
  width?: number;
  height?: number;
}

const RETRY_MS = [500, 1000, 2000, 4000];

export class WebcamSource implements FrameSource {
  readonly kind = "webcam" as const;
  readonly label = "Webcam";
  readonly mode = "stream" as const;
  private status_ = new StatusEmitter();
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private cb: ((frame: ImageBitmap, time: number) => void) | null = null;
  private running = false;
  private pending = false;
  private lastTime = -1;
  private raf = 0;
  private vfc = 0;
  private retry = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  private opts: WebcamOptions;

  constructor(opts: WebcamOptions = {}) {
    this.opts = opts;
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
    this.running = true;
    await this.open();
  }

  stop(): void {
    this.running = false;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
    this.close();
    this.status_.set("idle");
  }

  static async devices(): Promise<MediaDeviceInfo[]> {
    const all = await navigator.mediaDevices.enumerateDevices();
    return all.filter((d) => d.kind === "videoinput");
  }

  private async open(): Promise<void> {
    this.status_.set(this.retry > 0 ? "reconnecting" : "connecting");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: this.opts.width ?? 640 },
          height: { ideal: this.opts.height ?? 480 },
          ...(this.opts.deviceId ? { deviceId: { exact: this.opts.deviceId } } : {}),
        },
        audio: false,
      });
      if (!this.running) {
        s.getTracks().forEach((t) => t.stop());
        return;
      }
      this.stream = s;
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.srcObject = s;
      await video.play();
      if (!this.running) {
        this.close();
        return;
      }
      this.video = video;
      for (const track of s.getVideoTracks()) {
        track.addEventListener("ended", () => this.lost("Camera disconnected"));
      }
      this.retry = 0;
      this.status_.set("live");
      this.schedule();
    } catch (err) {
      if (!this.running) return;
      const name = (err as DOMException)?.name;
      if (name === "NotAllowedError") {
        this.status_.set(
          "error",
          "Camera permission was denied. Allow camera access in the address bar and reload."
        );
        return;
      }
      if (name === "NotFoundError" && this.retry === 0) {
        this.status_.set("error", "No camera found.");
        this.scheduleRetry();
        return;
      }
      this.lost(`Could not start camera: ${String((err as Error)?.message ?? err)}`);
    }
  }

  private lost(message: string): void {
    if (!this.running) return;
    this.close();
    this.status_.set("reconnecting", message);
    this.scheduleRetry();
  }

  private scheduleRetry(): void {
    const delay = RETRY_MS[Math.min(this.retry, RETRY_MS.length - 1)];
    this.retry++;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (this.running) void this.open();
    }, delay);
  }

  private close(): void {
    cancelAnimationFrame(this.raf);
    if (this.video && "cancelVideoFrameCallback" in this.video) {
      this.video.cancelVideoFrameCallback(this.vfc);
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    if (this.video) this.video.srcObject = null;
    this.video = null;
  }

  private schedule(): void {
    const video = this.video;
    if (!video || !this.running) return;
    if ("requestVideoFrameCallback" in video) {
      this.vfc = video.requestVideoFrameCallback(() => this.tick());
    } else {
      this.raf = requestAnimationFrame(() => this.tick());
    }
  }

  private tick(): void {
    const video = this.video;
    if (!video || !this.running) return;
    this.schedule();
    if (!this.cb || this.pending || video.readyState < 2 || video.videoWidth === 0) return;
    if (video.currentTime === this.lastTime) return;
    this.lastTime = video.currentTime;
    this.pending = true;
    const time = performance.now();
    createImageBitmap(video)
      .then((bmp) => {
        if (this.cb && this.running) this.cb(bmp, time);
        else bmp.close();
      })
      .catch(() => {})
      .finally(() => {
        this.pending = false;
      });
  }
}
