import { optionLabel, optionText, type Picks, type SentenceFrame } from "../lib/frames";

export interface BuildState {
  slot: number;
  picks: Picks;
}

interface Props {
  frame: SentenceFrame | null;
  state: BuildState;
  highlight: number | null;
  stripHighlighted: boolean;
  actionLabel: string;
  canSay: boolean;
  onSlot: (slot: number) => void;
  onPick: (slot: number, option: number) => void;
  onSay: () => void;
}

export function BuildSentence({ frame, state, highlight, stripHighlighted, actionLabel, canSay, onSlot, onPick, onSay }: Props) {
  if (!frame) {
    return (
      <div className="flex flex-col gap-1.5" data-testid="build" aria-busy="true">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <div className="min-h-(--tap) rounded-xl border-2 border-dashed border-gray-300 bg-white px-3 flex items-center text-lg text-gray-400">Finding words…</div>
          <div className="min-h-(--tap) w-24 rounded-xl border-2 border-dashed border-gray-300" />
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="min-h-(--tap) rounded-xl border-2 border-dashed border-gray-200" />
          ))}
        </div>
      </div>
    );
  }
  const slotIndex = new Map(frame.slots.map((s, i) => [s.id, i]));
  const active = frame.slots[state.slot] ?? frame.slots[0];
  return (
    <div className={`flex flex-col gap-1.5 rounded-xl ${stripHighlighted ? "outline outline-4 outline-blue-600 outline-offset-1" : ""}`} data-testid="build">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-stretch">
        <div className="min-h-(--tap) px-2 py-0.5 rounded-xl border-2 border-gray-300 bg-white flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-lg font-semibold text-gray-900 leading-snug" data-testid="build-strip">
          {frame.parts.map((p, i) => {
            if (typeof p === "string") return <span key={i}>{i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p}</span>;
            const si = slotIndex.get(p.slot) ?? 0;
            const slot = frame.slots[si];
            const pick = state.picks[slot.id];
            const text = pick === null || pick === undefined ? "…" : optionText(slot.options[pick]) || "+";
            const isActive = si === state.slot;
            return (
              <button
                key={i}
                onClick={(e) => {
                  onSlot(si);
                  e.currentTarget.blur();
                }}
                aria-label={`${slot.prompt}: ${pick === null || pick === undefined ? "not chosen" : optionLabel(slot.options[pick])}`}
                className={`min-h-11 min-w-11 rounded-lg px-2 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : pick === null || pick === undefined || optionText(slot.options[pick]) === ""
                      ? "border-2 border-dashed border-gray-400 text-gray-500"
                      : "bg-blue-100 text-blue-900"
                }`}
                data-testid="build-slot"
              >
                {text.replace(/^,\s*/, "")}
              </button>
            );
          })}
          <span>{frame.end}</span>
        </div>
        <button
          onClick={(e) => {
            onSay();
            e.currentTarget.blur();
          }}
          disabled={!canSay}
          className="min-h-(--tap) px-4 rounded-xl bg-green-700 text-white text-lg font-bold disabled:opacity-40"
          data-testid="build-say"
        >
          {actionLabel}
        </button>
      </div>
      <div className={`grid gap-1.5 ${active.options.length > 4 ? "grid-cols-3" : "grid-cols-4"}`} role="group" aria-label={active.prompt}>
        {active.options.map((o, i) => {
          const on = state.picks[active.id] === i;
          return (
            <button
              key={`${active.id}-${i}`}
              onClick={(e) => {
                onPick(state.slot, i);
                e.currentTarget.blur();
              }}
              aria-pressed={on}
              className={`min-h-(--tap) px-1.5 rounded-xl border-2 text-base sm:text-lg small-when-short font-semibold leading-tight ${
                on ? "bg-blue-600 border-blue-700 text-white" : "bg-white border-gray-300 text-gray-900"
              } ${highlight === i ? "outline outline-4 outline-blue-600 outline-offset-1" : ""}`}
              data-testid="build-option"
            >
              {optionLabel(o)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
