interface Props {
  candidates: string[];
  onSpeak: (sentence: string) => void;
  onQueue: (sentence: string) => void;
}

export function Candidates({ candidates, onSpeak, onQueue }: Props) {
  if (candidates.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 w-full max-w-lg mx-auto">
      <div className="text-sm text-gray-500 text-center">
        Tap to speak, or press H to queue
      </div>
      {candidates.map((sentence, i) => (
        <div key={i} className="flex gap-2">
          <button
            onClick={() => onSpeak(sentence)}
            className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-left text-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            {sentence}
          </button>
          <button
            onClick={() => onQueue(sentence)}
            className="px-3 py-3 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-700 hover:bg-amber-100 transition-all text-sm"
            title="Queue to speak at pause"
          >
            Queue
          </button>
        </div>
      ))}
    </div>
  );
}
