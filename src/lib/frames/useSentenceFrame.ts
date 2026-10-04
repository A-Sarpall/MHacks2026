import { useEffect, useRef, useState } from "react";
import type { FrameInput, FrameProvider } from "./frame";
import { resolveFrame, type Resolved } from "./resolve";

export type FrameState = { status: "idle" } | { status: "loading" } | { status: "ready"; resolved: Resolved } | { status: "none" };

export function useSentenceFrame(input: FrameInput | null, providers: FrameProvider[], timeoutMs: number): FrameState {
  const [state, setState] = useState<FrameState>({ status: "idle" });
  const cache = useRef(new Map<string, Resolved | null>());
  const inputRef = useRef(input);
  inputRef.current = input;
  const key = input ? `${input.captureId}|${input.intent.id}|${input.object.label}` : null;

  useEffect(() => {
    const current = inputRef.current;
    if (!key || !current) {
      setState({ status: "idle" });
      return;
    }
    if (cache.current.has(key)) {
      const hit = cache.current.get(key)!;
      setState(hit ? { status: "ready", resolved: hit } : { status: "none" });
      return;
    }
    const controller = new AbortController();
    setState({ status: "loading" });
    void resolveFrame(current, providers, controller.signal, {
      timeoutMs,
      onReject: (provider, reason) => console.warn(`[frames] ${provider} frame rejected: ${reason}`),
    }).then((resolved) => {
      if (controller.signal.aborted) return;
      cache.current.set(key, resolved);
      if (resolved) console.info("[frames]", JSON.stringify({ provider: resolved.provider, key }));
      setState(resolved ? { status: "ready", resolved } : { status: "none" });
    });
    return () => controller.abort();
  }, [key, providers, timeoutMs]);

  return state;
}
