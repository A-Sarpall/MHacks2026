import { useState } from "react";
import type { LabelRead, MedVerdict, VerdictKind } from "../lib/meds";

export type MedState =
  | { status: "ask" } // manual entry: nothing was photographed
  | { status: "checking" }
  | { status: "done"; verdict: MedVerdict; read: LabelRead | null }
  | { status: "error"; message: string };

const STYLE: Record<VerdictKind, { box: string; title: string }> = {
  match: { box: "bg-green-50 border-green-300", title: "On your list" },
  "dose-mismatch": { box: "bg-amber-50 border-amber-400", title: "Different strength. Don't take it" },
  allergy: { box: "bg-red-50 border-red-400", title: "Allergy. Don't take it" },
  unknown: { box: "bg-red-50 border-red-400", title: "Not your medicine. Don't take it" },
  unreadable: { box: "bg-amber-50 border-amber-400", title: "Couldn't read the label" },
};

interface Props {
  state: MedState;
  onTaken: (key: string) => Promise<void>;
  onType: (drug: string, strength: string) => void;
  onDismiss: () => void;
}

export function MedCard({ state, onTaken, onType, onDismiss }: Props) {
  const [taken, setTaken] = useState<string | null>(null);
  const [drug, setDrug] = useState("");
  const [strength, setStrength] = useState("");
  const kind: VerdictKind | null = state.status === "done" ? state.verdict.kind : state.status === "error" ? "unreadable" : null;
  const style = kind
    ? STYLE[kind]
    : { box: "bg-blue-50 border-blue-300", title: state.status === "ask" ? "Which medicine is it?" : "Checking your medicine…" };
  const canType = state.status !== "checking"; // always allow checking another one

  return (
    <div data-testid="med-card" className={`w-full max-w-2xl rounded-2xl border-2 p-4 ${style.box}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500">Medication check</div>
          <div className="text-xl font-bold text-gray-900">{style.title}</div>
        </div>
        <button onClick={onDismiss} className="px-3 py-1 rounded-lg text-gray-500 hover:bg-black/5" aria-label="Close">
          ✕
        </button>
      </div>
      {state.status === "done" && <p className="mt-2 text-xl leading-snug text-gray-900">{state.verdict.speech}</p>}
      {state.status === "error" && (
        <p className="mt-2 text-base text-gray-700">
          {state.message}. Don't take it until you know what it is.
        </p>
      )}
      {state.status === "done" && state.verdict.kind === "match" && state.verdict.med && (
        <div className="mt-3">
          {taken === state.verdict.med.key ? (
            <span className="text-base font-semibold text-green-800">Noted: {state.verdict.med.short} taken just now.</span>
          ) : (
            <button
              onClick={() => {
                const key = state.verdict.med!.key;
                void onTaken(key).then(() => setTaken(key));
              }}
              className="px-5 py-3 rounded-xl bg-green-700 text-white text-lg font-bold"
            >
              I took it
            </button>
          )}
        </div>
      )}
      {state.status === "done" && state.read?.drug && (
        <p className="mt-1 text-sm text-gray-500">
          Label says: {state.read.drug}
          {state.read.strength ? `, ${state.read.strength}` : ""}
        </p>
      )}
      {canType && (
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (drug.trim()) onType(drug.trim(), strength.trim());
          }}
        >
          <input
            value={drug}
            onChange={(e) => setDrug(e.target.value)}
            placeholder="Type the name on the bottle"
            className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-gray-300 bg-white text-lg"
          />
          <input
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            placeholder="Strength (50 mg)"
            className="w-36 px-3 py-2 rounded-lg border border-gray-300 bg-white text-lg"
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">
            Check
          </button>
        </form>
      )}
    </div>
  );
}
