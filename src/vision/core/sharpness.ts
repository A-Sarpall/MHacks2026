export type FrameImage = ImageBitmap | HTMLCanvasElement | OffscreenCanvas;

export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function toGray(rgba: Uint8ClampedArray, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h);
  for (let i = 0, j = 0; j < out.length; i += 4, j++) {
    out[j] = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
  }
  return out;
}

export function laplacianVariance(gray: Float32Array, w: number, h: number): number {
  if (w < 3 || h < 3) return 0;
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y++) {
    const row = y * w;
    for (let x = 1; x < w - 1; x++) {
      const i = row + x;
      const lap = gray[i - w] + gray[i + w] + gray[i - 1] + gray[i + 1] - 4 * gray[i];
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

let scratch: OffscreenCanvas | null = null;

export function downscaledGray(
  image: FrameImage,
  maxSide = 160,
  region?: Region
): { gray: Float32Array; w: number; h: number } {
  const r = region ?? { x: 0, y: 0, w: image.width, h: image.height };
  const scale = Math.min(1, maxSide / Math.max(r.w, r.h));
  const w = Math.max(3, Math.round(r.w * scale));
  const h = Math.max(3, Math.round(r.h * scale));
  scratch ??= new OffscreenCanvas(w, h);
  if (scratch.width !== w || scratch.height !== h) {
    scratch.width = w;
    scratch.height = h;
  }
  const ctx = scratch.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(image, r.x, r.y, r.w, r.h, 0, 0, w, h);
  return { gray: toGray(ctx.getImageData(0, 0, w, h).data, w, h), w, h };
}

export function centreRegion(w: number, h: number, frac = 0.6): Region {
  return { x: (w * (1 - frac)) / 2, y: (h * (1 - frac)) / 2, w: w * frac, h: h * frac };
}

export function sharpness(image: FrameImage, region?: Region, maxSide = 160): number {
  const g = downscaledGray(image, maxSide, region ?? centreRegion(image.width, image.height));
  return laplacianVariance(g.gray, g.w, g.h);
}

export interface FrameCandidate<T> {
  item: T;
  sharpness: number;
  motion?: number;
}

export interface ScoredFrame<T> extends FrameCandidate<T> {
  score: number;
}

export function rankFrames<T>(frames: FrameCandidate<T>[], motionWeight = 1): ScoredFrame<T>[] {
  const maxSharp = Math.max(1e-6, ...frames.map((f) => f.sharpness));
  return frames
    .map((f) => ({ ...f, score: f.sharpness / maxSharp - motionWeight * (f.motion ?? 0) }))
    .sort((a, b) => b.score - a.score);
}
