import { decodeHalf } from "./core/f16";
import { VocabIndex } from "./core/vocabIndex";
import { SIGLIP, vocabHash, type VocabMeta } from "./siglipConfig";
import type { WorkerRequest, WorkerResponse } from "./siglip.worker";

export interface SiglipState {
  status: "idle" | "loading" | "ready" | "error";
  progress: number;
  device?: "webgpu" | "wasm";
  message?: string;
  staleVocab?: boolean;
}

const BASE = import.meta.env.BASE_URL;
const FORCE_WASM = new URLSearchParams(window.location.search).get("siglip")?.toLowerCase() === "wasm";
const DISABLED = new URLSearchParams(window.location.search).get("siglip")?.toLowerCase() === "off";

let state: SiglipState = { status: "idle", progress: 0 };
const listeners = new Set<(s: SiglipState) => void>();
let worker: Worker | null = null;
let initPromise: Promise<void> | null = null;
let vocab: VocabIndex | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (v: Float32Array[]) => void; reject: (e: Error) => void }>();
const fileProgress = new Map<string, { loaded: number; total: number }>();

function setState(patch: Partial<SiglipState>): void {
  state = { ...state, ...patch };
  for (const l of listeners) l(state);
}

export function siglipState(): SiglipState {
  return state;
}

export function onSiglipState(cb: (s: SiglipState) => void): () => void {
  listeners.add(cb);
  cb(state);
  return () => listeners.delete(cb);
}

export function isSiglipReady(): boolean {
  return state.status === "ready" && vocab !== null;
}

export function vocabIndex(): VocabIndex | null {
  return vocab;
}

async function loadVocab(): Promise<VocabIndex> {
  const [metaRes, binRes] = await Promise.all([fetch(`${BASE}${SIGLIP.metaUrl}`), fetch(`${BASE}${SIGLIP.embeddingsUrl}`)]);
  if (!metaRes.ok || !binRes.ok) throw new Error("Vocabulary embeddings missing; run npm run embed-vocab");
  const meta = (await metaRes.json()) as VocabMeta;
  const emb = decodeHalf(new Uint16Array(await binRes.arrayBuffer()));
  if (meta.hash !== vocabHash()) {
    console.warn("[siglip] src/data/vocabulary.ts changed since the embeddings were built; run npm run embed-vocab");
    setState({ staleVocab: true });
  }
  return new VocabIndex(meta.entries, emb, meta.dims, SIGLIP.logitScale);
}

export function initSiglip(): Promise<void> {
  if (DISABLED) {
    setState({ status: "error", message: "SigLIP disabled (?siglip=off)" });
    return Promise.reject(new Error("disabled"));
  }
  initPromise ??= new Promise<void>((resolve, reject) => {
    setState({ status: "loading", progress: 0 });
    worker = new Worker(new URL("./siglip.worker.ts", import.meta.url), { type: "module" });
    const vocabReady = loadVocab().then((v) => {
      vocab = v;
    });
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      if (msg.type === "progress") {
        fileProgress.set(msg.file, { loaded: msg.loaded, total: msg.total });
        let loaded = 0;
        let total = 0;
        for (const p of fileProgress.values()) {
          loaded += p.loaded;
          total += p.total;
        }
        setState({ progress: total > 0 ? loaded / total : 0 });
      } else if (msg.type === "ready") {
        vocabReady
          .then(() => {
            setState({ status: "ready", progress: 1, device: msg.device });
            console.info(`[siglip] ready on ${msg.device} in ${Math.round(msg.ms)} ms`);
            resolve();
          })
          .catch((err: unknown) => {
            setState({ status: "error", message: String((err as Error).message) });
            reject(err);
          });
      } else if (msg.type === "embedded") {
        pending.get(msg.id)?.resolve(msg.vectors);
        pending.delete(msg.id);
      } else if (msg.type === "error") {
        if (msg.id !== undefined) {
          pending.get(msg.id)?.reject(new Error(msg.message));
          pending.delete(msg.id);
        } else {
          setState({ status: "error", message: msg.message });
          reject(new Error(msg.message));
        }
      }
    };
    const req: WorkerRequest = { type: "init", base: BASE, forceWasm: FORCE_WASM };
    worker.postMessage(req);
  });
  initPromise.catch(() => {
    initPromise = null;
    worker?.terminate();
    worker = null;
  });
  return initPromise;
}

export async function embedImages(images: (HTMLCanvasElement | ImageBitmap)[], timeoutMs = 8000): Promise<Float32Array[]> {
  if (!worker || state.status !== "ready") throw new Error("Recognition model not ready");
  const bitmaps = await Promise.all(images.map((i) => createImageBitmap(i)));
  const id = nextId++;
  const w = worker;
  return new Promise<Float32Array[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error("Recognition timed out"));
    }, timeoutMs);
    pending.set(id, {
      resolve: (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      reject: (e) => {
        clearTimeout(timer);
        reject(e);
      },
    });
    const req: WorkerRequest = { type: "embed", id, images: bitmaps };
    w.postMessage(req, bitmaps);
  });
}
