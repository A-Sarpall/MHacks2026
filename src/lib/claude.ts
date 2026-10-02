// Optional Claude API access straight from the browser (prototype only — the
// key is visible to anyone with the page; see DECISIONS.md). Enabled when
// VITE_ANTHROPIC_API_KEY is set in .env.local. The SDK is loaded lazily so the
// app stays light and fully offline-capable without a key.
import type Anthropic from "@anthropic-ai/sdk";

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
export const CLAUDE_MODEL = "claude-haiku-4-5";

let clientPromise: Promise<Anthropic> | null = null;

export function hasClaude(): boolean {
  return Boolean(API_KEY);
}

export function getClaude(): Promise<Anthropic> {
  if (!API_KEY) return Promise.reject(new Error("No VITE_ANTHROPIC_API_KEY"));
  clientPromise ??= import("@anthropic-ai/sdk").then(
    ({ default: AnthropicClient }) =>
      new AnthropicClient({
        apiKey: API_KEY,
        dangerouslyAllowBrowser: true,
        // Interactive UI: fail fast and keep the on-device result instead
        maxRetries: 1,
        timeout: 15_000,
      })
  );
  return clientPromise;
}

export function textOf(message: Anthropic.Message): string {
  if (message.stop_reason === "refusal") return "";
  return message.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
}
