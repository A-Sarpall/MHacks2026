import { AutoProcessor, RawImage, SiglipVisionModel, env } from "@huggingface/transformers";
import { SIGLIP } from "./siglipConfig";

export type WorkerRequest =
  | { type: "init"; base: string; forceWasm: boolean }
  | { type: "embed"; id: number; images: ImageBitmap[] };

export type WorkerResponse =
  | { type: "progress"; file: string; loaded: number; total: number }
  | { type: "ready"; device: "webgpu" | "wasm"; ms: number }
  | { type: "embedded"; id: number; vectors: Float32Array[]; ms: number }
  | { type: "error"; id?: number; message: string };

type Processor = Awaited<ReturnType<typeof AutoProcessor.from_pretrained>>;
type Model = Awaited<ReturnType<typeof SiglipVisionModel.from_pretrained>>;

let processor: Processor | null = null;
let model: Model | null = null;

const post = (msg: WorkerResponse, transfer: Transferable[] = []) =>
  (self as unknown as Worker).postMessage(msg, transfer);

async function hasWebGpu(): Promise<boolean> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
  if (!gpu) return false;
  try {
    return (await gpu.requestAdapter()) !== null;
  } catch {
    return false;
  }
}

async function init(base: string, forceWasm: boolean): Promise<void> {
  const t0 = performance.now();
  env.allowLocalModels = true;
  env.allowRemoteModels = true;
  env.localModelPath = `${base}models/`;
  const wasm = env.backends.onnx.wasm;
  if (wasm) {
    wasm.wasmPaths = {
      mjs: `${base}ort/ort-wasm-simd-threaded.asyncify.mjs`,
      wasm: `${base}ort/ort-wasm-simd-threaded.asyncify.wasm`,
    };
  }
  const progress_callback = (p: { status: string; file?: string; loaded?: number; total?: number }) => {
    if (p.status === "progress" && p.file) {
      post({ type: "progress", file: p.file, loaded: p.loaded ?? 0, total: p.total ?? 0 });
    }
  };
  processor = await AutoProcessor.from_pretrained(SIGLIP.model, { progress_callback });
  const devices: ("webgpu" | "wasm")[] = !forceWasm && (await hasWebGpu()) ? ["webgpu", "wasm"] : ["wasm"];
  let lastErr: unknown = null;
  for (const device of devices) {
    try {
      model = await SiglipVisionModel.from_pretrained(SIGLIP.model, {
        device,
        dtype: device === "webgpu" ? SIGLIP.visionDtypeWebgpu : SIGLIP.visionDtypeWasm,
        progress_callback,
      });
      await embed([new RawImage(new Uint8ClampedArray(32 * 32 * 3).fill(128), 32, 32, 3)]);
      post({ type: "ready", device, ms: performance.now() - t0 });
      return;
    } catch (err) {
      lastErr = err;
      model = null;
    }
  }
  throw lastErr ?? new Error("Could not load the recognition model");
}

function toRaw(bitmap: ImageBitmap): RawImage {
  const c = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = c.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  return new RawImage(data, c.width, c.height, 4).rgb();
}

async function embed(images: RawImage[]): Promise<Float32Array[]> {
  if (!processor || !model) throw new Error("Recognition model not loaded");
  const inputs = await processor(images);
  const { pooler_output } = await model(inputs);
  const data = pooler_output.data as Float32Array;
  const dims = SIGLIP.dims;
  return images.map((_, i) => {
    const v = data.slice(i * dims, (i + 1) * dims);
    let n = 0;
    for (const x of v) n += x * x;
    n = Math.sqrt(n) || 1;
    for (let k = 0; k < v.length; k++) v[k] /= n;
    return v;
  });
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data;
  if (msg.type === "init") {
    try {
      await init(msg.base, msg.forceWasm);
    } catch (err) {
      post({ type: "error", message: String((err as Error)?.message ?? err) });
    }
    return;
  }
  const t0 = performance.now();
  try {
    const vectors = await embed(msg.images.map(toRaw));
    post({ type: "embedded", id: msg.id, vectors, ms: performance.now() - t0 }, vectors.map((v) => v.buffer));
  } catch (err) {
    post({ type: "error", id: msg.id, message: String((err as Error)?.message ?? err) });
  }
};
