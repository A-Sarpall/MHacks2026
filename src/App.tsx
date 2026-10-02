import { useCallback, useEffect, useRef, useState } from "react";
import {
  CameraView,
  type CameraViewHandle,
  type CaptureTarget,
} from "./components/CameraView";
import { TileBar } from "./components/TileBar";
import { CoreWords } from "./components/CoreWords";
import { Candidates } from "./components/Candidates";
import { StatusBar } from "./components/StatusBar";
import { initDetector } from "./lib/detect";
import { initClassifier } from "./lib/classify";
import { identifyLocal, identifyWithClaude } from "./lib/identify";
import { hasClaude } from "./lib/claude";
import { claudeComposer, composeMock } from "./lib/compose";
import { speakNow, playBackchannel } from "./lib/speak";
import { startInputListening, stopInputListening } from "./lib/input";
import { useCueStore, nextBackchannel } from "./lib/store";
import type { CoreWord, InputAction } from "./lib/types";

export default function App() {
  const { state, dispatch } = useCueStore();
  const cameraRef = useRef<CameraViewHandle>(null);
  const composeSeq = useRef(0);
  const [modelError, setModelError] = useState("");
  const [trackCount, setTrackCount] = useState(0);
  const [mirror, setMirror] = useState(true);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState<string | undefined>(undefined);
  const [sayName, setSayName] = useState(false);
  const sayNameRef = useRef(sayName);
  sayNameRef.current = sayName;
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);

  // Brief "Identified: X" banner over the camera
  const showToast = useCallback((text: string) => {
    setToast({ text, key: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Load both models up front; the detector gates the "ready" state, the
  // classifier only improves identification.
  useEffect(() => {
    initClassifier().catch((err) =>
      console.warn("[classify] failed to load, using detector labels", err)
    );
    initDetector()
      .then(() => dispatch({ type: "SET_STATUS", status: "idle" }))
      .catch((err) => {
        console.error("[detect]", err);
        setModelError(
          "Could not load the object detection model. Check your internet connection and reload."
        );
      });
  }, [dispatch]);

  const handleCapture = useCallback(
    async (target: CaptureTarget) => {
      const { capture, crop } = identifyLocal(
        target.video,
        target.box,
        target.detected
      );
      dispatch({ type: "ADD_CAPTURE", capture });
      showToast(
        `Identified: ${capture.label}` +
          (capture.confidence ? ` (${Math.round(capture.confidence * 100)}%)` : "")
      );
      if (sayNameRef.current && !hasClaude()) speakNow(capture.label).catch(() => {});
      if (!hasClaude()) return;

      dispatch({ type: "SET_STATUS", status: "identifying" });
      try {
        const hints = [capture.label, ...capture.alternatives.map((a) => a.label)];
        const label = await identifyWithClaude(crop, hints);
        const patch = label
          ? {
              label,
              confidence: 0,
              source: "claude" as const,
              alternatives: [
                { label: capture.label, score: capture.confidence, source: capture.source === "manual" ? "classifier" as const : capture.source },
                ...capture.alternatives,
              ].filter((a) => a.label !== label),
            }
          : {};
        dispatch({ type: "UPDATE_CAPTURE", id: capture.id, patch: { ...patch, refining: false } });
        if (label && label !== capture.label) showToast(`Claude says: ${label}`);
        if (sayNameRef.current) speakNow(label ?? capture.label).catch(() => {});
      } catch (err) {
        console.warn("[identify] Claude vision failed", err);
        dispatch({ type: "UPDATE_CAPTURE", id: capture.id, patch: { refining: false } });
      } finally {
        dispatch({ type: "SET_STATUS", status: "idle" });
      }
    },
    [dispatch, showToast]
  );

  const handleSpeak = useCallback(
    async (sentence: string) => {
      dispatch({ type: "SET_STATUS", status: "speaking" });
      try {
        await speakNow(sentence);
      } catch (err) {
        console.warn("[speak]", err);
      }
      dispatch({ type: "SET_STATUS", status: "idle" });
    },
    [dispatch]
  );

  // Keyboard (simulating the ring)
  const handleInput = useCallback(
    (action: InputAction) => {
      if (action === "click") {
        const target = cameraRef.current?.captureFocused();
        if (target) void handleCapture(target);
      }
      if (action === "double") {
        playBackchannel(nextBackchannel());
      }
      if (action === "hold" && state.candidates.length > 0) {
        dispatch({ type: "QUEUE_SENTENCE", sentence: state.candidates[0] });
      }
    },
    [state.candidates, dispatch, handleCapture]
  );

  useEffect(() => {
    startInputListening(handleInput);
    return () => stopInputListening();
  }, [handleInput]);

  // Compose sentences whenever the selection changes (needs a core word)
  const selectedLabels = state.captures
    .filter((c) => state.selectedTileIds.includes(c.id))
    .map((c) => c.label);
  const selectionKey = `${selectedLabels.join("|")}#${state.selectedCoreWords.join("|")}`;

  useEffect(() => {
    if (state.selectedCoreWords.length === 0) return;
    const seq = ++composeSeq.current;
    const input = { tiles: selectedLabels, coreWords: state.selectedCoreWords };
    // Instant template sentences; Claude's replace them when they arrive.
    dispatch({ type: "SET_CANDIDATES", candidates: composeMock(input) });
    if (!hasClaude()) return;
    dispatch({ type: "SET_STATUS", status: "composing" });
    claudeComposer
      .compose(input)
      .then((candidates) => {
        if (seq === composeSeq.current)
          dispatch({ type: "SET_CANDIDATES", candidates });
      })
      .catch((err) => console.warn("[compose] Claude failed, keeping templates", err))
      .finally(() => {
        if (seq === composeSeq.current)
          dispatch({ type: "SET_STATUS", status: "idle" });
      });
    // selectionKey captures selectedLabels + core words
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey, dispatch]);

  const handleSpeakQueue = useCallback(async () => {
    if (!state.queuedSentence) return;
    const sentence = state.queuedSentence;
    dispatch({ type: "CLEAR_QUEUE" });
    await handleSpeak(sentence);
  }, [state.queuedSentence, dispatch, handleSpeak]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">
            Cue
            <span className="ml-2 text-sm font-normal text-gray-400">
              prototype
            </span>
          </h1>
          <StatusBar
            status={state.status}
            queuedSentence={state.queuedSentence}
            onClearQueue={() => dispatch({ type: "CLEAR_QUEUE" })}
            onSpeakQueue={handleSpeakQueue}
          />
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-6 flex flex-col gap-6">
        {modelError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {modelError}
          </div>
        )}

        <section className="flex flex-col items-center gap-2">
          <div className="relative w-full max-w-2xl">
            <CameraView
              ref={cameraRef}
              onCapture={(t) => void handleCapture(t)}
              onTrackCount={setTrackCount}
              mirror={mirror}
              deviceId={cameraId}
              onDevices={setCameras}
            />
            {toast && (
              <div
                key={toast.key}
                data-testid="toast"
                className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/75 text-white text-lg font-semibold shadow-lg pointer-events-none capitalize"
              >
                {toast.text}
              </div>
            )}
            <button
              onClick={(e) => {
                setMirror((m) => !m);
                e.currentTarget.blur();
              }}
              className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/50 text-white text-xs hover:bg-black/70"
              title="Flip the preview (turn off if the camera faces away from you)"
            >
              Mirror: {mirror ? "on" : "off"}
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span data-testid="track-info">
              {state.status === "loading"
                ? "Loading detection model…"
                : `Tracking ${trackCount} object${trackCount === 1 ? "" : "s"}`}
              {" · "}
              {hasClaude()
                ? "Claude identification on"
                : "on-device identification (set VITE_ANTHROPIC_API_KEY for Claude)"}
            </span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={sayName}
                onChange={(e) => {
                  setSayName(e.target.checked);
                  e.target.blur();
                }}
              />
              Say name on capture
            </label>
            {cameras.length > 1 && (
              <select
                value={cameraId ?? ""}
                onChange={(e) => {
                  setCameraId(e.target.value || undefined);
                  e.target.blur();
                }}
                className="border border-gray-200 rounded px-1 py-0.5 bg-white"
              >
                <option value="">Default camera</option>
                {cameras.map((c, i) => (
                  <option key={c.deviceId} value={c.deviceId}>
                    {c.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-400 mb-3 text-center uppercase tracking-wider">
            Captured objects
          </div>
          <TileBar
            captures={state.captures}
            selectedTileIds={state.selectedTileIds}
            onToggle={(id) => dispatch({ type: "TOGGLE_TILE", id })}
            onRename={(id, label) =>
              dispatch({
                type: "UPDATE_CAPTURE",
                id,
                patch: { label, source: "manual", confidence: 0, refining: false },
              })
            }
            onRemove={(id) => dispatch({ type: "REMOVE_CAPTURE", id })}
          />
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-400 mb-2 text-center uppercase tracking-wider">
            Core words
          </div>
          <CoreWords
            selectedCoreWords={state.selectedCoreWords}
            onToggle={(word: CoreWord) =>
              dispatch({ type: "TOGGLE_CORE_WORD", word })
            }
          />
        </section>

        <section>
          <Candidates
            candidates={state.candidates}
            onSpeak={handleSpeak}
            onQueue={(sentence) => dispatch({ type: "QUEUE_SENTENCE", sentence })}
          />
        </section>

        {(state.captures.length > 0 || state.selectedCoreWords.length > 0) && (
          <div className="flex justify-center">
            <button
              onClick={() => dispatch({ type: "CLEAR_ALL" })}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              Clear all
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
