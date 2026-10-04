import { rankFrames, sharpness as defaultSharpness, type FrameImage } from "./sharpness";

export interface BufferedFrame<T extends { close(): void } = ImageBitmap> {
  image: T;
  time: number;
  speed: number;
  sharpness?: number;
}

export interface SelectOptions {
  skipMs: number;
  motionWeight: number;
  speedRef: number;
}

export const DEFAULT_SELECT: SelectOptions = {
  skipMs: 50,
  motionWeight: 0.5,
  speedRef: 0.5,
};

export interface Selection<T extends { close(): void }> {
  frame: BufferedFrame<T>;
  ageMs: number;
  candidates: number;
  score: number;
}

export class FrameBuffer<T extends { close(): void } = ImageBitmap> {
  private frames: BufferedFrame<T>[] = [];
  private capacity: number;
  private score: (image: T) => number;

  constructor(capacity = 10, score?: (image: T) => number) {
    this.capacity = capacity;
    this.score = score ?? ((image) => defaultSharpness(image as unknown as FrameImage));
  }

  push(image: T, time: number, speed = 0): void {
    this.frames.push({ image, time, speed });
    while (this.frames.length > this.capacity) this.frames.shift()!.image.close();
  }

  latest(): BufferedFrame<T> | null {
    return this.frames[this.frames.length - 1] ?? null;
  }

  size(): number {
    return this.frames.length;
  }

  clear(): void {
    for (const f of this.frames) f.image.close();
    this.frames = [];
  }

  select(pressTime: number, opts: SelectOptions = DEFAULT_SELECT): Selection<T> | null {
    if (this.frames.length === 0) return null;
    let pool = this.frames.filter((f) => f.time <= pressTime - opts.skipMs);
    if (pool.length === 0) pool = [this.frames[0]];
    for (const f of pool) f.sharpness ??= this.score(f.image);
    const ranked = rankFrames(
      pool.map((f) => ({
        item: f,
        sharpness: f.sharpness ?? 0,
        motion: Math.min(1, f.speed / opts.speedRef),
      })),
      opts.motionWeight
    );
    const best = ranked[0];
    return {
      frame: best.item,
      ageMs: pressTime - best.item.time,
      candidates: pool.length,
      score: best.score,
    };
  }
}

export interface Point {
  x: number;
  y: number;
}

export class SpeedMeter {
  private last: { id: number; c: Point; t: number } | null = null;
  private speed = 0;

  update(id: number | null, centre: Point | null, time: number, diag: number): number {
    if (id === null || !centre) {
      this.speed *= 0.5;
      this.last = null;
      return this.speed;
    }
    if (this.last && this.last.id === id && time > this.last.t) {
      const d = Math.hypot(centre.x - this.last.c.x, centre.y - this.last.c.y) / diag;
      this.speed = d / ((time - this.last.t) / 1000);
    } else {
      this.speed *= 0.5;
    }
    this.last = { id, c: centre, t: time };
    return this.speed;
  }

  current(): number {
    return this.speed;
  }
}
