// A tiny perceptual fingerprint of a photo, for "I just pointed at this" cache hits.
//   dHash: 64 bits of "is this pixel brighter than its right neighbour" on a 9x8 grayscale copy.
//          Survives small shifts, re-compression, exposure changes. Hamming distance compares two.
//   colour: mean RGB of a 2x2 grid, so a red box and a blue box with the same shape don't match.
// It recognises the *same view*, not the same object from a new angle; the model handles that via the notebook.

export interface Fingerprint {
  /** 16 hex chars (64 bits). */
  hash: string;
  /** 12 numbers 0-255: [r,g,b] for each quadrant (TL, TR, BL, BR). */
  colour: number[];
}

/** dHash from a 9x8 grayscale array (row-major, 72 values). */
export function dhashFromGray(gray: ArrayLike<number>): string {
  if (gray.length !== 72) throw new Error("dhash needs a 9x8 grayscale image");
  let hex = "";
  let nibble = 0;
  let bits = 0;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      nibble = (nibble << 1) | (gray[y * 9 + x] > gray[y * 9 + x + 1] ? 1 : 0);
      if (++bits === 4) {
        hex += nibble.toString(16);
        nibble = 0;
        bits = 0;
      }
    }
  }
  return hex;
}

export function hamming(a: string, b: string): number {
  let d = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) {
      d += x & 1;
      x >>= 1;
    }
  }
  return d + Math.abs(a.length - b.length) * 4;
}

/** Mean absolute difference of the colour signatures, 0-255. */
export function colourDistance(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 255;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

export interface MatchThresholds {
  /** Max differing dHash bits (of 64). */
  bits: number;
  /** Max mean colour difference (0-255). */
  colour: number;
}

// Tuned on test-images/: the same photo re-encoded / shifted a few pixels stays within ~4 bits;
// different objects on similar backgrounds are typically 20+ bits apart.
export const DEFAULT_MATCH: MatchThresholds = { bits: 10, colour: 28 };

export function sameView(a: Fingerprint, b: Fingerprint, t: MatchThresholds = DEFAULT_MATCH): boolean {
  return hamming(a.hash, b.hash) <= t.bits && colourDistance(a.colour, b.colour) <= t.colour;
}

/** Similarity score 0..1 (1 = identical), for picking the closest of several matches. */
export function similarity(a: Fingerprint, b: Fingerprint): number {
  return 1 - (hamming(a.hash, b.hash) / 64) * 0.7 - (colourDistance(a.colour, b.colour) / 255) * 0.3;
}

type Drawable = CanvasImageSource & { width: number; height: number };

let scratch: OffscreenCanvas | null = null;

/** Fingerprint of the central 80 % of an image (the ring points at the middle). */
export function fingerprint(image: Drawable): Fingerprint {
  scratch ??= new OffscreenCanvas(9, 8);
  const ctx = scratch.getContext("2d", { willReadFrequently: true })!;
  const cw = image.width * 0.8;
  const ch = image.height * 0.8;
  const sx = image.width * 0.1;
  const sy = image.height * 0.1;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, sx, sy, cw, ch, 0, 0, 9, 8);
  const px = ctx.getImageData(0, 0, 9, 8).data;
  const gray: number[] = Array.from({ length: 72 }, () => 0);
  for (let i = 0; i < 72; i++) gray[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
  const colour: number[] = [];
  for (const [x0, y0] of [[0, 0], [5, 0], [0, 4], [5, 4]]) {
    const acc = [0, 0, 0];
    let n = 0;
    for (let y = y0; y < y0 + 4; y++)
      for (let x = x0; x < Math.min(9, x0 + 4); x++) {
        const i = (y * 9 + x) * 4;
        acc[0] += px[i];
        acc[1] += px[i + 1];
        acc[2] += px[i + 2];
        n++;
      }
    colour.push(...acc.map((v) => Math.round(v / n)));
  }
  return { hash: dhashFromGray(gray), colour };
}
