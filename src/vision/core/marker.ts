import type { Point } from "./aim";
import type { FrameImage } from "./sharpness";

export const MARKER_COLOR = "#ff00ff";

export function isMarkerPixel(r: number, g: number, b: number): boolean {
  return r > 140 && b > 140 && g < 0.55 * Math.min(r, b) && Math.abs(r - b) < 90;
}

export function findMarkerInRgba(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  minFraction = 0.002
): Point | null {
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (isMarkerPixel(rgba[i], rgba[i + 1], rgba[i + 2])) {
        sx += x;
        sy += y;
        n++;
      }
    }
  }
  if (n < Math.max(4, minFraction * w * h)) return null;
  return { x: (sx / n + 0.5) / w, y: (sy / n + 0.5) / h };
}

let scratch: OffscreenCanvas | null = null;

export function findMarker(image: FrameImage, maxSide = 200): Point | null {
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const w = Math.max(1, Math.round(image.width * scale));
  const h = Math.max(1, Math.round(image.height * scale));
  scratch ??= new OffscreenCanvas(w, h);
  scratch.width = w;
  scratch.height = h;
  const ctx = scratch.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0, w, h);
  const p = findMarkerInRgba(ctx.getImageData(0, 0, w, h).data, w, h);
  return p && { x: p.x * image.width, y: p.y * image.height };
}
