import {
  StatusEmitter,
  collectBurst,
  decodeJpeg,
  type FrameSource,
  type StatusInfo,
} from "./types";
import {
  BLE_CMD_CAPTURE,
  BLE_PKT_DATA,
  BLE_PKT_END,
  BLE_PKT_START,
  RING_BLE,
  ringBle,
  type BleLink,
} from "./bleLink";

export class JpegAssembler {
  private buf: Uint8Array | null = null;
  private filled = 0;

  busy(): boolean {
    return this.buf !== null;
  }

  reset(): void {
    this.buf = null;
    this.filled = 0;
  }

  push(packet: DataView): Uint8Array | null {
    if (packet.byteLength === 0) return null;
    const type = packet.getUint8(0);
    if (type === BLE_PKT_START) {
      if (packet.byteLength < 5) return null;
      const total = packet.getUint32(1, true);
      this.buf = new Uint8Array(total);
      this.filled = 0;
      return this.append(new Uint8Array(packet.buffer, packet.byteOffset + 5, packet.byteLength - 5));
    }
    if (type === BLE_PKT_DATA && this.buf) {
      return this.append(new Uint8Array(packet.buffer, packet.byteOffset + 1, packet.byteLength - 1));
    }
    return null;
  }

  private append(bytes: Uint8Array): Uint8Array | null {
    if (!this.buf) return null;
    const n = Math.min(bytes.length, this.buf.length - this.filled);
    this.buf.set(bytes.subarray(0, n), this.filled);
    this.filled += n;
    if (this.filled < this.buf.length) return null;
    const done = this.buf;
    this.reset();
    return done;
  }
}

export class BleStillSource implements FrameSource {
  readonly kind = "ble" as const;
  readonly label = "Bluetooth ring";
  readonly mode = "still" as const;
  private link: BleLink = ringBle();
  private status_ = new StatusEmitter();
  private assembler = new JpegAssembler();
  private sink: { push: (jpeg: Uint8Array) => void; end: () => void } | null = null;
  private unsubs: (() => void)[] = [];
  private held = false;
  private pushed: { jpegs: Uint8Array[]; at: number } | null = null;
  private timeoutMs: number;
  private gapMs: number;

  constructor(timeoutMs = 8000, gapMs = 1500) {
    this.timeoutMs = timeoutMs;
    this.gapMs = gapMs;
  }

  status(): StatusInfo {
    return this.status_.get();
  }

  onStatus(cb: (info: StatusInfo) => void): () => void {
    return this.status_.on(cb);
  }

  async start(): Promise<void> {
    if (this.held) return;
    this.unsubs.push(
      this.link.onStatus((info) => this.status_.set(info.status, info.message)),
      this.link.on(RING_BLE.imageData, (v) => {
        if (v.byteLength > 0 && v.getUint8(0) === BLE_PKT_END) {
          this.sink?.end();
          return;
        }
        const jpeg = this.assembler.push(v);
        if (!jpeg) return;
        if (this.sink) {
          this.sink.push(jpeg);
          return;
        }
        const now = performance.now();
        const prev = this.pushed && now - this.pushed.at < PUSHED_FRESH_MS ? this.pushed.jpegs : [];
        this.pushed = { jpegs: [...prev, jpeg].slice(-MAX_PUSHED), at: now };
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

  pair(): Promise<void> {
    return this.link.pair();
  }

  async capture(): Promise<ImageBitmap> {
    const [first, ...rest] = await this.captureBurst(1);
    rest.forEach((f) => f.close());
    return first;
  }

  async captureBurst(count: number): Promise<ImageBitmap[]> {
    const pushed = this.pushed;
    this.pushed = null;
    if (pushed && performance.now() - pushed.at < PUSHED_FRESH_MS) {
      return Promise.all(pushed.jpegs.slice(-count).map(toBitmap));
    }
    if (this.link.status().status !== "live") throw new Error("Ring is not connected over Bluetooth");
    const inFlight = this.assembler.busy();
    const burst = collectBurst<Uint8Array>(
      { count, timeoutMs: this.timeoutMs, gapMs: this.gapMs },
      (push, end) => {
        const sink = { push, end };
        this.sink = sink;
        return () => {
          if (this.sink === sink) this.sink = null;
          this.assembler.reset();
        };
      },
      () => {}
    );
    if (!inFlight && !(await this.link.write(RING_BLE.imageControl, [BLE_CMD_CAPTURE, count]))) {
      burst.catch(() => {});
      this.sink = null;
      throw new Error("Could not ask the ring for a picture");
    }
    const jpegs = await burst;
    return Promise.all(jpegs.map(toBitmap));
  }
}

const PUSHED_FRESH_MS = 1500;
const MAX_PUSHED = 5;

function toBitmap(bytes: Uint8Array): Promise<ImageBitmap> {
  return decodeJpeg(new Blob([bytes as Uint8Array<ArrayBuffer>], { type: "image/jpeg" }));
}
