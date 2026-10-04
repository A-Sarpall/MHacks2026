// Reads a medicine bottle label from a photo. Needs ANTHROPIC_API_KEY in server/.env.local.
// Returns only what is printed on the label; matching against the patient's list is done in meds.ts.
import Anthropic from "@anthropic-ai/sdk";
import type { LabelRead } from "./meds.ts";

const MODEL = "claude-haiku-4-5";
let client: Anthropic | null = null;

export const labelReaderConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

export async function readLabel(jpegBase64: string): Promise<LabelRead> {
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 15_000 });
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 150,
    system:
      "You read medicine bottle labels from photos. Reply with ONLY a JSON object: " +
      '{"drug": string|null, "strength": string|null}. "drug" is the medicine name printed on the label (generic or brand, as printed). ' +
      '"strength" is the strength with its unit, e.g. "50 mg". Use null for anything you cannot read clearly. Never guess.',
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: jpegBase64 } },
          { type: "text", text: "Read the label." },
        ],
      },
    ],
  });
  const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const json = /\{[\s\S]*\}/.exec(text)?.[0];
  if (!json) return { drug: null };
  try {
    const o = JSON.parse(json) as LabelRead;
    return { drug: typeof o.drug === "string" ? o.drug : null, strength: typeof o.strength === "string" ? o.strength : null };
  } catch {
    return { drug: null };
  }
}
