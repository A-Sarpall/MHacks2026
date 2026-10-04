import { useState } from "react";

interface Props {
  /** Level highlighted for the ring (click = next, hold = send). */
  level: number;
  onLevel: (n: number) => void;
  onSend: (n: number | null) => Promise<void>;
  onClose: () => void;
}

// "I'm in pain": big 1-10 buttons. Sending hands the report to the Care agent, which checks the
// medicines, texts the caregiver and tells the user what it did (read aloud).
export function PainPanel({ level, onLevel, onSend, onClose }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const send = async (n: number | null) => {
    setState("sending");
    try {
      await onSend(n);
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <div data-testid="pain-panel" className="w-full max-w-2xl rounded-2xl border-2 border-red-300 bg-red-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500">Pain</div>
          <div className="text-xl font-bold text-gray-900">How much does it hurt?</div>
        </div>
        <button onClick={onClose} className="px-3 py-1 rounded-lg text-gray-500 hover:bg-black/5" aria-label="Close">
          ✕
        </button>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onLevel(n)}
            className={`h-16 rounded-xl border-2 text-2xl font-bold ${n === level ? "bg-red-600 border-red-700 text-white" : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"}`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => void send(level)}
          disabled={state === "sending" || state === "sent"}
          className="px-5 py-3 rounded-xl bg-red-600 text-white text-lg font-bold disabled:opacity-60"
        >
          Tell my caregiver: {level}/10
        </button>
        <button
          onClick={() => void send(null)}
          disabled={state === "sending" || state === "sent"}
          className="px-5 py-3 rounded-xl bg-white border border-gray-300 text-lg font-semibold text-gray-800 disabled:opacity-60"
        >
          I can't say
        </button>
        <span className="text-base text-gray-700">
          {state === "sending" && "Sending…"}
          {state === "sent" && "Sent. Your caregiver has been told."}
          {state === "error" && "Couldn't send. Is the hub running? Ask someone nearby."}
        </span>
      </div>
    </div>
  );
}
