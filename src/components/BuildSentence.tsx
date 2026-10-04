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
  stripHighlighted: boolean;
  actionLabel: string;
  onVerb: (verb: string) => void;
  onEnding: (ending: Ending) => void;
  onSay: () => void;
  onOpen: () => void;
}

const ENDING_LABEL: Record<Ending, string> = { now: "now", please: "please", later: "later", none: "nothing" };
const ENDING_WORD: Record<Ending, string> = { now: "now", please: ", please", later: "later", none: "" };

export function BuildSentence({ object, verbs, endings, state, highlight, stripHighlighted, actionLabel, onVerb, onEnding, onSay, onOpen }: Props) {
  const choosingEnding = state.step === "ending" && state.verb !== null;
  const slot = (text: string, filled: boolean) => (
    <span className={`inline-block rounded-md px-1.5 ${filled ? "bg-blue-100 text-blue-900" : "border border-dashed border-gray-400 text-gray-500"}`}>{text}</span>
  );
  return (
    <div className={`flex flex-col gap-1.5 rounded-xl ${stripHighlighted ? "outline outline-4 outline-blue-600 outline-offset-1" : ""}`} data-testid="build">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-stretch">
        <button
          onClick={(e) => {
            onOpen();
            e.currentTarget.blur();
          }}
          className="min-h-(--tap) px-3 rounded-xl border-2 border-gray-300 bg-white text-left text-lg font-semibold text-gray-900 leading-snug"
          data-testid="build-strip"
          aria-label="Build my own sentence"
        >
          I {slot(state.verb ?? "…", state.verb !== null)} the {object}
          {state.verb && state.ending !== "none" ? ENDING_WORD[state.ending] : ""}
          {state.verb ? "." : ""}
        </button>
        <button
          onClick={(e) => {
            onSay();
            e.currentTarget.blur();
          }}
          disabled={!state.verb}
          className="min-h-(--tap) px-4 rounded-xl bg-green-700 text-white text-lg font-bold disabled:opacity-40"
          data-testid="build-say"
        >
          {actionLabel}
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1.5" role="group" aria-label={choosingEnding ? "Add at the end" : "Pick a word"}>
        {(choosingEnding ? endings : verbs).map((c, i) => {
          const on = choosingEnding ? state.ending === c : state.verb === c;
          return (
            <button
              key={c}
              onClick={(e) => {
                if (choosingEnding) onEnding(c as Ending);
                else onVerb(c);
                e.currentTarget.blur();
              }}
              aria-pressed={on}
              className={`min-h-(--tap) px-1.5 rounded-xl border-2 text-base sm:text-lg small-when-short font-semibold leading-tight ${
                on ? "bg-blue-600 border-blue-700 text-white" : "bg-white border-gray-300 text-gray-900"
              } ${highlight === i ? "outline outline-4 outline-blue-600 outline-offset-1" : ""}`}
              data-testid={choosingEnding ? "build-ending" : "build-verb"}
            >
              {choosingEnding ? ENDING_LABEL[c as Ending] : c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
