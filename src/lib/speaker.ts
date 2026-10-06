// Speaks Qu's answer sentence by sentence as it streams in.
//   ElevenLabs (through the hub, POST /voice/speak) when the hub has a key, else browser SpeechSynthesis.
//   With ElevenLabs, audio for the next sentences is fetched while the current one plays.
//   stop() drops everything queued: a new press always wins.
import { HUB } from "./hub";
import { browserSpeak, browserStop, speechRate } from "./speak";

interface Item {
  text: string;
  audio: Promise<string | null> | null;
}

type Listener = (speaking: string | null) => void;

const FETCH_TIMEOUT_MS = 4000;

export class Speaker {
  private queue: Item[] = [];
  private generation = 0;
  private running = false;
  private current: HTMLAudioElement | null = null;
  private eleven = false;
  private failures = 0;
  private listeners = new Set<Listener>();
  private idleWaiters: (() => void)[] = [];
  /** Text actually spoken, for tests and the transcript. */
  readonly log: string[] = [];

  /** Use the hub's ElevenLabs voice (true) or the browser voice (false). */
  setElevenLabs(on: boolean): void {
    this.eleven = on;
    this.failures = 0;
  }

  usingElevenLabs(): boolean {
    return this.eleven;
  }

  onChange(cb: Listener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  say(text: string): void {
    const t = text.trim();
    if (!t) return;
    this.queue.push({ text: t, audio: this.eleven ? this.fetchAudio(t) : null });
    if (!this.running) void this.run(this.generation);
  }

  stop(): void {
    this.generation++;
    for (const item of this.queue) void item.audio?.then((u) => u && URL.revokeObjectURL(u));
    this.queue = [];
    this.current?.pause();
    this.current = null;
    browserStop();
    this.running = false;
    this.emit(null);
    this.flushIdle();
  }

  busy(): boolean {
    return this.running || this.queue.length > 0;
  }

  /** Resolves when everything queued so far has been spoken (or stop() was called). */
  idle(): Promise<void> {
    if (!this.busy()) return Promise.resolve();
    return new Promise((r) => this.idleWaiters.push(r));
  }

  private emit(s: string | null): void {
    for (const l of this.listeners) l(s);
  }

  private flushIdle(): void {
    const w = this.idleWaiters;
    this.idleWaiters = [];
    w.forEach((r) => r());
  }

  private async fetchAudio(text: string): Promise<string | null> {
    try {
      const res = await fetch(`${HUB}/voice/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`hub ${res.status}`);
      return URL.createObjectURL(await res.blob());
    } catch (err) {
      console.warn("[speaker] ElevenLabs unavailable, using the browser voice:", (err as Error).message);
      if (++this.failures >= 2) this.eleven = false;
      return null;
    }
  }

  private playUrl(url: string, gen: number): Promise<void> {
    return new Promise((resolve) => {
      if (gen !== this.generation) return resolve();
      const audio = new Audio(url);
      audio.playbackRate = speechRate();
      this.current = audio;
      const done = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onended = done;
      audio.onerror = done;
      audio.onpause = done;
      audio.play().catch(done);
    });
  }

  private async run(gen: number): Promise<void> {
    this.running = true;
    while (gen === this.generation && this.queue.length > 0) {
      const item = this.queue.shift()!;
      this.emit(item.text);
      const url = item.audio ? await item.audio : null;
      if (gen !== this.generation) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      this.log.push(item.text);
      if (url) await this.playUrl(url, gen);
      else await browserSpeak(item.text);
    }
    if (gen !== this.generation) return;
    this.running = false;
    this.emit(null);
    this.flushIdle();
  }
}

export const speaker = new Speaker();
