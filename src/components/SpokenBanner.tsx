interface Props {
  spoken: string | null;
  cantTalk: boolean;
  onClearStatus: () => void;
}

export function SpokenBanner({ spoken, cantTalk, onClearStatus }: Props) {
  if (!spoken && !cantTalk) return null;
  return (
    <section className="flex flex-col gap-2" data-testid="spoken-banner">
      {cantTalk && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 px-5 py-4">
          <div className="text-2xl font-bold text-amber-900" data-testid="cant-talk-status">
            I can't talk right now
          </div>
          <button
            onClick={onClearStatus}
            className="px-4 py-2 rounded-xl border-2 border-amber-400 bg-white text-base font-semibold text-amber-900"
          >
            I can talk again
          </button>
        </div>
      )}
      {spoken && (
        <div className="rounded-2xl border-2 border-gray-300 bg-white px-5 py-4" aria-live="polite">
          <div className="text-xs uppercase tracking-wider text-gray-500">Said</div>
          <div className="text-3xl font-bold text-gray-900 leading-tight" data-testid="spoken-text">
            {spoken}
          </div>
        </div>
      )}
    </section>
  );
}
