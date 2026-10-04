export interface ScanOption {
  key: string;
  label: string;
  thumbnail: string;
  detail: string;
}

interface Props {
  options: ScanOption[];
  index: number;
  hint: string;
  autoScanSec: number | null;
  onPick: (i: number) => void;
  onSelect: () => void;
  onNext: () => void;
  onRetake: () => void;
  onCancel: () => void;
}

export function Scanner({ options, index, hint, autoScanSec, onPick, onSelect, onNext, onRetake, onCancel }: Props) {
  const current = options[index];
  if (!current) return null;
  return (
    <div
      className="w-full max-w-2xl bg-white rounded-2xl border-2 border-blue-500 shadow-lg p-4 flex flex-col gap-3"
      data-testid="scanner"
    >
      <div className="flex gap-4 items-center">
        <img
          src={current.thumbnail}
          alt={current.label}
          className="w-48 h-48 object-contain rounded-xl bg-gray-900 shrink-0"
          data-testid="scan-thumb"
        />
        <div className="flex flex-col gap-1 min-w-0">
          <div className="text-xs uppercase tracking-wider text-gray-400">
            Choice {index + 1} of {options.length}
            {autoScanSec ? ` · moves every ${autoScanSec}s` : ""}
          </div>
          <div className="text-3xl font-bold capitalize text-gray-900 truncate" data-testid="scan-label">
            {current.label}
          </div>
          <div className="text-sm text-gray-500">{current.detail}</div>
          <div className="text-sm text-blue-700 mt-2">{hint}</div>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {options.map((o, i) => (
          <button
            key={o.key}
            onClick={(e) => {
              onPick(i);
              e.currentTarget.blur();
            }}
            className={`flex flex-col items-center w-20 shrink-0 rounded-lg border-2 ${
              i === index ? "border-blue-600 opacity-100" : "border-transparent opacity-70 hover:opacity-100"
            }`}
            data-testid="scan-option"
          >
            <img src={o.thumbnail} alt={o.label} className="w-full h-16 object-cover rounded-t-md bg-gray-100" />
            <span className="text-[11px] capitalize truncate w-full text-center px-1">{o.label}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={onSelect} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">
          Choose “{current.label}”
        </button>
        <button onClick={onNext} className="px-4 py-2 rounded-lg border border-gray-200">
          Next
        </button>
        <button onClick={onRetake} className="px-4 py-2 rounded-lg border border-gray-200">
          Retake
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 ml-auto">
          Cancel
        </button>
      </div>
    </div>
  );
}
