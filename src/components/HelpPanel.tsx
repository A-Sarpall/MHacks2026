import { useState } from "react";
import type { Contact } from "../lib/messages";

interface Props {
  contacts: Contact[];
  onSay: () => void;
  onText: (contact: Contact) => Promise<void>;
  onClose: () => void;
}

// "I need help": say it out loud, or text a contact privately (Photon, through the hub).
// Ring: click = say it, hold = text the people selected under the camera (else the first contact), double = close.
export function HelpPanel({ contacts, onSay, onText, onClose }: Props) {
  const [state, setState] = useState<{ kind: "idle" | "sending" | "error" } | { kind: "sent"; to: string }>({ kind: "idle" });

  const text = async (c: Contact) => {
    setState({ kind: "sending" });
    try {
      await onText(c);
      setState({ kind: "sent", to: c.name });
    } catch {
      setState({ kind: "error" });
    }
  };

  return (
    <div data-testid="help-panel" className="w-full max-w-2xl rounded-2xl border-2 border-red-300 bg-red-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500">Help</div>
          <div className="text-xl font-bold text-gray-900">I need help</div>
        </div>
        <button onClick={onClose} className="px-3 py-1 rounded-lg text-gray-500 hover:bg-black/5" aria-label="Close">
          ✕
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={onSay} className="px-5 py-3 rounded-xl bg-red-600 text-white text-lg font-bold">
          Say it out loud
        </button>
        {contacts.map((c) => (
          <button
            key={c.id}
            onClick={() => void text(c)}
            disabled={state.kind === "sending"}
            className="px-5 py-3 rounded-xl bg-white border border-gray-300 text-lg font-semibold text-gray-800 hover:bg-gray-100 disabled:opacity-60"
          >
            Text {c.name}
          </button>
        ))}
      </div>
      <div className="mt-2 text-base text-gray-700">
        {contacts.length === 0 && "No one to text yet: add contacts in the hub (QU_CONTACTS)."}
        {state.kind === "sending" && "Sending…"}
        {state.kind === "sent" && `Sent. ${state.to} knows you need help.`}
        {state.kind === "error" && "Couldn't send. Is the hub running? Ask someone nearby."}
      </div>
    </div>
  );
}
