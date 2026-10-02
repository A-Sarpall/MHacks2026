import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { detectFrame, isDetectorReady } from "../lib/detect";
import { Tracker } from "../lib/tracker";
import type { Box, TrackedObject } from "../lib/types";

export interface CaptureTarget {
  video: HTMLVideoElement;
  box: Box;
  detected?: { label: string; score: number };
}

export interface CameraViewHandle {
  // Capture whatever is currently focused (hovered box, else the box nearest
  // the centre of the frame — the "pointed at" object). Used by Space.
  captureFocused(): CaptureTarget | null;
}

interface Props {
  onCapture: (target: CaptureTarget) => void;
  onTrackCount?: (count: number) => void;
  mirror?: boolean;
}

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#14b8a6"];

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

type CamState = "starting" | "live" | "error";

export const CameraView = forwardRef<CameraViewHandle, Props>(
  function CameraView({ onCapture, onTrackCount, mirror = true }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tracksRef = useRef<TrackedObject[]>([]);
    const hoverRef = useRef<{ x: number; y: number } | null>(null);
    const flashRef = useRef<{ box: Box; until: number } | null>(null);
    const onTrackCountRef = useRef(onTrackCount);
    onTrackCountRef.current = onTrackCount;
    const [camState, setCamState] = useState<CamState>("starting");
    const [camError, setCamError] = useState("");

    // Start camera; clean up the stream on unmount (StrictMode mounts twice)
    useEffect(() => {
      let stream: MediaStream | null = null;
      let cancelled = false;
      (async () => {
        try {
          const s = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false,
          });
          if (cancelled) {
            s.getTracks().forEach((t) => t.stop());
            return;
          }
          stream = s;
          const video = videoRef.current!;
          video.srcObject = s;
          await video.play();
          if (!cancelled) setCamState("live");
        } catch (err) {
          if (cancelled) return;
          console.error("[camera]", err);
          const name = (err as DOMException)?.name;
          setCamError(
            name === "NotAllowedError"
              ? "Camera permission was denied. Allow camera access in the address bar and reload."
              : name === "NotFoundError"
                ? "No camera found."
                : `Could not start camera: ${String((err as Error)?.message ?? err)}`
          );
          setCamState("error");
        }
      })();
      return () => {
        cancelled = true;
        stream?.getTracks().forEach((t) => t.stop());
      };
    }, []);

    // Map a canvas-pixel point to (unmirrored) video coordinates
    const toVideo = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current!;
      const video = videoRef.current!;
      const rect = canvas.getBoundingClientRect();
      const sx = video.videoWidth / rect.width;
      const sy = video.videoHeight / rect.height;
      const px = (clientX - rect.left) * sx;
      const py = (clientY - rect.top) * sy;
      return { x: mirror ? video.videoWidth - px : px, y: py };
    };

    const focused = (): TrackedObject | null => {
      const video = videoRef.current;
      if (!video) return null;
      const tracks = tracksRef.current;
      const hover = hoverRef.current;
      if (hover) {
        const under = tracks
          .filter((t) => contains(t.box, hover.x, hover.y))
          .sort((a, b) => a.box.w * a.box.h - b.box.w * b.box.h)[0];
        if (under) return under;
      }
      return pickCentral(tracks, video.videoWidth, video.videoHeight);
    };

    // Detection + drawing loop
    useEffect(() => {
      if (camState !== "live") return;
      const tracker = new Tracker();
      let raf = 0;
      let lastCount = -1;

      const loop = () => {
        raf = requestAnimationFrame(loop);
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.videoWidth === 0) return;
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        if (isDetectorReady()) {
          try {
            tracksRef.current = tracker.update(detectFrame(video));
          } catch (err) {
            console.error("[detect]", err);
          }
        }
        const tracks = tracksRef.current;
        if (tracks.length !== lastCount) {
          lastCount = tracks.length;
          onTrackCountRef.current?.(tracks.length);
        }

        draw(canvas, tracks, focused(), flashRef.current, mirror);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [camState, mirror]);

    const targetFor = (t: TrackedObject): CaptureTarget => ({
      video: videoRef.current!,
      box: { ...t.box },
      detected: { label: t.label, score: t.score },
    });

    const flash = (box: Box) => {
      flashRef.current = { box, until: performance.now() + 350 };
    };

    useImperativeHandle(ref, () => ({
      captureFocused() {
        if (camState !== "live") return null;
        const t = focused();
        if (t) {
          flash(t.box);
          return targetFor(t);
        }
        // Nothing tracked: identify the centre of the frame
        const video = videoRef.current!;
        const size = Math.min(video.videoWidth, video.videoHeight) * 0.6;
        const box = {
          x: (video.videoWidth - size) / 2,
          y: (video.videoHeight - size) / 2,
          w: size,
          h: size,
        };
        flash(box);
        return { video, box };
      },
    }));

    const handleClick = (e: React.MouseEvent) => {
      if (camState !== "live") return;
      const p = toVideo(e.clientX, e.clientY);
      const video = videoRef.current!;
      const under = tracksRef.current
        .filter((t) => contains(t.box, p.x, p.y))
        .sort((a, b) => a.box.w * a.box.h - b.box.w * b.box.h)[0];
      if (under) {
        flash(under.box);
        onCapture(targetFor(under));
        return;
      }
      // Clicked on something the detector doesn't know: crop around the click
      const size = Math.min(video.videoWidth, video.videoHeight) * 0.45;
      const box = {
        x: Math.max(0, Math.min(video.videoWidth - size, p.x - size / 2)),
        y: Math.max(0, Math.min(video.videoHeight - size, p.y - size / 2)),
        w: size,
        h: size,
      };
      flash(box);
      onCapture({ video, box });
    };

    return (
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-900 shadow-lg select-none">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain"
          style={mirror ? { transform: "scaleX(-1)" } : undefined}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          data-testid="overlay"
          className="absolute inset-0 w-full h-full object-contain cursor-crosshair"
          onClick={handleClick}
          onMouseMove={(e) => {
            if (camState === "live") hoverRef.current = toVideo(e.clientX, e.clientY);
          }}
          onMouseLeave={() => {
            hoverRef.current = null;
          }}
        />
        {camState === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
            Starting camera… (allow camera access if asked)
          </div>
        )}
        {camState === "error" && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-red-300 text-sm">
            {camError}
          </div>
        )}
        {camState === "live" && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded pointer-events-none">
            Click an object (or press Space) to identify it
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
