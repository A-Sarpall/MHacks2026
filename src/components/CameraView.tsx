import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { detectImageFrame, isDetectorReady } from "../lib/detect";
import { Tracker, iou } from "../lib/tracker";
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
import { FrameBuffer, SpeedMeter } from "../vision/core/frameBuffer";
import {
  DEFAULT_AIM,
  OnTargetDetector,
  aimPoint,
  aimZone,
  contains as containsPoint,
  rankCandidates,
  type AimConfig,
  type Candidate,
  type Point,
} from "../vision/core/aim";

export interface CaptureTarget {
  video?: HTMLVideoElement;
  image: HTMLCanvasElement;
  box: Box;
  detected?: { label: string; score: number };
  alternates?: HTMLCanvasElement[];
  burst?: BurstInfo;
  streamPick?: StreamPickInfo;
  candidates?: Candidate[];
  aim?: Point;
}

export interface StreamPickInfo {
  ageMs: number;
  candidates: number;
  sharpness: number;
  buffered: number;
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
  unfreeze(): void;
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
  freezeMs?: number;
  aim?: AimConfig;
  maxCandidates?: number;
  onTargetCue?: boolean;
  onOnTarget?: () => void;
  highlight?: Box | null;
}

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#14b8a6"];
const STILL_TIMEOUT_MS = 10_000;
const KEEP_FRAMES = 3;
const BUFFER_FRAMES = 10;

function colorFor(id: number): string {
  return COLORS[id % COLORS.length];
}

function contains(b: Box, x: number, y: number): boolean {
  return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
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
  owned: boolean;
}

function matchTracks(
  detections: { label: string; score: number; box: Box }[],
  tracks: TrackedObject[]
): TrackedObject[] {
  return detections.map((d, i) => {
    let best: TrackedObject | null = null;
    let bestIou = 0.3;
    for (const t of tracks) {
      const v = iou(t.box, d.box);
      if (v > bestIou) {
        best = t;
        bestIou = v;
      }
    }
    return {
      ...d,
      id: best?.id ?? 10_000 + i,
      label: best?.label ?? d.label,
      hits: 1,
      misses: 0,
    };
  });
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
      freezeMs = 1500,
      aim = DEFAULT_AIM,
      maxCandidates = 4,
      onTargetCue = true,
      onOnTarget,
      highlight = null,
    },
    ref
  ) {
    const frameCanvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<Frame | null>(null);
    const bufferRef = useRef(new FrameBuffer(BUFFER_FRAMES));
    const speedRef = useRef(new SpeedMeter());
    const frozenRef = useRef<{ image: HTMLCanvasElement; until: number } | null>(null);
    const dirtyRef = useRef(false);
    const tracksRef = useRef<TrackedObject[]>([]);
    const hoverRef = useRef<{ x: number; y: number } | null>(null);
    const flashRef = useRef<{ box: Box; until: number } | null>(null);
    const onTargetRef = useRef(false);
    const highlightRef = useRef(highlight);
    highlightRef.current = highlight;
    const onOnTargetRef = useRef(onOnTarget);
    onOnTargetRef.current = onOnTarget;
    const frozenCandidatesRef = useRef<Candidate[] | null>(null);
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

    const setFrame = (f: Frame | null) => {
      const prev = frameRef.current;
      if (prev?.owned && prev.bitmap !== f?.bitmap) prev.bitmap.close();
      frameRef.current = f;
    };

    useEffect(() => {
      const buffer = bufferRef.current;
      setFrame(null);
      buffer.clear();
      frozenRef.current = null;
      tracksRef.current = [];
      hasFrameRef.current = false;
      setHasFrame(false);
      if (!source?.onFrame) return;
      source.onFrame((bmp, time) => {
        const up = orientFrame(bmp, orientationRef.current);
        setFrame({ bitmap: up, time, owned: false });
        buffer.push(up, time, speedRef.current.current());
        dirtyRef.current = true;
      });
      return () => {
        source.onFrame?.(null);
        setFrame(null);
        buffer.clear();
      };
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

    const rankFor = (tracks: TrackedObject[], w: number, h: number) =>
      rankCandidates(tracks, w, h, aimPoint(w, h, aim.offset), { maxCandidates, aimCropFrac: 0.4 });

    const hovered = (): TrackedObject | null => {
      const hover = hoverRef.current;
      if (!hover) return null;
      return (
        tracksRef.current
          .filter((t) => contains(t.box, hover.x, hover.y))
          .sort((a, b) => a.box.w * a.box.h - b.box.w * b.box.h)[0] ?? null
      );
    };

    const aimed = (): TrackedObject | null => {
      const size = frameSize();
      if (!size) return null;
      const top = rankFor(tracksRef.current, size.w, size.h)[0];
      return top?.kind === "detection" ? tracksRef.current.find((t) => t.id === top.trackId) ?? null : null;
    };

    const focused = (): TrackedObject | null => hovered() ?? aimed();

    const paintFrame = (bmp: ImageBitmap | HTMLCanvasElement) => {
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
      const onTarget = new OnTargetDetector();
      let raf = 0;
      let lastCount = -1;
      let lastDetect = 0;
      let lastCost = 0;

      const loop = () => {
        raf = requestAnimationFrame(loop);
        const canvas = canvasRef.current;
        const frame = frameRef.current;
        if (!canvas) return;

        const frozen = frozenRef.current;
        if (frozen && performance.now() > frozen.until) {
          frozenRef.current = null;
          frozenCandidatesRef.current = null;
          dirtyRef.current = true;
        }

        if (stream && frame && dirtyRef.current && !frozenRef.current) {
          dirtyRef.current = false;
          paintFrame(frame.bitmap);
          // Adaptive throttle: wait at least as long as the last inference took,
          // so slow (CPU) inference never uses more than ~half the main thread.
          const now = performance.now();
          if (isDetectorReady() && now - lastDetect >= lastCost) {
            try {
              tracksRef.current = tracker.update(detectImageFrame(frame.bitmap));
              const f = aimed();
              const { width: w, height: h } = frame.bitmap;
              const speed = speedRef.current.update(
                f?.id ?? null,
                f ? { x: f.box.x + f.box.w / 2, y: f.box.y + f.box.h / 2 } : null,
                frame.time,
                Math.hypot(w, h)
              );
              if (onTargetCue) {
                const inZone = f !== null && containsPoint(f.box, aimPoint(w, h, aim.offset));
                const r = onTarget.update(f && { id: f.id, hits: f.hits, inZone }, speed, frame.time);
                onTargetRef.current = r.onTarget;
                if (r.fired) onOnTargetRef.current?.();
              } else {
                onTargetRef.current = false;
              }
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

        if (canvas.width > 0) {
          const w = canvas.width;
          const h = canvas.height;
          draw(canvas, tracks, focused(), flashRef.current, mirror, {
            zone: aimZone(w, h, aim),
            point: aimPoint(w, h, aim.offset),
            onTarget: stream && onTargetCue && onTargetRef.current && !frozenRef.current,
            candidates: frozenCandidatesRef.current,
            highlight: highlightRef.current,
          });
        }
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, stream, mirror, aim.zoneFrac, aim.offset.dx, aim.offset.dy, maxCandidates, onTargetCue]);

    const flash = (box: Box) => {
      flashRef.current = { box, until: performance.now() + 1500 };
    };


    const captureFocused = (): CaptureTarget | null => (stream ? captureBest() : null);

    const captureBest = (): CaptureTarget | null => {
      const press = performance.now();
      const buffer = bufferRef.current;
      const sel = buffer.select(press);
      if (!sel) return captureCurrent();
      const chosen = sel.frame.image;
      const image = snapshot(chosen);
      if (isDetectorReady()) {
        const fresh = matchTracks(detectImageFrame(chosen), tracksRef.current);
        if (fresh.length > 0) tracksRef.current = fresh;
      }
      frozenRef.current = { image, until: press + freezeMs };
      paintFrame(image);
      const target = captureFrom(image);
      return {
        ...target,
        streamPick: {
          ageMs: sel.ageMs,
          candidates: sel.candidates,
          sharpness: sel.frame.sharpness ?? 0,
          buffered: buffer.size(),
        },
      };
    };

    const captureFrom = (image: HTMLCanvasElement): CaptureTarget => {
      const w = image.width;
      const h = image.height;
      const point = aimPoint(w, h, aim.offset);
      let candidates = rankFor(tracksRef.current, w, h);
      const hover = hovered();
      if (hover) {
        const key = `det-${hover.id}`;
        const picked = candidates.find((c) => c.key === key) ?? {
          key,
          kind: "detection" as const,
          box: { ...hover.box },
          label: hover.label,
          score: hover.score,
          trackId: hover.id,
          containsAim: false,
          distance: 0,
        };
        candidates = [picked, ...candidates.filter((c) => c.key !== key)].slice(0, maxCandidates);
      }
      frozenCandidatesRef.current = candidates;
      const top = candidates[0];
      flash(top.box);
      return {
        image,
        box: { ...top.box },
        ...(top.kind === "detection" && top.label
          ? { detected: { label: top.label, score: top.score ?? 0 } }
          : {}),
        candidates,
        aim: point,
      };
    };

    const captureCurrent = (): CaptureTarget | null => {
      const frame = frameRef.current;
      return frame ? captureFrom(snapshot(frame.bitmap)) : null;
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
            return { item, sharpness: sharpness(item, aimZone(item.width, item.height, aim)) };
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
        setFrame({ bitmap: up, time: performance.now(), owned: true });
        paintFrame(up);
        tracksRef.current = isDetectorReady()
          ? detectImageFrame(up).map((d, i) => ({ ...d, id: i + 1, hits: 1, misses: 0 }))
          : [];
        frozenRef.current = { image: snapshot(up), until: Number.POSITIVE_INFINITY };
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
      unfreeze: () => {
        frozenRef.current = null;
        frozenCandidatesRef.current = null;
        dirtyRef.current = true;
      },
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

interface AimOverlay {
  zone: Box;
  point: Point;
  onTarget: boolean;
  candidates: Candidate[] | null;
  highlight: Box | null;
}

function draw(
  canvas: HTMLCanvasElement,
  tracks: TrackedObject[],
  focus: TrackedObject | null,
  flash: { box: Box; until: number } | null,
  mirror: boolean,
  overlay: AimOverlay
) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  ctx.clearRect(0, 0, W, canvas.height);
  const fx = (b: Box) => (mirror ? W - b.x - b.w : b.x);
  const fontSize = Math.max(14, Math.round(W / 40));
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
  ctx.textBaseline = "top";

  const zone = overlay.zone;
  ctx.lineWidth = overlay.onTarget ? 4 : 1.5;
  ctx.strokeStyle = overlay.onTarget ? "#22c55e" : "rgba(255,255,255,0.7)";
  ctx.setLineDash(overlay.onTarget ? [] : [6, 6]);
  ctx.strokeRect(fx(zone), zone.y, zone.w, zone.h);
  ctx.setLineDash([]);
  const px = mirror ? W - overlay.point.x : overlay.point.x;
  const arm = Math.max(10, W / 30);
  ctx.beginPath();
  ctx.moveTo(px - arm, overlay.point.y);
  ctx.lineTo(px + arm, overlay.point.y);
  ctx.moveTo(px, overlay.point.y - arm);
  ctx.lineTo(px, overlay.point.y + arm);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = overlay.onTarget ? "#22c55e" : "#fff";
  ctx.stroke();

  const rank = new Map<number, number>();
  overlay.candidates?.forEach((c, i) => {
    if (c.trackId !== undefined) rank.set(c.trackId, i + 1);
  });

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

    const n = rank.get(t.id);
    const text = `${n ? `${n}. ` : ""}${t.label} ${Math.round(t.score * 100)}%`;
    const tw = ctx.measureText(text).width + 12;
    const th = fontSize + 8;
    const ty = y - th >= 0 ? y - th : y;
    ctx.fillStyle = color;
    ctx.fillRect(x, ty, tw, th);
    ctx.fillStyle = "#fff";
    ctx.fillText(text, x + 6, ty + 4);
  }

  const aimCand = overlay.candidates?.find((c) => c.kind === "aim");
  if (aimCand) {
    const i = overlay.candidates!.indexOf(aimCand) + 1;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#facc15";
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(fx(aimCand.box), aimCand.box.y, aimCand.box.w, aimCand.box.h);
    ctx.setLineDash([]);
    ctx.fillStyle = "#facc15";
    ctx.fillText(`${i}. here`, fx(aimCand.box) + 6, aimCand.box.y + 4);
  }

  if (overlay.highlight) {
    const hb = overlay.highlight;
    ctx.beginPath();
    ctx.rect(0, 0, W, canvas.height);
    ctx.rect(fx(hb), hb.y, hb.w, hb.h);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fill("evenodd");
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#3b82f6";
    ctx.setLineDash([]);
    ctx.strokeRect(fx(hb), hb.y, hb.w, hb.h);
  }

  if (flash && performance.now() < flash.until) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#1d4ed8";
    ctx.setLineDash([]);
    ctx.strokeRect(fx(flash.box), flash.box.y, flash.box.w, flash.box.h);
  }
}
