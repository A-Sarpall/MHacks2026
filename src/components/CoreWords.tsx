import { CORE_WORDS, type CoreWord } from "../lib/types";

interface Props {
  selectedCoreWords: string[];
  onToggle: (word: CoreWord) => void;
}

const WORD_COLORS: Record<CoreWord, string> = {
  want: "bg-green-100 text-green-800 hover:bg-green-200",
  no: "bg-red-100 text-red-800 hover:bg-red-200",
  more: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  go: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  help: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  yes: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  question: "bg-purple-100 text-purple-800 hover:bg-purple-200",
};

export function CoreWords({ selectedCoreWords, onToggle }: Props) {
  return (
    <div className="flex gap-2 items-center justify-center flex-wrap">
      {CORE_WORDS.map((word) => {
        const selected = selectedCoreWords.includes(word);
        return (
          <button
            key={word}
            onClick={() => onToggle(word)}
            className={`
              px-5 py-3 rounded-xl text-lg font-bold uppercase tracking-wide transition-all
              ${
                selected
                  ? "ring-3 ring-blue-500 scale-105 shadow-lg"
                  : ""
              }
              ${WORD_COLORS[word]}
            `}
          >
            {word}
          </button>
        );
      })}
    </div>
  );
}
