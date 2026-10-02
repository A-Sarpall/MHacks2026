import type { CapturedObject } from "../lib/types";

interface Props {
  captures: CapturedObject[];
  selectedTileIds: string[];
  onToggle: (id: string) => void;
  onRename: (id: string, label: string) => void;
  onRemove: (id: string) => void;
}

const SOURCE_NAME: Record<CapturedObject["source"], string> = {
  detector: "detector",
  classifier: "classifier",
  claude: "Claude",
  manual: "you",
};

export function TileBar({
  captures,
  selectedTileIds,
  onToggle,
  onRename,
  onRemove,
}: Props) {
  if (captures.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-gray-400 text-sm text-center">
        Nothing captured yet. Click a box on the camera (or press Space) to
        identify an object.
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-center flex-wrap" data-testid="tiles">
      {captures.map((c) => {
        const selected = selectedTileIds.includes(c.id);
        return (
          <div
            key={c.id}
            className={`relative flex flex-col w-40 rounded-xl overflow-hidden border-2 transition-all ${
              selected
                ? "border-blue-600 shadow-lg scale-105"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <button
              onClick={() => onToggle(c.id)}
              className="flex flex-col text-left"
              data-testid="tile"
            >
              <img
                src={c.thumbnail}
                alt={c.label}
                className="w-full h-28 object-cover bg-gray-100"
              />
              <div
                className={`px-2 py-1.5 ${selected ? "bg-blue-600 text-white" : "bg-white text-gray-900"}`}
              >
                <div className="font-semibold text-base leading-tight capitalize" data-testid="tile-label">
                  {c.label}
                </div>
                <div className="text-[11px] opacity-70">
                  {c.refining
                    ? "asking Claude…"
                    : `${SOURCE_NAME[c.source]}${c.confidence ? ` · ${Math.round(c.confidence * 100)}%` : ""}`}
                </div>
              </div>
            </button>
            {c.alternatives.length > 0 && (
              <div className="flex flex-wrap gap-1 px-2 py-1.5 bg-gray-50 border-t border-gray-100">
                {c.alternatives.slice(0, 3).map((alt) => (
                  <button
                    key={alt.label}
                    onClick={() => onRename(c.id, alt.label)}
                    title={`Rename to "${alt.label}" (${alt.source}, ${Math.round(alt.score * 100)}%)`}
                    className="px-1.5 py-0.5 text-[11px] rounded bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300"
                  >
                    {alt.label}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => onRemove(c.id)}
              title="Remove"
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white text-xs hover:bg-black/70"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
