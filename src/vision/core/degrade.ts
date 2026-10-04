export type Condition = "clean" | "dark" | "very-dark" | "bright" | "noisy" | "blurry" | "close" | "tilted" | "dark-blurry";

export const CONDITIONS: Condition[] = ["clean", "dark", "very-dark", "bright", "noisy", "blurry", "close", "tilted", "dark-blurry"];

export interface Point {
  x: number;
  y: number;
}

function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function addNoise(data: Uint8ClampedArray, sigma: number, seed = 1): void {
  const rand = seeded(seed);
  for (let i = 0; i < data.length; i += 4) {
    const u = Math.max(1e-9, rand());
    const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand()) * sigma;
    data[i] += g;
    data[i + 1] += g;
    data[i + 2] += g;
  }
}

export function motionBlur(ctx: CanvasRenderingContext2D, src: CanvasImageSource, w: number, h: number, length: number, angle: number): void {
  const steps = Math.max(2, Math.round(length));
  const dx = Math.cos(angle) * length;
  const dy = Math.sin(angle) * length;
  ctx.globalAlpha = 1 / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1) - 0.5;
    ctx.drawImage(src, t * dx, t * dy, w, h);
  }
  ctx.globalAlpha = 1;
}

export function degrade(image: HTMLCanvasElement, condition: Condition, aim: Point, seed = 1): { image: HTMLCanvasElement; aim: Point } {
  const { width: w, height: h } = image;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d", { willReadFrequently: true })!;
  switch (condition) {
    case "clean":
      ctx.drawImage(image, 0, 0);
      break;
    case "dark":
      ctx.filter = "brightness(0.4) contrast(0.85)";
      ctx.drawImage(image, 0, 0);
      ctx.filter = "none";
      noise(ctx, w, h, 6, seed);
      break;
    case "very-dark":
      ctx.filter = "brightness(0.18) contrast(0.8) saturate(0.7)";
      ctx.drawImage(image, 0, 0);
      ctx.filter = "none";
      noise(ctx, w, h, 10, seed);
      break;
    case "bright":
      ctx.filter = "brightness(1.7) contrast(0.75)";
      ctx.drawImage(image, 0, 0);
      ctx.filter = "none";
      break;
    case "noisy":
      ctx.drawImage(image, 0, 0);
      noise(ctx, w, h, 25, seed);
      break;
    case "blurry":
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      motionBlur(ctx, image, w, h, Math.min(w, h) * 0.04, 0.4);
      break;
    case "dark-blurry":
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      ctx.filter = "brightness(0.4) contrast(0.85)";
      motionBlur(ctx, image, w, h, Math.min(w, h) * 0.04, 0.4);
      ctx.filter = "none";
      noise(ctx, w, h, 6, seed);
      break;
    case "close": {
      const s = 1.8;
      ctx.translate(aim.x, aim.y);
      ctx.scale(s, s);
      ctx.translate(-aim.x, -aim.y);
      ctx.drawImage(image, 0, 0);
      break;
    }
    case "tilted": {
      const a = (18 * Math.PI) / 180;
      ctx.fillStyle = "#555";
      ctx.fillRect(0, 0, w, h);
      ctx.translate(aim.x, aim.y);
      ctx.rotate(a);
      ctx.translate(-aim.x, -aim.y);
      ctx.drawImage(image, 0, 0);
      break;
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return { image: out, aim };
}

function noise(ctx: CanvasRenderingContext2D, w: number, h: number, sigma: number, seed: number): void {
  const id = ctx.getImageData(0, 0, w, h);
  addNoise(id.data, sigma, seed);
  ctx.putImageData(id, 0, 0);
}
