import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { detectImageFrame, isDetectorReady } from "../lib/detect";
import { Tracker } from "../lib/tracker";
import type { Box, TrackedObject } from "../lib/types";
import {
  IDENTITY,
  WebcamSource,
  captureFrames,
  orientFrame,
  withTimeout,
  type FrameSource,
  type Orientation,
  type StatusInfo,
} from "../vision/sources";
import { rankFrames, sharpness } from "../vision/core/sharpness";

export interface CaptureTarget {
  video?: HTMLVideoElement;
  image: HTMLCanvasElement;
  box: Box;
  detected?: { label: string; score: number };
  alternates?: HTMLCanvasElement[];
  burst?: BurstInfo;
}

export interface BurstInfo {
  requested: number;
  received: number;
  discarded: number;
  delayMs: number;
  ms: number;
  sharpness: number[];
}

export interface CameraViewHandle {
  // Capture whatever is currently focused (hovered box, else the box nearest
  // the centre of the frame — the "pointed at" object). Used by Space.
  captureFocused(): CaptureTarget | null;
  capture(): Promise<CaptureTarget | null>;
}

interface Props {
  onCapture: (target: CaptureTarget) => void;
  onTrackCount?: (count: number) => void;
  onDevices?: (devices: MediaDeviceInfo[]) => void;
  deviceId?: string;
  mirror?: boolean;
  source?: FrameSource | null;
  orientation?: Orientation;
  onStatus?: (info: StatusInfo) => void;
  burst?: number;
  discard?: number;
  delayMs?: number;
}

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#14b8a6"];
const STILL_TIMEOUT_MS = 10_000;
const KEEP_FRAMES = 3;

function colorFor(id: number): string {
  return COLORS[id % COLORS.length];
}

function contains(b: Box, x: number, y: number): boolean {
  return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
}

// Prefer big objects close to the centre of the frame
function pickCentral(tracks: TrackedObject[], vw: number, vh: number) {
  let best: TrackedObject | null = null;
  let bestScore = -Infinity;
  const diag = Math.hypot(vw, vh);
  for (const t of tracks) {
    const cx = t.box.x + t.box.w / 2;
    const cy = t.box.y + t.box.h / 2;
    const dist = Math.hypot(cx - vw / 2, cy - vh / 2) / diag;
    const area = (t.box.w * t.box.h) / (vw * vh);
    const score = -dist * 2 + Math.sqrt(area) + t.score * 0.3;
    if (score > bestScore) {
      best = t;
      bestScore = score;
    }
  }
  return best;
}

function snapshot(frame: ImageBitmap): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = frame.width;
  canvas.height = frame.height;
  canvas.getContext("2d")!.drawImage(frame, 0, 0);
  return canvas;
}

interface Frame {
  bitmap: ImageBitmap;
  time: number;
}

const STATUS_TEXT: Record<StatusInfo["status"], string> = {
  idle: "Not connected",
  connecting: "Connecting…",
  live: "Live",
  reconnecting: "Reconnecting…",
  error: "Error",
};

export const CameraView = forwardRef<CameraViewHandle, Props>(
  function CameraView(
    {
      onCapture,
      onTrackCount,
      onDevices,
      deviceId,
      mirror = true,
      source: externalSource,
      orientation = IDENTITY,
      onStatus,
      burst = 1,
      discard = 0,
      delayMs = 0,
    },
    ref
  ) {
    const frameCanvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<Frame | null>(null);
    const dirtyRef = useRef(false);
    const tracksRef = useRef<TrackedObject[]>([]);
    const hoverRef = useRef<{ x: number; y: number } | null>(null);
    const flashRef = useRef<{ box: Box; until: number } | null>(null);
    const orientationRef = useRef(orientation);
    orientationRef.current = orientation;
    const onTrackCountRef = useRef(onTrackCount);
    onTrackCountRef.current = onTrackCount;
    const onDevicesRef = useRef(onDevices);
    onDevicesRef.current = onDevices;
    const onStatusRef = useRef(onStatus);
    onStatusRef.current = onStatus;
    const [ownSource, setOwnSource] = useState<FrameSource | null>(null);
    const source = externalSource === undefined ? ownSource : externalSource;
    const [status, setStatus] = useState<StatusInfo>({ status: "connecting" });
    const [hasFrame, setHasFrame] = useState(false);
    const hasFrameRef = useRef(false);
    const [busy, setBusy] = useState(false);
    // Match the box to the camera's real aspect ratio so overlay/click
    // coordinates line up (laptop cams may be 4:3 or 16:9)
    const [aspect, setAspect] = useState("4 / 3");
    const stream = source?.mode !== "still";
    const live = status.status === "live";

    useEffect(() => {
      if (externalSource !== undefined) return;
      const cam = new WebcamSource({ deviceId });
      setOwnSource(cam);
      void cam.start();
      return () => cam.stop();
    }, [externalSource, deviceId]);

    useEffect(() => {
      if (!source) return;
      const update = (info: StatusInfo) => {
        setStatus(info);
        onStatusRef.current?.(info);
        if (info.status === "live" && source.kind === "webcam") {
          WebcamSource.devices()
            .then((d) => onDevicesRef.current?.(d))
            .catch(() => {});
        }
      };
      update(source.status());
      return source.onStatus(update);
    }, [source]);

    useEffect(() => {
      frameRef.current?.bitmap.close();
      frameRef.current = null;
      tracksRef.current = [];
      hasFrameRef.current = false;
      setHasFrame(false);
      if (!source?.onFrame) return;
      source.onFrame((bmp, time) => {
        const up = orientFrame(bmp, orientationRef.current);
        frameRef.current?.bitmap.close();
        frameRef.current = { bitmap: up, time };
        dirtyRef.current = true;
      });
      return () => source.onFrame?.(null);
    }, [source]);

    const frameSize = () => {
      const f = frameRef.current?.bitmap;
      return f ? { w: f.width, h: f.height } : null;
    };

    // Map a canvas-pixel point to (unmirrored) frame coordinates
    const toFrame = (clientX: number, clientY: number) => {
      const size = frameSize();
      if (!size) return null;
      const rect = canvasRef.current!.getBoundingClientRect();
      const px = ((clientX - rect.left) * size.w) / rect.width;
      const py = ((clientY - rect.top) * size.h) / rect.height;
      return { x: mirror ? size.w - px : px, y: py };
    };

    const focused = (): TrackedObject | null => {
      const size = frameSize();
      if (!size) return null;
      const tracks = tracksRef.current;
      const hover = hoverRef.current;
      if (hover) {
        const under = tracks
          .filter((t) => contains(t.box, hover.x, hover.y))
          .sort((a, b) => a.box.w * a.box.h - b.box.w * b.box.h)[0];
        if (under) return under;
      }
      return pickCentral(tracks, size.w, size.h);
    };

    const paintFrame = (bmp: ImageBitmap) => {
      const fc = frameCanvasRef.current;
      const canvas = canvasRef.current;
      if (!fc || !canvas) return;
      if (fc.width !== bmp.width || fc.height !== bmp.height) {
        fc.width = canvas.width = bmp.width;
        fc.height = canvas.height = bmp.height;
        setAspect(`${bmp.width} / ${bmp.height}`);
      }
      fc.getContext("2d")!.drawImage(bmp, 0, 0);
      if (!hasFrameRef.current) {
        hasFrameRef.current = true;
        setHasFrame(true);
      }
    };

    // Detection + drawing loop
    useEffect(() => {
      const tracker = new Tracker();
      let raf = 0;
      let lastCount = -1;
      let lastDetect = 0;
      let lastCost = 0;

      const loop = () => {
        raf = requestAnimationFrame(loop);
        const canvas = canvasRef.current;
        const frame = frameRef.current;
        if (!canvas) return;

        if (stream && frame && dirtyRef.current) {
          dirtyRef.current = false;
          paintFrame(frame.bitmap);
          // Adaptive throttle: wait at least as long as the last inference took,
          // so slow (CPU) inference never uses more than ~half the main thread.
          const now = performance.now();
          if (isDetectorReady() && now - lastDetect >= lastCost) {
            try {
              tracksRef.current = tracker.update(detectImageFrame(frame.bitmap));
            } catch (err) {
              console.error("[detect]", err);
            }
            lastDetect = now;
            lastCost = performance.now() - now;
          }
        }
        const tracks = tracksRef.current;
        if (tracks.length !== lastCount) {
          lastCount = tracks.length;
          onTrackCountRef.current?.(tracks.length);
        }

        if (canvas.width > 0) draw(canvas, tracks, focused(), flashRef.current, mirror);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, stream, mirror]);

    const flash = (box: Box) => {
      flashRef.current = { box, until: performance.now() + 350 };
    };

    const centreBox = (w: number, h: number, frac: number): Box => {
      const size = Math.min(w, h) * frac;
      return { x: (w - size) / 2, y: (h - size) / 2, w: size, h: size };
    };

    const captureFocused = (): CaptureTarget | null => (stream ? captureCurrent() : null);

    const captureCurrent = (): CaptureTarget | null => {
      const frame = frameRef.current;
      if (!frame) return null;
      const image = snapshot(frame.bitmap);
      const t = focused();
      if (t) {
        flash(t.box);
        return { image, box: { ...t.box }, detected: { label: t.label, score: t.score } };
      }
      // Nothing tracked: identify the centre of the frame
      const box = centreBox(image.width, image.height, 0.6);
      flash(box);
      return { image, box };
    };

    const captureStill = async (): Promise<CaptureTarget | null> => {
      if (!source?.capture) return null;
      setBusy(true);
      try {
        const t0 = performance.now();
        const shot = await withTimeout(
          captureFrames(source, { count: burst, discard, delayMs }),
          STILL_TIMEOUT_MS + delayMs
        );
        const ranked = rankFrames(
          shot.frames.map((r) => {
            const item = orientFrame(r, orientationRef.current);
            return { item, sharpness: sharpness(item) };
          })
        );
        const up = ranked[0].item;
        const alternates = ranked.slice(1, KEEP_FRAMES).map((r) => snapshot(r.item));
        ranked.slice(1).forEach((r) => r.item.close());
        const info: BurstInfo = {
          requested: burst,
          received: shot.received,
          discarded: shot.discarded,
          delayMs,
          ms: performance.now() - t0,
          sharpness: ranked.map((r) => r.sharpness),
        };
        frameRef.current?.bitmap.close();
        frameRef.current = { bitmap: up, time: performance.now() };
        paintFrame(up);
        tracksRef.current = isDetectorReady()
          ? detectImageFrame(up).map((d, i) => ({ ...d, id: i + 1, hits: 1, misses: 0 }))
          : [];
        hoverRef.current = null;
        const target = captureCurrent();
        return target && { ...target, alternates, burst: info };
      } finally {
        setBusy(false);
      }
    };

    useImperativeHandle(ref, () => ({
      captureFocused,
      capture: () => (stream ? Promise.resolve(captureFocused()) : captureStill()),
    }));

    const handleClick = (e: React.MouseEvent) => {
      const frame = frameRef.current;
      const p = toFrame(e.clientX, e.clientY);
      if (!frame || !p) return;
      const image = snapshot(frame.bitmap);
      const under = tracksRef.current
        .filter((t) => contains(t.box, p.x, p.y))
        .sort((a, b) => a.box.w * a.box.h - b.box.w * b.box.h)[0];
      if (under) {
        flash(under.box);
        onCapture({
          image,
          box: { ...under.box },
          detected: { label: under.label, score: under.score },
        });
        return;
      }
      // Clicked on something the detector doesn't know: crop around the click
      const size = Math.min(image.width, image.height) * 0.45;
      const box = {
        x: Math.max(0, Math.min(image.width - size, p.x - size / 2)),
        y: Math.max(0, Math.min(image.height - size, p.y - size / 2)),
        w: size,
        h: size,
      };
      flash(box);
      onCapture({ image, box });
    };

    const label = source?.label ?? "Camera";
    const statusLine = `${label} · ${STATUS_TEXT[status.status]}`;

    return (
      <div
        style={{ aspectRatio: aspect }}
        className="relative w-full rounded-2xl overflow-hidden bg-gray-900 shadow-lg select-none">
        <canvas
          ref={frameCanvasRef}
          data-testid="frame"
          className="absolute inset-0 w-full h-full object-contain"
          style={mirror ? { transform: "scaleX(-1)" } : undefined}
        />
        <canvas
          ref={canvasRef}
          data-testid="overlay"
          className="absolute inset-0 w-full h-full object-contain cursor-crosshair"
          onClick={handleClick}
          onMouseMove={(e) => {
            hoverRef.current = toFrame(e.clientX, e.clientY);
          }}
          onMouseLeave={() => {
            hoverRef.current = null;
          }}
        />
        <div
          data-testid="source-status"
          className={`absolute top-2 right-2 text-xs px-2 py-1 rounded pointer-events-none ${
            live ? "bg-black/50 text-white" : status.status === "error" ? "bg-red-600 text-white" : "bg-amber-500 text-black"
          }`}>
          {statusLine}
        </div>
        {!hasFrame && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-gray-300 text-sm pointer-events-none">
            {status.status === "error"
              ? <span className="text-red-300">{status.message ?? "Camera error"}</span>
              : status.status === "connecting"
                ? source?.kind === "webcam"
                  ? "Starting camera… (allow camera access if asked)"
                  : `Connecting to ${label}…`
                : status.status === "live" && !stream
                  ? status.message ?? "Press the button to take a picture"
                  : status.message ?? STATUS_TEXT[status.status]}
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm pointer-events-none">
            Taking picture…
          </div>
        )}
        {hasFrame && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded pointer-events-none">
            {stream
              ? "Click an object (or press Space) to identify it"
              : "Press Space (or the ring button) for a new picture"}
          </div>
        )}
      </div>
    );
  }
);

function draw(
  canvas: HTMLCanvasElement,
  tracks: TrackedObject[],
  focus: TrackedObject | null,
  flash: { box: Box; until: number } | null,
  mirror: boolean
) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  ctx.clearRect(0, 0, W, canvas.height);
  const fx = (b: Box) => (mirror ? W - b.x - b.w : b.x);
  const fontSize = Math.max(14, Math.round(W / 40));
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
  ctx.textBaseline = "top";

  for (const t of tracks) {
    const isFocus = focus?.id === t.id;
    const color = colorFor(t.id);
    const x = fx(t.box);
    const { y, w, h } = t.box;

    ctx.lineWidth = isFocus ? 4 : 2;
    ctx.strokeStyle = color;
    ctx.setLineDash(isFocus ? [] : [8, 6]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
    if (isFocus) {
      ctx.fillStyle = `${color}22`;
      ctx.fillRect(x, y, w, h);
    }

    const text = `${t.label} ${Math.round(t.score * 100)}%`;
    const tw = ctx.measureText(text).width + 12;
    const th = fontSize + 8;
    const ty = y - th >= 0 ? y - th : y;
    ctx.fillStyle = color;
    ctx.fillRect(x, ty, tw, th);
    ctx.fillStyle = "#fff";
    ctx.fillText(text, x + 6, ty + 4);
  }

  if (flash && performance.now() < flash.until) {
    const alpha = (flash.until - performance.now()) / 350;
    ctx.fillStyle = `rgba(255,255,255,${0.6 * alpha})`;
    ctx.fillRect(fx(flash.box), flash.box.y, flash.box.w, flash.box.h);
  }
}
