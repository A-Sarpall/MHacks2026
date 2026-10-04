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

  top(v: Float32Array, k = 3, boost?: (label: string) => number): VocabMatch[] {
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
    const groups = new Map<string, { prob: number; lead: { label: string; row: number; cos: number; prob: number } }>();
    for (const [label, b] of best) {
      const prob = Math.exp(this.scale * (b.cos - max)) / sum;
      const name = this.parents[label] ?? label;
      const g = groups.get(name);
      const member = { label, row: b.row, cos: b.cos, prob };
      if (!g) groups.set(name, { prob, lead: member });
      else {
        g.prob += prob;
        if (prob > g.lead.prob) g.lead = member;
      }
    }
    const rank = (label: string, prob: number) => Math.log(prob) + this.scale * (boost ? boost(label) : 0);
    return [...groups.entries()]
      .sort((a, b) => rank(b[0], b[1].prob) - rank(a[0], a[1].prob))
      .slice(0, k)
      .map(([label, g]) => ({
        label,
        category: this.rows[g.lead.row].category,
        cos: g.lead.cos,
        prob: g.prob,
        ...(g.lead.label !== label ? { specific: { label: g.lead.label, prob: g.lead.prob } } : {}),
      }));
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
