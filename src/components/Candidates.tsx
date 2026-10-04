import { useEffect, useRef } from "react";

interface Props {
  candidates: string[];
  onSpeak: (sentence: string) => void;
  onQueue?: (sentence: string) => void;
  highlight?: number | null;
  slots?: number;
}

export function Candidates({ candidates, onSpeak, highlight = null, slots = 6 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (highlight === null) return;
    const el = ref.current?.querySelectorAll<HTMLElement>("[data-testid=candidate]")[highlight];
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight]);
  if (candidates.length === 0) return null;
  const cells = Array.from({ length: Math.max(slots, candidates.length) }, (_, i) => candidates[i] ?? null);
  return (
    <div
      ref={ref}
      className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 [@media(max-height:700px)]:gap-1 w-full min-h-0 overflow-y-auto overscroll-contain p-0.5"
      data-testid="candidates"
      aria-label="Things to say"
    >
      {cells.map((sentence, i) =>
        sentence ? (
          <button
            key={i}
            onClick={(e) => {
              onSpeak(sentence);
              e.currentTarget.blur();
            }}
            className={`min-h-(--tap) px-3 py-1 bg-white border-2 border-gray-300 rounded-xl text-left text-lg font-medium text-gray-900 leading-tight ${
              highlight === i ? "outline outline-4 outline-blue-600 outline-offset-1" : ""
            }`}
            data-testid="candidate"
          >
            {sentence}
          </button>
        ) : (
          <div key={i} className="min-h-(--tap) rounded-xl border-2 border-dashed border-gray-200" aria-hidden="true" />
        )
      )}
    </div>
  );
}
