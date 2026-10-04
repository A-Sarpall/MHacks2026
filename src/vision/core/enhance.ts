export interface LumaStats {
  mean: number;
  low: number;
  high: number;
}

export interface EnhanceConfig {
  padToSquare: boolean;
  levels: boolean;
  lowPct: number;
  highPct: number;
  darkMean: number;
  maxGamma: number;
  minRange: number;
}

export const DEFAULT_ENHANCE: EnhanceConfig = {
  padToSquare: true,
  levels: true,
  lowPct: 0.01,
  highPct: 0.99,
  darkMean: 90,
  maxGamma: 0.55,
  minRange: 60,
};

export function lumaStats(rgba: Uint8ClampedArray, lowPct = 0.01, highPct = 0.99): LumaStats {
  const hist = new Uint32Array(256);
  let sum = 0;
  const n = rgba.length / 4;
  for (let i = 0; i < rgba.length; i += 4) {
    const y = Math.round(0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]);
    hist[y]++;
    sum += y;
  }
  const pick = (pct: number) => {
    let acc = 0;
    for (let v = 0; v < 256; v++) {
      acc += hist[v];
      if (acc >= pct * n) return v;
    }
    return 255;
  };
  return { mean: n ? sum / n : 0, low: pick(lowPct), high: pick(highPct) };
}

export function levelsLut(stats: LumaStats, cfg: EnhanceConfig = DEFAULT_ENHANCE): Uint8ClampedArray | null {
  const range = stats.high - stats.low;
  const dark = stats.mean < cfg.darkMean;
  if (range >= cfg.minRange && !dark) return null;
  const lo = stats.low;
  const hi = stats.high;
  const gamma = dark ? Math.max(cfg.maxGamma, Math.pow(stats.mean / 128, 0.6)) : 1;
  const lut = new Uint8ClampedArray(256);
  for (let v = 0; v < 256; v++) {
    const t = Math.min(1, Math.max(0, (v - lo) / Math.max(1, hi - lo)));
    lut[v] = Math.round(255 * Math.pow(t, gamma));
  }
  return lut;
}

export function applyLut(rgba: Uint8ClampedArray, lut: Uint8ClampedArray): void {
  for (let i = 0; i < rgba.length; i += 4) {
    rgba[i] = lut[rgba[i]];
    rgba[i + 1] = lut[rgba[i + 1]];
    rgba[i + 2] = lut[rgba[i + 2]];
  }
}

export function squareBox(w: number, h: number): { size: number; x: number; y: number } {
  const size = Math.max(w, h);
  return { size, x: Math.floor((size - w) / 2), y: Math.floor((size - h) / 2) };
}

export function prepareCrop(crop: HTMLCanvasElement, cfg: EnhanceConfig = DEFAULT_ENHANCE): HTMLCanvasElement {
  const { width: w, height: h } = crop;
  const square = cfg.padToSquare && w !== h;
  if (!square && !cfg.levels) return crop;
  const box = square ? squareBox(w, h) : { size: 0, x: 0, y: 0 };
  const out = document.createElement("canvas");
  out.width = square ? box.size : w;
  out.height = square ? box.size : h;
  const ctx = out.getContext("2d", { willReadFrequently: true })!;
  const src = crop.getContext("2d", { willReadFrequently: true })!.getImageData(0, 0, w, h);
  let lut: Uint8ClampedArray | null = null;
  if (cfg.levels) {
    lut = levelsLut(lumaStats(src.data, cfg.lowPct, cfg.highPct), cfg);
    if (lut) applyLut(src.data, lut);
  }
  if (square) {
    ctx.fillStyle = edgeColor(src.data, w, h);
    ctx.fillRect(0, 0, out.width, out.height);
  }
  if (!square && !lut) return crop;
  ctx.putImageData(src, box.x, box.y);
  return out;
}

export function edgeColor(rgba: Uint8ClampedArray, w: number, h: number): string {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const add = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    r += rgba[i];
    g += rgba[i + 1];
    b += rgba[i + 2];
    n++;
  };
  for (let x = 0; x < w; x++) {
    add(x, 0);
    add(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    add(0, y);
    add(w - 1, y);
  }
  if (!n) return "#808080";
  return `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`;
}

export function mirrored(crop: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = crop.width;
  out.height = crop.height;
  const ctx = out.getContext("2d")!;
  ctx.translate(crop.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(crop, 0, 0);
  return out;
}

export function averageEmbeddings(vectors: Float32Array[]): Float32Array {
  const out = new Float32Array(vectors[0].length);
  for (const v of vectors) for (let i = 0; i < out.length; i++) out[i] += v[i];
  let n = 0;
  for (const x of out) n += x * x;
  n = Math.sqrt(n) || 1;
  for (let i = 0; i < out.length; i++) out[i] /= n;
  return out;
}

export function rotated(crop: HTMLCanvasElement, quarterTurns: number): HTMLCanvasElement {
  const q = ((quarterTurns % 4) + 4) % 4;
  if (q === 0) return crop;
  const out = document.createElement("canvas");
  const swap = q % 2 === 1;
  out.width = swap ? crop.height : crop.width;
  out.height = swap ? crop.width : crop.height;
  const ctx = out.getContext("2d")!;
  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate((q * Math.PI) / 2);
  ctx.drawImage(crop, -crop.width / 2, -crop.height / 2);
  return out;
}
