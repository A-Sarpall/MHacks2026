import type { Intent } from "../data/profiles";

interface Props {
  intents: Intent[];
  selected: string | null;
  highlight: number | null;
  hasObject: boolean;
  onToggle: (intent: Intent) => void;
}

export function IntentButtons({ intents, selected, highlight, hasObject, onToggle }: Props) {
  return (
    <div
      className={`grid grid-cols-3 sm:grid-cols-6 gap-2 rounded-2xl p-1 ${highlight === null ? "" : "outline outline-2 outline-blue-600"}`}
      data-testid="intents"
    >
      {intents.map((intent, i) => {
        const isSelected = selected === intent.id;
        const disabled = intent.needsObject && !hasObject;
        return (
          <button
            key={intent.id}
            onClick={(e) => {
              onToggle(intent);
              e.currentTarget.blur();
            }}
            disabled={disabled}
            className={`min-h-16 px-3 py-2 rounded-xl border-2 text-base font-semibold leading-snug ${
              isSelected ? "bg-blue-600 border-blue-700 text-white" : "bg-white border-gray-300 text-gray-900"
            } ${disabled ? "opacity-40" : ""} ${highlight === i ? "outline outline-4 outline-blue-600 outline-offset-1" : ""}`}
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
