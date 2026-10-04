// Voice used by the app: ElevenLabs through the hub when it is up, browser SpeechSynthesis otherwise.
//   speak(text)         streams a sentence from the hub (POST /voice/speak)
//   playBackchannel(id) plays a pre-generated clip from /reactions/<id>.mp3 (local, instant)
// Any failure (hub down, no key, slow network) falls back to browserTTS so the app always speaks.
import { HUB } from "./hub";
import { browserTTS, type TTSEngine } from "./speak";
import type { Backchannel } from "./types";

const SPEAK_TIMEOUT_MS = 4000;

let current: HTMLAudioElement | null = null;
let clips: Map<string, HTMLAudioElement> | null = null;
let loadingClips: Promise<void> | null = null;

function loadClips(): Promise<void> {
  loadingClips ??= fetch("/reactions/manifest.json")
    .then((r) => (r.ok ? (r.json() as Promise<{ ids: string[] }>) : { ids: [] }))
    .then(({ ids }) => {
      clips = new Map(
        ids.map((id) => {
          const a = new Audio(`/reactions/${id}.mp3`);
          a.preload = "auto";
          return [id, a];
        })
      );
    })
    .catch(() => {
      clips = new Map();
    });
  return loadingClips;
}
void loadClips();

function stopAudio(): void {
  current?.pause();
  current = null;
}

function play(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve, reject) => {
    current = audio;
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("audio error"));
    audio.play().catch(reject);
  });
}

async function speakWith(text: string, reader: boolean): Promise<void> {
  browserTTS.stop();
  stopAudio();
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), SPEAK_TIMEOUT_MS);
  let url: string;
  try {
    const res = await fetch(`${HUB}/voice/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, reader }),
      signal: ctl.signal,
    });
    if (!res.ok) throw new Error(`hub ${res.status}`);
    url = URL.createObjectURL(await res.blob());
  } catch (err) {
    console.warn("[tts] ElevenLabs unavailable, using browser voice:", (err as Error).message);
    return browserTTS.speak(text);
  } finally {
    clearTimeout(timer);
  }
  try {
    await play(new Audio(url));
  } catch (err) {
    console.warn("[tts] playback failed, using browser voice:", err);
    await browserTTS.speak(text);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function playBackchannel(id: Backchannel): void {
  const clip = clips?.get(id);
  if (!clip) return browserTTS.playBackchannel(id);
  browserTTS.stop();
  stopAudio();
  clip.currentTime = 0;
  current = clip;
  clip.play().catch(() => browserTTS.playBackchannel(id));
}

async function speak(text: string): Promise<void> {
  return speakWith(text, false);
}

/** Read someone else's message aloud in the calm, slower reader voice (not the user's own voice). */
export function readAloud(text: string): Promise<void> {
  return speakWith(text, true);
}

export const tts: TTSEngine = {
  speak,
  stop: () => {
    stopAudio();
    browserTTS.stop();
  },
  playBackchannel,
};
