export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface AimOffset {
  dx: number;
  dy: number;
}

export interface AimConfig {
  zoneFrac: number;
  offset: AimOffset;
}

export const DEFAULT_AIM: AimConfig = { zoneFrac: 0.5, offset: { dx: 0, dy: 0 } };

export function aimPoint(w: number, h: number, offset: AimOffset): Point {
  return {
    x: clamp(w * (0.5 + offset.dx), 0, w),
    y: clamp(h * (0.5 + offset.dy), 0, h),
  };
}

export function aimZone(w: number, h: number, cfg: AimConfig): Box {
  const p = aimPoint(w, h, cfg.offset);
  const zw = w * cfg.zoneFrac;
  const zh = h * cfg.zoneFrac;
  return {
    x: clamp(p.x - zw / 2, 0, w - zw),
    y: clamp(p.y - zh / 2, 0, h - zh),
    w: zw,
    h: zh,
  };
}

export function contains(b: Box, p: Point): boolean {
  return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
}

export function distanceToBox(b: Box, p: Point): number {
  const dx = Math.max(b.x - p.x, 0, p.x - (b.x + b.w));
  const dy = Math.max(b.y - p.y, 0, p.y - (b.y + b.h));
  return Math.hypot(dx, dy);
}

export function centre(b: Box): Point {
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

export interface Detection {
  id?: number;
  label: string;
  score: number;
  box: Box;
}

export interface Candidate {
  key: string;
  kind: "detection" | "aim";
  box: Box;
  label?: string;
  score?: number;
  trackId?: number;
  containsAim: boolean;
  distance: number;
}

export interface RankOptions {
  maxCandidates: number;
  aimCropFrac: number;
  nearFrac?: number;
}

export const DEFAULT_RANK: RankOptions = { maxCandidates: 4, aimCropFrac: 0.4, nearFrac: 0.08 };

export function aimCrop(w: number, h: number, p: Point, frac: number): Box {
  const size = Math.min(w, h) * frac;
  return {
    x: clamp(p.x - size / 2, 0, Math.max(0, w - size)),
    y: clamp(p.y - size / 2, 0, Math.max(0, h - size)),
    w: Math.min(size, w),
    h: Math.min(size, h),
  };
}

export function rankCandidates(
  detections: Detection[],
  w: number,
  h: number,
  aim: Point,
  opts: RankOptions = DEFAULT_RANK
): Candidate[] {
  const diag = Math.hypot(w, h);
  const scored = detections.map((d, i) => {
    const inside = contains(d.box, aim);
    return {
      d,
      i,
      inside,
      area: d.box.w * d.box.h,
      dist: distanceToBox(d.box, aim),
      cdist: Math.hypot(centre(d.box).x - aim.x, centre(d.box).y - aim.y),
    };
  });
  scored.sort((a, b) => {
    if (a.inside !== b.inside) return a.inside ? -1 : 1;
    if (a.inside) return a.area - b.area;
    return a.dist - b.dist || a.cdist - b.cdist;
  });
  const out: Candidate[] = scored.map((s) => ({
    key: `det-${s.d.id ?? s.i}`,
    kind: "detection" as const,
    box: { ...s.d.box },
    label: s.d.label,
    score: s.d.score,
    trackId: s.d.id,
    containsAim: s.inside,
    distance: s.dist / diag,
  }));
  const max = Math.max(1, opts.maxCandidates);
  const anyInside = out.some((c) => c.containsAim);
  if (anyInside) return out.slice(0, max);
  const aimCandidate: Candidate = {
    key: "aim",
    kind: "aim",
    box: aimCrop(w, h, aim, opts.aimCropFrac),
    containsAim: true,
    distance: 0,
  };
  if (out.length === 0) return [aimCandidate];
  if (out[0].distance > (opts.nearFrac ?? DEFAULT_RANK.nearFrac!)) {
    return [aimCandidate, ...out.slice(0, max - 1)];
  }
  return [...out.slice(0, max - 1), aimCandidate];
}

export class OnTargetDetector {
  private holdMs: number;
  private maxSpeed: number;
  private minHits: number;
  private current: { id: number; since: number; fired: boolean } | null = null;

  constructor(holdMs = 300, maxSpeed = 0.25, minHits = 3) {
    this.holdMs = holdMs;
    this.maxSpeed = maxSpeed;
    this.minHits = minHits;
  }

  update(
    target: { id: number; hits: number; inZone: boolean } | null,
    speed: number,
    time: number
  ): { onTarget: boolean; fired: boolean } {
    const steady =
      target !== null && target.inZone && target.hits >= this.minHits && speed <= this.maxSpeed;
    if (!steady || !target) {
      this.current = null;
      return { onTarget: false, fired: false };
    }
    if (!this.current || this.current.id !== target.id) {
      this.current = { id: target.id, since: time, fired: false };
    }
    const onTarget = time - this.current.since >= this.holdMs;
    const fired = onTarget && !this.current.fired;
    if (fired) this.current.fired = true;
    return { onTarget, fired };
  }
}

export interface CalibrationSample {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function offsetFromSamples(samples: CalibrationSample[]): {
  offset: AimOffset;
  spread: number;
} {
  if (samples.length === 0) return { offset: { dx: 0, dy: 0 }, spread: 0 };
  const rel = samples.map((s) => ({ dx: s.x / s.w - 0.5, dy: s.y / s.h - 0.5 }));
  const dx = rel.reduce((a, r) => a + r.dx, 0) / rel.length;
  const dy = rel.reduce((a, r) => a + r.dy, 0) / rel.length;
  const spread = Math.sqrt(rel.reduce((a, r) => a + (r.dx - dx) ** 2 + (r.dy - dy) ** 2, 0) / rel.length);
  return { offset: { dx, dy }, spread };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
