// ElevenLabs voice: the key stays here; the browser only ever talks to the hub.
//   Sentences  -> Flash v2.5 (lowest latency), streamed through POST /voice/speak
//   Reactions  -> Eleven v3 (expressive, e.g. [laughs]), generated once by `npm run voice -- reactions`
//                 into public/reactions/ and played from the browser's local cache
//   Voice      -> ELEVENLABS_VOICE_ID, else server/voice.json (written by `voice clone`), else a stock voice
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import type { ServerResponse } from "node:http";

const API = "https://api.elevenlabs.io";
export const SENTENCE_MODEL = "eleven_flash_v2_5";
export const REACTION_MODEL = "eleven_v3";
const FORMAT = "mp3_44100_64";
const STOCK_VOICE = { voiceId: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (stock)" }; // premade, for development
const VOICE_FILE = fileURLToPath(new URL("./voice.json", import.meta.url));
export const REACTIONS_DIR = fileURLToPath(new URL("../public/reactions/", import.meta.url));

/** id -> text sent to Eleven v3. Square-bracket tags are v3 audio tags. */
export const REACTIONS: Record<string, string> = {
  yes: "Yes!",
  no: "No.",
  haha: "[laughs] Ha ha ha!",
  "mm-hmm": "Mm-hmm.",
  wait: "Wait.",
  "hold-on": "Hold on.",
  wow: "Wow!",
  okay: "Okay.",
  thanks: "Thank you!",
};

const key = () => {
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) throw new Error("ELEVENLABS_API_KEY is not set in server/.env.local");
  return k;
};

export function currentVoice(): { voiceId: string; name: string; cloned: boolean } {
  if (process.env.ELEVENLABS_VOICE_ID) return { voiceId: process.env.ELEVENLABS_VOICE_ID, name: "env voice", cloned: true };
  if (existsSync(VOICE_FILE)) {
    const v = JSON.parse(readFileSync(VOICE_FILE, "utf8")) as { voiceId: string; name: string };
    return { ...v, cloned: true };
  }
  return { ...STOCK_VOICE, cloned: false };
}

export function configured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

function ttsUrl(voiceId: string, stream: boolean): string {
  return `${API}/v1/text-to-speech/${voiceId}${stream ? "/stream" : ""}?output_format=${FORMAT}`;
}

/** Calm, slow voice for reading other people's messages aloud (not the user's own cloned voice). */
export const READER = { voiceId: process.env.ELEVENLABS_READER_VOICE_ID ?? STOCK_VOICE.voiceId, settings: { stability: 0.75, speed: 0.85 } };

async function ttsRequest(text: string, model: string, stream: boolean, reader = false): Promise<Response> {
  const res = await fetch(ttsUrl(reader ? READER.voiceId : currentVoice().voiceId, stream), {
    method: "POST",
    headers: { "xi-api-key": key(), "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: model, ...(reader ? { voice_settings: READER.settings } : {}) }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res;
}

/** Pipe streamed mp3 for `text` straight to the browser as it is generated. */
export async function speak(text: string, res: ServerResponse, cors: Record<string, string>, reader = false): Promise<void> {
  const upstream = await ttsRequest(text, SENTENCE_MODEL, true, reader);
  res.writeHead(200, { "Content-Type": "audio/mpeg", "Cache-Control": "no-store", ...cors });
  Readable.fromWeb(upstream.body as import("node:stream/web").ReadableStream).pipe(res);
}

/** Generate every reaction clip into public/reactions/ plus a manifest the browser reads. */
export async function generateReactions(): Promise<string[]> {
  mkdirSync(REACTIONS_DIR, { recursive: true });
  const done: string[] = [];
  for (const [id, text] of Object.entries(REACTIONS)) {
    const audio = Buffer.from(await (await ttsRequest(text, REACTION_MODEL, false)).arrayBuffer());
    writeFileSync(`${REACTIONS_DIR}${id}.mp3`, audio);
    done.push(id);
    console.log(`[voice] ${id}: ${audio.length} bytes`);
  }
  writeFileSync(`${REACTIONS_DIR}manifest.json`, JSON.stringify({ voice: currentVoice().name, ids: done }, null, 2));
  return done;
}

/** Instant voice clone from one or more clean recordings. Saves the id to server/voice.json. */
export async function cloneVoice(files: string[], name: string): Promise<string> {
  const form = new FormData();
  form.set("name", name);
  form.set("remove_background_noise", "true");
  for (const f of files) form.append("files", new Blob([readFileSync(f)]), basename(f));
  const res = await fetch(`${API}/v1/voices/add`, { method: "POST", headers: { "xi-api-key": key() }, body: form });
  const body = (await res.json()) as { voice_id?: string; detail?: unknown };
  if (!res.ok || !body.voice_id) throw new Error(`clone failed ${res.status}: ${JSON.stringify(body.detail ?? body)}`);
  writeFileSync(VOICE_FILE, JSON.stringify({ voiceId: body.voice_id, name }, null, 2));
  return body.voice_id;
}
