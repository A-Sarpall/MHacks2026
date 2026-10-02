// Lightweight pause detector (energy-based VAD) for "speak at the next pause".
// Listens to the mic, tracks an adaptive noise floor, and fires onPause once
// someone has spoken and then gone quiet. Swap for vad-web/Silero later.

const TICK_MS = 50;
const MIN_SPEECH_MS = 250; // speech needed before a pause counts
const PAUSE_MS = 700; // silence that counts as a turn-taking pause

export interface PauseDetector {
  stop(): void;
}

export async function startPauseDetector(
  onPause: () => void,
  onLevel?: (level: number, speaking: boolean) => void
): Promise<PauseDetector> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
  });
  const ctx = new AudioContext();
  // May start suspended under autoplay rules; the toggle click counts as a gesture
  await ctx.resume().catch(() => {});
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  source.connect(analyser);
  const buf = new Float32Array(analyser.fftSize);

  let floor = 0.01;
  let speechMs = 0;
  let silenceMs = 0;
  let fired = false;

  const timer = setInterval(() => {
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) sum += v * v;
    const rms = Math.sqrt(sum / buf.length);

    const speaking = rms > Math.max(floor * 2.5, 0.015);
    if (!speaking) floor = floor * 0.95 + rms * 0.05; // adapt to room noise

    if (speaking) {
      speechMs += TICK_MS;
      silenceMs = 0;
    } else {
      silenceMs += TICK_MS;
      if (speechMs >= MIN_SPEECH_MS && silenceMs >= PAUSE_MS && !fired) {
        fired = true;
        onPause();
      }
    }
    onLevel?.(rms, speaking);
  }, TICK_MS);

  return {
    stop() {
      clearInterval(timer);
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close();
    },
  };
}
