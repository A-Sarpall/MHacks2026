import type { Ending } from "../data/profiles";

export interface BuildState {
  step: "verb" | "ending";
  verb: string | null;
}

interface Props {
  object: string;
  verbs: string[];
  endings: Ending[];
  state: BuildState;
  highlight: number | null;
  preview: string;
  onVerb: (verb: string) => void;
  onEnding: (ending: Ending) => void;
  onBack: () => void;
}

const ENDING_LABEL: Record<Ending, string> = { now: "now", please: "please", later: "later", none: "(nothing)" };

export function BuildSentence({ object, verbs, endings, state, highlight, preview, onVerb, onEnding, onBack }: Props) {
  const choices = state.step === "verb" ? verbs : endings;
  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border-2 border-blue-600 bg-white p-4 flex flex-col gap-3" data-testid="build">
      <div className="text-xs uppercase tracking-wider text-gray-500">
        Build my own · {state.step === "verb" ? "pick a word" : "pick an ending"}
      </div>
      <div className="text-2xl font-bold text-gray-900" data-testid="build-preview">
        {preview}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {choices.map((c, i) => (
          <button
            key={c}
            onClick={(e) => {
              if (state.step === "verb") onVerb(c);
              else onEnding(c as Ending);
              e.currentTarget.blur();
            }}
            className={`min-h-14 px-3 py-2 rounded-xl border-2 border-gray-300 bg-gray-50 text-lg font-semibold text-gray-900 ${
              highlight === i ? "outline outline-4 outline-blue-600 outline-offset-1" : ""
            }`}
            data-testid="build-choice"
          >
            {state.step === "verb" ? `I ${c} the ${object}` : ENDING_LABEL[c as Ending]}
          </button>
        ))}
      </div>
      <button onClick={onBack} className="self-start px-3 py-1.5 rounded-lg border border-gray-300 text-sm">
        Back
      </button>
    </div>
  );
}
