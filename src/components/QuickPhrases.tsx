import type { QuickPhrase } from "../data/profiles";

interface Props {
  phrases: QuickPhrase[];
  highlight: number | null;
  onPick: (phrase: QuickPhrase) => void;
}

export function QuickPhrases({ phrases, highlight, onPick }: Props) {
  return (
    <section
      className={`bg-white rounded-2xl p-3 shadow-sm border ${highlight === null ? "border-gray-100" : "border-blue-600 border-2"}`}
      data-testid="quick-phrases"
      aria-label="Quick phrases"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {phrases.map((p, i) => {
          const active = highlight === i;
          const tone =
            p.action === "pain"
              ? "bg-red-50 border-red-300 text-red-800"
              : p.action === "status"
                ? "bg-amber-50 border-amber-300 text-amber-900"
                : "bg-gray-50 border-gray-300 text-gray-900";
          return (
            <button
              key={p.text}
              onClick={(e) => {
                onPick(p);
                e.currentTarget.blur();
              }}
              className={`min-h-16 px-3 py-2 rounded-xl border-2 text-base font-semibold text-left leading-snug ${tone} ${
                active ? "outline outline-4 outline-blue-600 outline-offset-1" : ""
              }`}
              data-testid="quick-phrase"
              aria-pressed={active}
            >
              {p.text}
            </button>
          );
        })}
      </div>
    </section>
  );
}
