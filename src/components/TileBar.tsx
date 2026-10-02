import type { Detection } from "../lib/types";

interface Props {
  detections: Detection[];
  selectedTiles: string[];
  onToggle: (label: string) => void;
}

export function TileBar({ detections, selectedTiles, onToggle }: Props) {
  if (detections.length === 0) {
    return (
      <div className="flex gap-2 items-center justify-center h-16 text-gray-400 text-sm">
        No objects detected yet. Point camera and press Space.
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center justify-center flex-wrap">
      {detections.map((d) => {
        const selected = selectedTiles.includes(d.label);
        return (
          <button
            key={d.label}
            onClick={() => onToggle(d.label)}
            className={`
              px-4 py-3 rounded-xl text-lg font-medium transition-all
              ${
                selected
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }
            `}
          >
            {d.label}
            <span className="ml-2 text-xs opacity-60">
              {Math.round(d.confidence * 100)}%
            </span>
          </button>
        );
      })}
    </div>
  );
}
