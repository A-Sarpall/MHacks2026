import type { CueStatus } from "../lib/types";

interface Props {
  status: CueStatus;
  queuedSentence: string | null;
  onClearQueue: () => void;
  onSpeakQueue: () => void;
  listening?: boolean;
}

const STATUS_DISPLAY: Record<CueStatus, { label: string; color: string }> = {
  loading: { label: "Loading models...", color: "bg-gray-200 text-gray-500" },
  idle: { label: "Ready", color: "bg-gray-200 text-gray-600" },
  identifying: { label: "Identifying...", color: "bg-blue-200 text-blue-700" },
  composing: { label: "Composing...", color: "bg-purple-200 text-purple-700" },
  speaking: { label: "Speaking", color: "bg-green-200 text-green-700" },
  queued: { label: "Queued", color: "bg-amber-200 text-amber-700" },
};

export function StatusBar({
  status,
  queuedSentence,
  onClearQueue,
  onSpeakQueue,
  listening = false,
}: Props) {
  const display = STATUS_DISPLAY[status];

  return (
    <div className="flex items-center justify-between gap-4">
      <div
        className={`px-3 py-1.5 rounded-full text-sm font-medium ${display.color}`}
      >
        {display.label}
      </div>

      {queuedSentence && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-amber-700 italic truncate max-w-xs">
            "{queuedSentence}"
          </span>
          {listening && (
            <span className="text-xs text-amber-600">
              waiting for a pause…
            </span>
          )}
          <button
            onClick={onSpeakQueue}
            className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-medium"
          >
            Speak Now
          </button>
          <button
            onClick={onClearQueue}
            className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium"
          >
            Clear
          </button>
        </div>
      )}

    </div>
  );
}
