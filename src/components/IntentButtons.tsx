import type { Intent } from "../data/profiles";

interface Props {
  intents: Intent[];
  selected: string | null;
  highlight: number | null;
  onToggle: (intent: Intent) => void;
}

export function IntentButtons({ intents, selected, highlight, onToggle }: Props) {
  return (
    <div
      className={`grid grid-cols-3 lg:grid-cols-6 gap-1.5 [@media(max-height:700px)]:gap-1 rounded-2xl p-0.5 ${highlight === null ? "" : "outline outline-2 outline-blue-600"}`}
      data-testid="intents"
    >
      {intents.map((intent, i) => {
        const isSelected = selected === intent.id;
        return (
          <button
            key={intent.id}
            onClick={(e) => {
              onToggle(intent);
              e.currentTarget.blur();
            }}
            className={`min-h-(--tap) px-2 py-1.5 rounded-xl border-2 text-base sm:text-lg font-semibold leading-snug ${
              isSelected ? "bg-blue-600 border-blue-700 text-white" : "bg-white border-gray-300 text-gray-900"
            } ${highlight === i ? "outline outline-4 outline-blue-600 outline-offset-1" : ""}`}
            data-testid="intent"
            aria-pressed={isSelected}
          >
            {intent.label}
          </button>
        );
      })}
    </div>
  );
}
