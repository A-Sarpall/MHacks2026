export interface Point {
  x: number;
  y: number;
}

export interface UprightConfig {
  margin: number;
  minScore: number;
}

export const DEFAULT_UPRIGHT: UprightConfig = {
  margin: 0.3,
  minScore: 0.5,
};

export function rotatePoint(p: Point, w: number, h: number, quarterTurns: number): Point {
  const q = ((quarterTurns % 4) + 4) % 4;
  switch (q) {
    case 1:
      return { x: h - p.y, y: p.x };
    case 2:
      return { x: w - p.x, y: h - p.y };
    case 3:
      return { x: p.y, y: w - p.x };
    default:
      return { x: p.x, y: p.y };
  }
}

export function rotatedSize(w: number, h: number, quarterTurns: number): { w: number; h: number } {
  return quarterTurns % 2 === 0 ? { w, h } : { w: h, h: w };
}

export function detectionEvidence(scores: number[]): number {
  return scores.reduce((a, s) => a + s * s, 0);
}

export function pickUpright(evidenceByTurn: number[], cfg: UprightConfig = DEFAULT_UPRIGHT): number {
  if (evidenceByTurn.length === 0) return 0;
  let best = 0;
  for (let q = 1; q < evidenceByTurn.length; q++) {
    if (evidenceByTurn[q] > evidenceByTurn[best]) best = q;
  }
  if (best === 0) return 0;
  const lead = evidenceByTurn[best] - evidenceByTurn[0];
  if (evidenceByTurn[best] < cfg.minScore || lead < cfg.margin) return 0;
  return best;
}
