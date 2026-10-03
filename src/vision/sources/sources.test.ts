import { describe, expect, it, vi } from "vitest";
import { CaptureTimeoutError, collectBurst } from "./types";
import { applyMatrix, orientMatrix, orientedSize, ROTATIONS, type Orientation } from "./orient";
import { JpegAssembler } from "./BleStillSource";
import { BLE_PKT_DATA, BLE_PKT_START } from "./bleLink";
import { parseButtonMessage } from "../input/types";
import { DEFAULT_SETTINGS, orientationFor, parseQuery } from "../settings";

function corners(w: number, h: number, o: Orientation) {
  const m = orientMatrix(w, h, o);
  return [
    applyMatrix(m, 0, 0),
    applyMatrix(m, w, 0),
    applyMatrix(m, w, h),
    applyMatrix(m, 0, h),
  ];
}

describe("orientation", () => {
  it("maps the frame onto the output canvas exactly for every rotation and flip", () => {
    const w = 640;
    const h = 480;
    for (const rotation of ROTATIONS) {
      for (const mirror of [false, true]) {
        const o = { rotation, mirror };
        const size = orientedSize(w, h, o);
        const pts = corners(w, h, o);
        const xs = pts.map((p) => p.x).sort((a, b) => a - b);
        const ys = pts.map((p) => p.y).sort((a, b) => a - b);
        expect([xs[0], xs[3], ys[0], ys[3]]).toEqual([0, size.w, 0, size.h]);
      }
    }
  });

  it("rotates 90 degrees clockwise", () => {
    const m = orientMatrix(640, 480, { rotation: 90, mirror: false });
    expect(applyMatrix(m, 0, 0)).toEqual({ x: 480, y: 0 });
    expect(applyMatrix(m, 0, 480)).toEqual({ x: 0, y: 0 });
  });

  it("flips horizontally before rotating", () => {
    const m = orientMatrix(640, 480, { rotation: 0, mirror: true });
    expect(applyMatrix(m, 0, 10)).toEqual({ x: 640, y: 10 });
  });
});

describe("BLE JPEG reassembly", () => {
  it("joins a start packet and data packets into one image", () => {
    const a = new JpegAssembler();
    const start = new DataView(new Uint8Array([BLE_PKT_START, 5, 0, 0, 0, 1, 2]).buffer);
    const mid = new DataView(new Uint8Array([BLE_PKT_DATA, 3, 4]).buffer);
    const end = new DataView(new Uint8Array([BLE_PKT_DATA, 5]).buffer);
    expect(a.push(start)).toBeNull();
    expect(a.busy()).toBe(true);
    expect(a.push(mid)).toBeNull();
    expect(Array.from(a.push(end) ?? [])).toEqual([1, 2, 3, 4, 5]);
    expect(a.busy()).toBe(false);
  });

  it("ignores data before a start packet", () => {
    const a = new JpegAssembler();
    expect(a.push(new DataView(new Uint8Array([BLE_PKT_DATA, 9]).buffer))).toBeNull();
    expect(a.busy()).toBe(false);
  });
});

describe("button messages", () => {
  it("accepts plain words and JSON", () => {
    expect(parseButtonMessage("click")).toBe("click");
    expect(parseButtonMessage('{"type":"button","action":"hold"}')).toBe("hold");
    expect(parseButtonMessage('{"type":"feedback"}')).toBeNull();
    expect(parseButtonMessage("nonsense")).toBeNull();
  });
});

describe("source settings from the URL", () => {
  it("selects a WebSocket source with orientation overrides", () => {
    const s = parseQuery("?source=ws&url=ws://10.0.0.5:81/&mode=still&hand=left&rotate=90&flip=1", DEFAULT_SETTINGS);
    expect(s.kind).toBe("ws");
    expect(s.wsUrl).toBe("ws://10.0.0.5:81/");
    expect(s.wsMode).toBe("still");
    expect(orientationFor(s)).toEqual({ rotation: 90, mirror: true });
  });

  it("defaults to the webcam with no rotation", () => {
    const s = parseQuery("", DEFAULT_SETTINGS);
    expect(s.kind).toBe("webcam");
    expect(orientationFor(s)).toEqual({ rotation: 0, mirror: false });
  });

  it("uses the hand preset for ring sources", () => {
    const s = parseQuery("?source=ble&hand=left", DEFAULT_SETTINGS);
    expect(orientationFor(s)).toEqual({ rotation: 180, mirror: false });
  });
});

describe("burst collection", () => {
  const fake = (n: number) => ({ n, close() {} }) as unknown as ImageBitmap;

  it("resolves as soon as the requested count arrives", async () => {
    vi.useFakeTimers();
    let push: (f: ImageBitmap) => void = () => {};
    const p = collectBurst({ count: 2, timeoutMs: 5000, gapMs: 500 }, (pu) => ((push = pu), () => {}));
    push(fake(1));
    push(fake(2));
    await expect(p).resolves.toHaveLength(2);
    vi.useRealTimers();
  });

  it("returns a partial burst when the ring stops sending", async () => {
    vi.useFakeTimers();
    let push: (f: ImageBitmap) => void = () => {};
    const p = collectBurst({ count: 5, timeoutMs: 5000, gapMs: 500 }, (pu) => ((push = pu), () => {}));
    push(fake(1));
    vi.advanceTimersByTime(600);
    await expect(p).resolves.toHaveLength(1);
    vi.useRealTimers();
  });

  it("finishes early on an end-of-burst signal", async () => {
    vi.useFakeTimers();
    let push: (f: ImageBitmap) => void = () => {};
    let end = () => {};
    const p = collectBurst({ count: 5, timeoutMs: 5000, gapMs: 500 }, (pu, en) => ((push = pu), (end = en), () => {}));
    push(fake(1));
    push(fake(2));
    end();
    await expect(p).resolves.toHaveLength(2);
    vi.useRealTimers();
  });

  it("times out with an error when nothing arrives", async () => {
    vi.useFakeTimers();
    const p = collectBurst({ count: 3, timeoutMs: 1000, gapMs: 500 }, () => () => {});
    vi.advanceTimersByTime(1001);
    await expect(p).rejects.toBeInstanceOf(CaptureTimeoutError);
    vi.useRealTimers();
  });
});
