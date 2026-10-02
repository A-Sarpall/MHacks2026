// Minimal multi-object tracker: greedy IoU matching between frames gives each
// object a stable id; boxes are smoothed and labels are voted over time so the
// overlay doesn't flicker.
import type { Box, RawDetection, TrackedObject } from "./types";

const IOU_MATCH = 0.3;
const MAX_MISSES = 8; // frames an object may go undetected before dropping
const SMOOTH = 0.5; // EMA weight of the new box
const MIN_HITS = 2; // frames before a track is shown

interface Track extends TrackedObject {
  votes: Map<string, number>;
}

export function iou(a: Box, b: Box): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = a.w * a.h + b.w * b.h - inter;
  return union > 0 ? inter / union : 0;
}

function lerpBox(a: Box, b: Box, t: number): Box {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    w: a.w + (b.w - a.w) * t,
    h: a.h + (b.h - a.h) * t,
  };
}

function topVote(votes: Map<string, number>): string {
  let best = "";
  let bestScore = -1;
  for (const [label, score] of votes) {
    if (score > bestScore) {
      best = label;
      bestScore = score;
    }
  }
  return best;
}

export class Tracker {
  private tracks: Track[] = [];
  private nextId = 1;

  update(detections: RawDetection[]): TrackedObject[] {
    const pairs: { t: number; d: number; iou: number }[] = [];
    this.tracks.forEach((track, t) => {
      detections.forEach((det, d) => {
        const score = iou(track.box, det.box);
        if (score >= IOU_MATCH) pairs.push({ t, d, iou: score });
      });
    });
    pairs.sort((a, b) => b.iou - a.iou);

    const usedT = new Set<number>();
    const usedD = new Set<number>();
    for (const p of pairs) {
      if (usedT.has(p.t) || usedD.has(p.d)) continue;
      usedT.add(p.t);
      usedD.add(p.d);
      const track = this.tracks[p.t];
      const det = detections[p.d];
      track.box = lerpBox(track.box, det.box, SMOOTH);
      track.score = det.score;
      track.hits++;
      track.misses = 0;
      // Decay old votes so a track can change its mind over time
      for (const [k, v] of track.votes) track.votes.set(k, v * 0.9);
      track.votes.set(det.label, (track.votes.get(det.label) ?? 0) + det.score);
      track.label = topVote(track.votes);
    }

    this.tracks.forEach((track, t) => {
      if (!usedT.has(t)) track.misses++;
    });
    this.tracks = this.tracks.filter((t) => t.misses <= MAX_MISSES);

    detections.forEach((det, d) => {
      if (usedD.has(d)) return;
      this.tracks.push({
        id: this.nextId++,
        label: det.label,
        score: det.score,
        box: { ...det.box },
        hits: 1,
        misses: 0,
        votes: new Map([[det.label, det.score]]),
      });
    });

    return this.visible();
  }

  visible(): TrackedObject[] {
    return this.tracks
      .filter((t) => t.hits >= MIN_HITS)
      .map(({ votes: _votes, ...rest }) => ({ ...rest, box: { ...rest.box } }));
  }

  reset(): void {
    this.tracks = [];
  }
}
