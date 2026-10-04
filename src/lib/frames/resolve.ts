import type { FrameInput, FrameProvider, SentenceFrame } from "./frame";
import { validateFrame } from "./frame";

export interface Resolved {
  frame: SentenceFrame;
  provider: string;
}

export interface ResolveOptions {
  timeoutMs: number;
  onReject?: (provider: string, reason: string) => void;
}

function withTimeout<T>(p: Promise<T>, ms: number, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timed out after ${ms} ms`)), ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new Error("aborted"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    p.then(
      (v) => {
        clearTimeout(t);
        signal.removeEventListener("abort", onAbort);
        resolve(v);
      },
      (e: unknown) => {
        clearTimeout(t);
        signal.removeEventListener("abort", onAbort);
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    );
  });
}

export async function resolveFrame(
  input: FrameInput,
  providers: FrameProvider[],
  signal: AbortSignal,
  opts: ResolveOptions
): Promise<Resolved | null> {
  for (const provider of providers) {
    if (signal.aborted) return null;
    try {
      const frame = await withTimeout(provider.frame(input, signal), opts.timeoutMs, signal);
      if (!frame) continue;
      const errors = validateFrame(frame, input.rules);
      if (errors.length > 0) {
        opts.onReject?.(provider.id, errors.join("; "));
        continue;
      }
      return { frame, provider: provider.id };
    } catch (err) {
      if (signal.aborted) return null;
      opts.onReject?.(provider.id, (err as Error).message);
    }
  }
  return null;
}
