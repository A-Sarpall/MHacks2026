export interface VocabRow {
  label: string;
  category: string;
}

export interface VocabMatch {
  label: string;
  category: string;
  cos: number;
  prob: number;
}

export class VocabIndex {
  readonly rows: VocabRow[];
  readonly dims: number;
  private emb: Float32Array;
  private scale: number;

  constructor(rows: VocabRow[], emb: Float32Array, dims: number, scale: number) {
    if (emb.length !== rows.length * dims) throw new Error("Vocabulary embeddings don't match the label list");
    this.rows = rows;
    this.emb = emb;
    this.dims = dims;
    this.scale = scale;
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
      const c = cos[r] + (boost ? boost(this.rows[r].label) : 0);
      cos[r] = c;
      if (c > max) max = c;
      const prev = best.get(this.rows[r].label);
      if (!prev || c > prev.cos) best.set(this.rows[r].label, { row: r, cos: c });
    }
    let sum = 0;
    for (const { cos: c } of best.values()) sum += Math.exp(this.scale * (c - max));
    return [...best.entries()]
      .sort((a, b) => b[1].cos - a[1].cos)
      .slice(0, k)
      .map(([label, { row, cos: c }]) => ({
        label,
        category: this.rows[row].category,
        cos: c,
        prob: Math.exp(this.scale * (c - max)) / sum,
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
