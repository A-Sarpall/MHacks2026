import { readAloud } from "../lib/tts";
import { TAPBACK_EMOJI, type Tapback } from "../lib/messages";
import type { PrivateMessaging } from "../lib/usePrivateMessaging";

const TAPS: Tapback[] = ["like", "love", "laugh", "dislike", "emphasize", "question"];

// A text from someone arrives: it is read aloud (calm voice) and shown here, with big tapback buttons.
export function IncomingCard({ pm }: { pm: PrivateMessaging }) {
  const m = pm.incoming;
  if (!m) return null;
  return (
    <div data-testid="incoming-card" className="w-full max-w-2xl rounded-2xl border-2 border-blue-300 bg-blue-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500">{m.from === "Qu" ? "Message from Qu" : `Text from ${m.from}`}</div>
          <p className="mt-1 text-2xl leading-snug text-gray-900">{m.text}</p>
        </div>
        <button onClick={pm.dismissIncoming} className="px-3 py-1 rounded-lg text-gray-500 hover:bg-black/5" aria-label="Close">
          ✕
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => readAloud(m.from === "Qu" ? m.text : `${m.from} says: ${m.text}`).catch(() => {})}
          className="px-4 py-3 rounded-xl bg-white border border-gray-300 font-semibold text-gray-800 hover:bg-gray-100"
        >
          Read again
        </button>
        {m.contactId &&
          TAPS.map((k) => (
            <button
              key={k}
              onClick={() => void pm.tap(k).catch(() => {})}
              aria-label={`Tapback ${k}`}
              className={`w-14 h-14 rounded-xl border text-2xl ${m.reacted === k ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 hover:bg-gray-100"}`}
            >
              {TAPBACK_EMOJI[k]}
            </button>
          ))}
      </div>
    </div>
  );
}
