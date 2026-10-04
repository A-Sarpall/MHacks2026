interface Props {
  spoken: string | null;
  overstimulated: boolean;
  badge: string;
  clearLabel: string;
  onClearStatus: () => void;
}

export function SpokenBanner({ spoken, overstimulated, badge, clearLabel, onClearStatus }: Props) {
  if (!spoken && !overstimulated) return null;
  return (
    <section className="flex flex-col gap-2" data-testid="spoken-banner">
      {overstimulated && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-red-400 bg-red-50 px-5 py-4">
          <div className="text-2xl font-bold text-red-900" data-testid="overstimulated-status">
            {badge}
          </div>
          <button
            onClick={onClearStatus}
            className="min-h-11 px-4 py-2 rounded-xl border-2 border-red-400 bg-white text-base font-semibold text-red-900"
            data-testid="clear-status"
          >
            {clearLabel}
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
