// Speaking on the phone. The cloned voice comes from the hub (ElevenLabs) over the USB cable; when the hub is not
// reachable or too slow to start, the phone's own voice says it instead, so the user is never left silent.
import * as Speech from 'expo-speech';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

let current: AudioPlayer | null = null;
void setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

function stopAll() {
  void Speech.stop();
  try {
    current?.remove();
  } catch {
    // already released
  }
  current = null;
}

/** Resolves true once the clip actually starts playing, false if it has not started within `startMs`. */
function playUrl(url: string, startMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const p = createAudioPlayer({ uri: url });
    current = p;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      sub.remove();
      resolve(ok);
    };
    const sub = p.addListener('playbackStatusUpdate', (st) => {
      if (st.playing || st.currentTime > 0) finish(true);
    });
    const timer = setTimeout(() => finish(false), startMs);
    p.play();
  });
}

/** Say a sentence: the cloned voice through the hub when it is up, else the phone's voice. Returns which was used. */
export async function say(text: string, hubHttp: string | null): Promise<'hub' | 'phone'> {
  stopAll();
  if (hubHttp && (await playUrl(`${hubHttp}/voice/speak?text=${encodeURIComponent(text)}`, 4000))) return 'hub';
  stopAll();
  Speech.speak(text, { rate: 0.95 });
  return 'phone';
}

/** A quick reaction ("Yes!"): the pre-made clip from the hub (instant), else the phone's voice. */
export async function react(id: string, words: string, hubHttp: string | null): Promise<'hub' | 'phone'> {
  stopAll();
  if (hubHttp && (await playUrl(`${hubHttp}/voice/reaction/${encodeURIComponent(id)}`, 2000))) return 'hub';
  stopAll();
  Speech.speak(words, { rate: 1.05 });
  return 'phone';
}

/** Tell the hub what the user said aloud (for the caregiver's daily summary). Best effort. */
export function logSaid(hubHttp: string | null, text: string): void {
  if (!hubHttp) return;
  fetch(`${hubHttp}/care/log`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }).catch(() => {});
}

/** The user reported pain from a quick phrase: the hub's care agent takes it from there. */
export function reportPain(hubHttp: string | null): void {
  if (!hubHttp) return;
  fetch(`${hubHttp}/care/pain`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }).catch(() => {});
}
