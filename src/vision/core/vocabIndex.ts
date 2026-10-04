export interface VocabRow {
  label: string;
  category: string;
}

export interface VocabMatch {
  label: string;
  category: string;
  cos: number;
  prob: number;
  specific?: { label: string; prob: number };
}

export class VocabIndex {
  readonly rows: VocabRow[];
  readonly dims: number;
  private emb: Float32Array;
  private scale: number;
  private parents: Record<string, string>;

  constructor(rows: VocabRow[], emb: Float32Array, dims: number, scale: number, parents: Record<string, string> = {}) {
    if (emb.length !== rows.length * dims) throw new Error("Vocabulary embeddings don't match the label list");
    this.rows = rows;
    this.emb = emb;
    this.dims = dims;
    this.scale = scale;
    this.parents = parents;
  }

  cosines(v: Float32Array): Float32Array {
    const out = new Float32Array(this.rows.length);
    const d = this.dims;
    for (let r = 0; r < this.rows.length; r++) {
      let s = 0;
      const o = r * d;
      for (let k = 0; k < d; k++) s += this.emb[o + k] * v[k];
      out[r] = s;
    }
    return out;
  }

  private groups(v: Float32Array, boost?: (label: string) => number): { label: string; row: number; cos: number; prob: number; lead: string; leadProb: number; rank: number }[] {
    const cos = this.cosines(v);
    const best = new Map<string, { row: number; cos: number }>();
    let max = -Infinity;
    for (let r = 0; r < cos.length; r++) {
      const c = cos[r];
      if (c > max) max = c;
      const prev = best.get(this.rows[r].label);
      if (!prev || c > prev.cos) best.set(this.rows[r].label, { row: r, cos: c });
    }
    let sum = 0;
    for (const b of best.values()) sum += Math.exp(this.scale * (b.cos - max));
    const out = new Map<string, { label: string; row: number; cos: number; prob: number; lead: string; leadProb: number; rank: number }>();
    for (const [label, b] of best) {
      const prob = Math.exp(this.scale * (b.cos - max)) / sum;
      const name = this.parents[label] ?? label;
      const g = out.get(name);
      if (!g) out.set(name, { label: name, row: b.row, cos: b.cos, prob, lead: label, leadProb: prob, rank: 0 });
      else {
        g.prob += prob;
        if (prob > g.leadProb) {
          g.lead = label;
          g.leadProb = prob;
          g.row = b.row;
          g.cos = b.cos;
        }
      }
    }
    for (const g of out.values()) g.rank = Math.log(g.prob) + this.scale * (boost ? boost(g.label) : 0);
    return [...out.values()].sort((a, b) => b.rank - a.rank);
  }

  top(v: Float32Array, k = 3, boost?: (label: string) => number): VocabMatch[] {
    return this.groups(v, boost)
      .slice(0, k)
      .map((g) => ({
        label: g.label,
        category: this.rows[g.row].category,
        cos: g.cos,
        prob: g.prob,
        ...(g.lead !== g.label ? { specific: { label: g.lead, prob: g.leadProb } } : {}),
      }));
  }

  categoryMass(v: Float32Array): Record<string, number> {
    const out: Record<string, number> = {};
    for (const g of this.groups(v)) {
      const c = this.rows[g.row].category;
      out[c] = (out[c] ?? 0) + g.prob;
    }
    return out;
  }
}

export function normalize(v: Float32Array): Float32Array {
  let n = 0;
  for (const x of v) n += x * x;
  n = Math.sqrt(n) || 1;
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i] / n;
  return out;
}

export function cosine(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
