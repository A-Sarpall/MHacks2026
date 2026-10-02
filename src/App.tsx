import { useCallback, useEffect, useRef } from "react";
import { CameraPreview } from "./components/CameraPreview";
import { TileBar } from "./components/TileBar";
import { CoreWords } from "./components/CoreWords";
import { Candidates } from "./components/Candidates";
import { StatusBar } from "./components/StatusBar";
import { initDetector, detectObjects, isDetectorReady } from "./lib/detect";
import { getVideoElement } from "./lib/capture";
import { mockComposer } from "./lib/compose";
import { speakNow, playBackchannel } from "./lib/speak";
import { startInputListening, stopInputListening } from "./lib/input";
import { useCueStore, nextBackchannel } from "./lib/store";
import type { CoreWord } from "./lib/types";

export default function App() {
  const { state, dispatch } = useCueStore();
  const composingRef = useRef(false);

  // Initialize MediaPipe detector on mount
  useEffect(() => {
    initDetector().catch(console.error);
  }, []);

  // Handle input actions (keyboard simulating ring)
  const handleInput = useCallback(
    async (action: "click" | "double" | "hold") => {
      if (action === "click") {
        // Capture + detect
        if (!isDetectorReady()) return;
        const video = getVideoElement();
        if (!video) return;

        dispatch({ type: "SET_STATUS", status: "detecting" });
        const detections = detectObjects(video);
        dispatch({ type: "SET_DETECTIONS", detections });
        dispatch({ type: "SET_STATUS", status: "idle" });
      }

      if (action === "double") {
        const bc = nextBackchannel();
        playBackchannel(bc);
      }

      if (action === "hold") {
        // Queue the first candidate if available
        if (state.candidates.length > 0) {
          dispatch({
            type: "QUEUE_SENTENCE",
            sentence: state.candidates[0],
          });
        }
      }
    },
    [state.candidates, dispatch]
  );

  // Wire keyboard input
  useEffect(() => {
    startInputListening(handleInput);
    return () => stopInputListening();
  }, [handleInput]);

  // Auto-compose when tiles + core words change
  useEffect(() => {
    if (
      state.selectedTiles.length === 0 &&
      state.selectedCoreWords.length === 0
    )
      return;
    if (composingRef.current) return;

    composingRef.current = true;
    dispatch({ type: "SET_STATUS", status: "composing" });

    mockComposer
      .compose({
        tiles: state.selectedTiles,
        coreWords: state.selectedCoreWords,
      })
      .then((candidates) => {
        dispatch({ type: "SET_CANDIDATES", candidates });
        dispatch({ type: "SET_STATUS", status: "idle" });
      })
      .finally(() => {
        composingRef.current = false;
      });
  }, [state.selectedTiles, state.selectedCoreWords, dispatch]);

  const handleSpeak = useCallback(
    async (sentence: string) => {
      dispatch({ type: "SET_STATUS", status: "speaking" });
      await speakNow(sentence);
      dispatch({ type: "SET_STATUS", status: "idle" });
    },
    [dispatch]
  );

  const handleQueue = useCallback(
    (sentence: string) => {
      dispatch({ type: "QUEUE_SENTENCE", sentence });
    },
    [dispatch]
  );

  const handleSpeakQueue = useCallback(async () => {
    if (!state.queuedSentence) return;
    dispatch({ type: "SET_STATUS", status: "speaking" });
    await speakNow(state.queuedSentence);
    dispatch({ type: "CLEAR_QUEUE" });
  }, [state.queuedSentence, dispatch]);

  const handleClearQueue = useCallback(() => {
    dispatch({ type: "CLEAR_QUEUE" });
  }, [dispatch]);

  const handleCameraReady = useCallback(() => {
    // Camera is streaming
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            Cue
            <span className="ml-2 text-sm font-normal text-gray-400">
              prototype
            </span>
          </h1>
          <StatusBar
            status={state.status}
            queuedSentence={state.queuedSentence}
            onClearQueue={handleClearQueue}
            onSpeakQueue={handleSpeakQueue}
          />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 flex flex-col gap-6">
        {/* Camera */}
        <section className="flex justify-center">
          <CameraPreview onReady={handleCameraReady} />
        </section>

        {/* Detected Object Tiles */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-400 mb-2 text-center uppercase tracking-wider">
            Objects
          </div>
          <TileBar
            detections={state.detections}
            selectedTiles={state.selectedTiles}
            onToggle={(label) => dispatch({ type: "TOGGLE_TILE", label })}
          />
        </section>

        {/* Core Words */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-400 mb-2 text-center uppercase tracking-wider">
            Core Words
          </div>
          <CoreWords
            selectedCoreWords={state.selectedCoreWords}
            onToggle={(word: CoreWord) =>
              dispatch({ type: "TOGGLE_CORE_WORD", word })
            }
          />
        </section>

        {/* Candidate Sentences */}
        <section>
          <Candidates
            candidates={state.candidates}
            onSpeak={handleSpeak}
            onQueue={handleQueue}
          />
        </section>

        {/* Clear button */}
        {(state.selectedTiles.length > 0 ||
          state.selectedCoreWords.length > 0 ||
          state.detections.length > 0) && (
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
