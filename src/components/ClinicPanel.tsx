import { useEffect, useState } from "react";
import { fetchClinicSummary, type ClinicSummary } from "../lib/meds";

interface Props {
  words: string[];
  onClose: () => void;
}

// Clinic mode: one screen a nurse or doctor can read, with the patient's own recent words on top.
export function ClinicPanel({ words, onClose }: Props) {
  const [summary, setSummary] = useState<ClinicSummary | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchClinicSummary(words)
      .then(setSummary)
      .catch((e: Error) => setError(e.message));
    // Summary is a snapshot taken when the panel opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto p-4" onClick={onClose}>
      <div
        data-testid="clinic-panel"
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-5 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">Summary for your clinician</h2>
          <button onClick={onClose} className="px-3 py-1 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Close">
            ✕
          </button>
        </div>
        {error && <p className="text-red-700">Couldn't load the summary: {error}. Is the hub running (npm run hub)?</p>}
        {!summary && !error && <p className="text-gray-500">Loading…</p>}
        {summary && (
          <>
            <pre className="whitespace-pre-wrap text-base leading-relaxed text-gray-900 font-sans">{summary.text}</pre>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(summary.text).then(() => setCopied(true));
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
