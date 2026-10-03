export type SourceMode = "stream" | "still";

export type SourceKind = "webcam" | "ws" | "ble" | "file";

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "live"
  | "reconnecting"
  | "error";

export interface StatusInfo {
  status: ConnectionStatus;
  message?: string;
}

export interface FrameSource {
  readonly kind: SourceKind;
  readonly label: string;
  readonly mode: SourceMode;
  start(): Promise<void>;
  stop(): void;
  onFrame?(cb: ((frame: ImageBitmap, time: number) => void) | null): void;
  capture?(): Promise<ImageBitmap>;
  captureBurst?(count: number): Promise<ImageBitmap[]>;
  pair?(): Promise<void>;
  status(): StatusInfo;
  onStatus(cb: (info: StatusInfo) => void): () => void;
}

export class StatusEmitter {
  private info: StatusInfo = { status: "idle" };
  private listeners = new Set<(info: StatusInfo) => void>();

  get(): StatusInfo {
    return this.info;
  }

  set(status: ConnectionStatus, message?: string): void {
    if (this.info.status === status && this.info.message === message) return;
    this.info = { status, message };
    for (const l of this.listeners) l(this.info);
  }

  on(cb: (info: StatusInfo) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

export class CaptureTimeoutError extends Error {
  constructor(ms: number) {
    super(`No picture arrived within ${Math.round(ms / 1000)} s`);
    this.name = "CaptureTimeoutError";
  }
}

export function withTimeout<T>(p: Promise<T>, ms: number, onTimeout?: () => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => {
      onTimeout?.();
      reject(new CaptureTimeoutError(ms));
    }, ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e: unknown) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

export async function decodeJpeg(data: ArrayBuffer | Blob): Promise<ImageBitmap> {
  const blob = data instanceof Blob ? data : new Blob([data], { type: "image/jpeg" });
  return createImageBitmap(blob);
}

export interface BurstOptions {
  count: number;
  timeoutMs: number;
  gapMs: number;
}

export function collectBurst<T = ImageBitmap>(
  opts: BurstOptions,
  register: (push: (item: T) => void, end: () => void) => () => void,
  dispose: (item: T) => void = (item) => (item as { close?: () => void }).close?.()
): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    const items: T[] = [];
    const started = performance.now();
    let last = started;
    let slowest = 0;
    let gap: ReturnType<typeof setTimeout> | null = null;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(total);
      if (gap) clearTimeout(gap);
      unregister();
      if (items.length > 0) resolve(items);
      else reject(new CaptureTimeoutError(opts.timeoutMs));
    };
    const total = setTimeout(finish, opts.timeoutMs);
    const unregister = register(
      (item) => {
        if (done) {
          dispose(item);
          return;
        }
        items.push(item);
        if (items.length >= opts.count) return finish();
        const now = performance.now();
        slowest = Math.max(slowest, now - last);
        last = now;
        if (gap) clearTimeout(gap);
        gap = setTimeout(finish, Math.max(opts.gapMs, slowest * 1.5));
      },
      () => {
        if (items.length > 0) finish();
      }
    );
  });
}

export async function captureFrames(source: FrameSource, count: number): Promise<ImageBitmap[]> {
  if (count > 1 && source.captureBurst) return source.captureBurst(count);
  if (source.capture) return [await source.capture()];
  throw new Error(`${source.label} cannot take pictures on demand`);
}
