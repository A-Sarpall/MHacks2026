import type { Ending } from "../data/profiles";

export interface BuildState {
  step: "verb" | "ending";
  verb: string | null;
  ending: Ending;
}

interface Props {
  object: string;
  verbs: string[];
  endings: Ending[];
  state: BuildState;
  highlight: number | null;
  sentence: string;
  actionLabel: string;
  onVerb: (verb: string) => void;
  onEnding: (ending: Ending) => void;
  onSay: () => void;
  onBack: () => void;
}

const ENDING_LABEL: Record<Ending, string> = { now: "now", please: "please", later: "later", none: "nothing" };

export function BuildSentence({ object, verbs, endings, state, highlight, sentence, actionLabel, onVerb, onEnding, onSay, onBack }: Props) {
  const hl = (step: BuildState["step"], i: number) => (state.step === step && highlight === i ? "outline outline-4 outline-blue-600 outline-offset-1" : "");
  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border-2 border-blue-600 bg-white p-4 flex flex-col gap-4" data-testid="build">
      <div className="text-3xl font-bold text-gray-900 leading-tight min-h-10" data-testid="build-preview">
        {sentence}
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-sm uppercase tracking-wider text-gray-500">Pick a word</div>
        <div className="grid grid-cols-2 gap-2">
          {verbs.map((v, i) => (
            <button
              key={v}
              onClick={(e) => {
                onVerb(v);
                e.currentTarget.blur();
              }}
              aria-pressed={state.verb === v}
              className={`min-h-16 px-4 py-3 rounded-xl border-2 text-lg font-semibold text-left ${
                state.verb === v ? "bg-blue-600 border-blue-700 text-white" : "bg-white border-gray-300 text-gray-900"
              } ${hl("verb", i)}`}
              data-testid="build-verb"
            >
              I {v} the {object}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-sm uppercase tracking-wider text-gray-500">Add at the end</div>
        <div className="grid grid-cols-4 gap-2">
          {endings.map((en, i) => (
            <button
              key={en}
              onClick={(e) => {
                onEnding(en);
                e.currentTarget.blur();
              }}
              aria-pressed={state.ending === en}
              className={`min-h-14 px-2 rounded-xl border-2 text-lg font-semibold ${
                state.ending === en ? "bg-blue-600 border-blue-700 text-white" : "bg-white border-gray-300 text-gray-900"
              } ${hl("ending", i)}`}
              data-testid="build-ending"
            >
              {ENDING_LABEL[en]}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <button
          onClick={(e) => {
            onSay();
            e.currentTarget.blur();
          }}
          disabled={!state.verb}
          className="min-h-16 px-4 rounded-xl bg-green-700 text-white text-xl font-bold disabled:opacity-40"
          data-testid="build-say"
        >
          {actionLabel}
        </button>
        <button onClick={onBack} className="min-h-16 px-5 rounded-xl border-2 border-gray-300 text-lg font-semibold text-gray-900">
          Back
        </button>
      </div>
    </div>
  );
}
