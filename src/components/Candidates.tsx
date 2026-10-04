interface Props {
  candidates: string[];
  onSpeak: (sentence: string) => void;
  onQueue?: (sentence: string) => void;
  highlight?: number | null;
  slots?: number;
}

export function Candidates({ candidates, onSpeak, highlight = null, slots = 6 }: Props) {
  if (candidates.length === 0) return null;
  const cells = Array.from({ length: Math.max(slots, candidates.length) }, (_, i) => candidates[i] ?? null);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-2xl mx-auto" data-testid="candidates" aria-label="Things to say">
      {cells.map((sentence, i) =>
        sentence ? (
          <button
            key={i}
            onClick={(e) => {
              onSpeak(sentence);
              e.currentTarget.blur();
            }}
            className={`min-h-20 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-left text-lg font-medium text-gray-900 leading-snug ${
              highlight === i ? "outline outline-4 outline-blue-600 outline-offset-1" : ""
            }`}
            data-testid="candidate"
          >
            {sentence}
          </button>
        ) : (
          <div key={i} className="min-h-20 rounded-xl border-2 border-dashed border-gray-200" aria-hidden="true" />
        )
      )}
    </div>
  );
}
