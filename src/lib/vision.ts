// Shared MediaPipe runtime loader. The wasm files are served locally from
// public/mediapipe/wasm (copied from node_modules by scripts/copy-wasm.mjs)
// so the runtime always matches the installed package version.
import { FilesetResolver } from "@mediapipe/tasks-vision";

type Fileset = Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>;

const WASM_PATH = `${import.meta.env.BASE_URL}mediapipe/wasm`;

let filesetPromise: Promise<Fileset> | null = null;

export function getVisionFileset(): Promise<Fileset> {
  filesetPromise ??= FilesetResolver.forVisionTasks(WASM_PATH);
  return filesetPromise;
}

// Add ?delegate=CPU to the URL to force CPU inference (handy if a GPU driver
// misbehaves).
const FORCE_CPU =
  new URLSearchParams(window.location.search).get("delegate")?.toUpperCase() ===
  "CPU";

// Try GPU first; some machines/browsers fail to create a WebGL context for
// MediaPipe, in which case we fall back to CPU.
export async function createWithFallback<T>(
  create: (delegate: "GPU" | "CPU") => Promise<T>
): Promise<T> {
  if (FORCE_CPU) return create("CPU");
  try {
    return await create("GPU");
  } catch (err) {
    console.warn("[vision] GPU delegate failed, falling back to CPU", err);
    return create("CPU");
  }
}

// Prefer a locally served copy of a model (public/models, downloaded by
// scripts/fetch-models.mjs) and fall back to the CDN. Vite's dev server answers
// missing files with index.html, so check the content type, not just the status.
export async function resolveModel(file: string, remoteUrl: string): Promise<string> {
  const local = `${import.meta.env.BASE_URL}models/${file}`;
  try {
    const res = await fetch(local, { method: "HEAD" });
    const type = res.headers.get("content-type") ?? "";
    if (res.ok && !type.includes("text/html")) return local;
  } catch {
    // fall through to CDN
  }
  return remoteUrl;
}
