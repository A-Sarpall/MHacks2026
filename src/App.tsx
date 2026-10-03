import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { identifyFromImage, identifyWithClaude } from "./lib/identify";
import { hasClaude } from "./lib/claude";
import { claudeComposer, composeMock } from "./lib/compose";
import { speakNow, playBackchannel } from "./lib/speak";
import { useCueStore, nextBackchannel } from "./lib/store";
import { startPauseDetector } from "./lib/listen";
import type { CapturedObject, CoreWord, InputAction } from "./lib/types";
import { Scanner } from "./components/Scanner";
import { RUNG_TEXT, askClaude, nameTarget, withAlternatives, type NamedOption } from "./vision/naming";
import { correctSelection, historyBoost, recordSelection } from "./vision/history";
import { RING_HINTS, commandFor, type RingMode } from "./vision/input/mappings";
import { SourceSettings } from "./components/SourceSettings";
import { Calibration, type CalibrationHandle } from "./components/Calibration";
import { PersonalObjects, type PersonalObjectsHandle } from "./components/PersonalObjects";
import {
  isStillSource,
  loadSourceSettings,
  orientationFor,
  orientationKey,
  saveSourceSettings,
} from "./vision/settings";
import { clearCalibration, loadCalibration, saveCalibration } from "./vision/calibration";
import type { FeedbackKind } from "./vision/input/types";
import { useButtonInputs, useFrameSource } from "./vision/useVisionIO";
import { initSiglip, onSiglipState, type SiglipState } from "./vision/siglip";

const REVIEW_MS = 4000;

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
  const [autoPause, setAutoPause] = useState(false);
  const [listening, setListening] = useState(false);
  const sayNameRef = useRef(sayName);
  sayNameRef.current = sayName;
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);
  const [sourceSettings, setSourceSettings] = useState(loadSourceSettings);
  useEffect(() => saveSourceSettings(sourceSettings), [sourceSettings]);
  const { source, status: sourceStatus } = useFrameSource(sourceSettings, cameraId);
  useEffect(() => setMirror(source.kind === "webcam"), [source.kind]);
  const calibKey = orientationKey(sourceSettings.kind, sourceSettings.hand);
  const [calibration, setCalibration] = useState(() => loadCalibration(calibKey));
  useEffect(() => setCalibration(loadCalibration(calibKey)), [calibKey]);
  const aim = useMemo(
    () => ({
      zoneFrac: sourceSettings.zoneFrac,
      offset: (sourceSettings.useCalibration && calibration?.offset) || { dx: 0, dy: 0 },
    }),
    [sourceSettings.zoneFrac, sourceSettings.useCalibration, calibration]
  );
  const [calibrating, setCalibrating] = useState(false);
  const calibratingRef = useRef(calibrating);
  calibratingRef.current = calibrating;
  const calibRef = useRef<CalibrationHandle>(null);
  const [teaching, setTeaching] = useState(false);
  const teachingRef = useRef(teaching);
  teachingRef.current = teaching;
  const teachRef = useRef<PersonalObjectsHandle>(null);
  const feedbackRef = useRef<(kind: FeedbackKind) => void>(() => {});
  const [scan, setScan] = useState<{ options: NamedOption[]; index: number; level: number } | null>(null);
  const scanRef = useRef(scan);
  const scanSeq = useRef(0);
  scanRef.current = scan;
  const reviewRef = useRef<{ until: number; level: number } | null>(null);
  const [hint, setHint] = useState<{ text: string; key: number } | null>(null);
  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(() => setHint(null), 3000);
    return () => clearTimeout(t);
  }, [hint]);
  const settingsRef = useRef(sourceSettings);
  settingsRef.current = sourceSettings;

  // Brief "Identified: X" banner over the camera
  const showToast = useCallback((text: string) => {
    setToast({ text, key: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const [siglip, setSiglip] = useState<SiglipState>({ status: "idle", progress: 0 });
  useEffect(() => onSiglipState(setSiglip), []);

  // Load both models up front; the detector gates the "ready" state, the
  // classifier only improves identification.
  useEffect(() => {
    initSiglip().catch((err) => console.warn("[siglip] not available, using the fallback classifier", err));
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

  const commitCapture = useCallback(
    async (capture: CapturedObject, crop: HTMLCanvasElement, confirmed = false) => {
      recordSelection({ id: capture.id, label: capture.label, source: capture.source });
      const refine = hasClaude() && !confirmed && capture.source !== "personal" && capture.source !== "claude";
      dispatch({ type: "ADD_CAPTURE", capture: refine ? capture : { ...capture, refining: false } });
      showToast(
        `Identified: ${capture.label}` +
          (capture.confidence ? ` (${Math.round(capture.confidence * 100)}%)` : "")
      );
      if (sayNameRef.current && !refine) speakNow(capture.label).catch(() => {});
      if (!refine) return;

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
        if (label) correctSelection(capture.id, label, "claude");
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

  const handleCapture = useCallback(
    async (target: CaptureTarget) => {
      feedbackRef.current("captured");
      const { capture, crop } = identifyFromImage(target.image, target.box, target.detected);
      await commitCapture(capture, crop);
    },
    [commitCapture]
  );

  const endScan = useCallback((unfreezeAfterMs = 0) => {
    scanSeq.current++;
    setScan(null);
    setTimeout(() => cameraRef.current?.unfreeze(), unfreezeAfterMs);
  }, []);

  const ringCapture = useCallback(
    (level: number) => {
      reviewRef.current = null;
      cameraRef.current
        ?.capture()
        .then(async (target) => {
          if (!target) return;
          feedbackRef.current("captured");
          dispatch({ type: "SET_STATUS", status: "identifying" });
          if (target.burst) console.info("[capture] burst", JSON.stringify(target.burst));
          if (target.streamPick) console.info("[capture] stream", JSON.stringify(target.streamPick));
          const res = await nameTarget(target, {
            startLevel: level,
            maxOptions: settingsRef.current.maxCandidates,
            namer: { boost: historyBoost() },
          }).finally(() => dispatch({ type: "SET_STATUS", status: "idle" }));
          console.info(
            "[naming]",
            JSON.stringify({
              level: res.level,
              low: res.low,
              ms: Math.round(res.ms),
              tooSmall: res.tooSmall,
              empty: res.empty,
              options: res.options.map((o) => [o.label, Math.round(o.score * 100), o.rung.kind]),
            })
          );
          if (res.tooSmall) setHint({ text: "Move closer", key: Date.now() });
          const seq = ++scanSeq.current;
          if (res.empty && hasClaude()) {
            setHint({ text: "Not sure. Asking Claude…", key: Date.now() });
            dispatch({ type: "SET_STATUS", status: "identifying" });
            const guess = await askClaude(res.best, res.options).finally(() =>
              dispatch({ type: "SET_STATUS", status: "idle" })
            );
            if (seq !== scanSeq.current) return;
            console.info("[naming] fallback", JSON.stringify({ claude: guess?.label ?? null }));
            if (guess) {
              setHint(null);
              setScan({ options: [guess], index: 0, level: res.level });
              return;
            }
          }
          if (res.empty) {
            feedbackRef.current("error");
            setHint({ text: "Not sure what that is. Try again or move closer", key: Date.now() });
            endScan();
            return;
          }
          if (!res.low) {
            void commitCapture(withAlternatives(res.best, res.options), res.best.crop);
            reviewRef.current = { until: performance.now() + REVIEW_MS, level: res.level };
            endScan(900);
            return;
          }
          setScan({ options: res.options, index: 0, level: res.level });
          if (!hasClaude()) return;
          const guess = await askClaude(res.best, res.options);
          console.info("[naming] fallback", JSON.stringify({ claude: guess?.label ?? null }));
          if (!guess || seq !== scanSeq.current) return;
          setScan((s) => {
            if (!s || s.options.some((o) => o.label.toLowerCase() === guess.label.toLowerCase())) return s;
            const options = [...s.options];
            options.splice(s.index + 1, 0, guess);
            return { ...s, options };
          });
        })
        .catch((err: unknown) => {
          console.warn("[capture]", err);
          feedbackRef.current("error");
          showToast(String((err as Error)?.message ?? "Could not take a picture"));
        });
    },
    [commitCapture, endScan, showToast, dispatch]
  );

  const chooseScan = useCallback(
    (index?: number) => {
      const s = scanRef.current;
      if (!s) return;
      const chosen = s.options[index ?? s.index];
      feedbackRef.current("select");
      void commitCapture(withAlternatives(chosen, s.options), chosen.crop, true);
      endScan(600);
    },
    [commitCapture, endScan]
  );

  const moveScan = useCallback((delta: number) => {
    setScan((s) => s && { ...s, index: (s.index + delta + s.options.length) % s.options.length });
  }, []);

  const retake = useCallback(
    (fromLevel: number) => {
      setScan(null);
      cameraRef.current?.unfreeze();
      ringCapture(Math.min(2, fromLevel + 1));
    },
    [ringCapture]
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

  const ringMode = (): RingMode => {
    if (scanRef.current) return settingsRef.current.autoScan ? "autoscan" : "scanning";
    const review = reviewRef.current;
    return review && performance.now() < review.until ? "review" : "normal";
  };

  // Keyboard (simulating the ring)
  const handleInput = useCallback(
    (action: InputAction) => {
      if (calibratingRef.current) {
        if (action === "click") calibRef.current?.press();
        if (action === "double") calibRef.current?.undo();
        if (action === "hold") calibRef.current?.save();
        return;
      }
      if (teachingRef.current) {
        if (action === "click") teachRef.current?.press();
        if (action === "double") teachRef.current?.undo();
        if (action === "hold") teachRef.current?.save();
        return;
      }
      const mode = ringMode();
      switch (commandFor(mode, action)) {
        case "capture":
          ringCapture(0);
          break;
        case "backchannel":
          playBackchannel(nextBackchannel());
          break;
        case "queue":
          if (state.candidates.length > 0) {
            dispatch({ type: "QUEUE_SENTENCE", sentence: state.candidates[0] });
          }
          break;
        case "next":
          moveScan(1);
          break;
        case "select":
          chooseScan();
          break;
        case "retake":
          retake(scanRef.current?.level ?? reviewRef.current?.level ?? 0);
          break;
        case "cancel":
          endScan();
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.candidates, dispatch, ringCapture, moveScan, chooseScan, retake, endScan]
  );

  const scanIndex = scan?.index ?? -1;
  const scanLabel = scan?.options[scan.index]?.label;
  useEffect(() => {
    if (scanIndex < 0) return;
    feedbackRef.current("highlight");
    if (sourceSettings.speakOnHighlight && scanLabel) speakNow(scanLabel).catch(() => {});
  }, [scanIndex, scanLabel, scan?.options, sourceSettings.speakOnHighlight]);

  const scanning = scan !== null;
  useEffect(() => {
    if (!scanning || !sourceSettings.autoScan) return;
    const t = setInterval(() => moveScan(1), sourceSettings.autoScanSec * 1000);
    return () => clearInterval(t);
  }, [scanning, sourceSettings.autoScan, sourceSettings.autoScanSec, moveScan]);

  const { hub, ringStatus } = useButtonInputs(sourceSettings, handleInput, sourceSettings.beep);
  feedbackRef.current = (kind) => {
    hub.feedback(kind);
    const sameLink =
      sourceSettings.buttonKind === source.kind &&
      (source.kind === "ble" || (sourceSettings.buttonUrl || sourceSettings.wsUrl) === sourceSettings.wsUrl);
    if (!sameLink) source.feedback?.(kind);
  };

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

  // Speak the queued sentence automatically at the partner's next pause
  const speakQueueRef = useRef(handleSpeakQueue);
  speakQueueRef.current = handleSpeakQueue;
  const hasQueue = state.queuedSentence !== null;
  useEffect(() => {
    if (!autoPause || !hasQueue) return;
    let detector: { stop(): void } | null = null;
    let cancelled = false;
    startPauseDetector(() => void speakQueueRef.current())
      .then((d) => {
        if (cancelled) d.stop();
        else {
          detector = d;
          setListening(true);
        }
      })
      .catch((err) => {
        console.warn("[listen] mic unavailable", err);
        showToast("Microphone unavailable for pause detection");
        setAutoPause(false);
      });
    return () => {
      cancelled = true;
      detector?.stop();
      setListening(false);
    };
  }, [autoPause, hasQueue, showToast]);

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
            listening={listening}
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
              source={source}
              orientation={orientationFor(sourceSettings)}
              burst={isStillSource(sourceSettings) ? sourceSettings.burst : 1}
              discard={sourceSettings.discard}
              delayMs={sourceSettings.delayMs}
              aim={aim}
              maxCandidates={sourceSettings.maxCandidates}
              onTargetCue={sourceSettings.onTargetCue}
              onOnTarget={() => feedbackRef.current("on-target")}
              freezeMs={Number.POSITIVE_INFINITY}
              highlight={scan ? scan.options[scan.index]?.rung.box ?? null : null}
            />
            {hint && (
              <div
                key={hint.key}
                data-testid="hint"
                className="absolute bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-amber-400 text-black text-lg font-semibold shadow-lg pointer-events-none"
              >
                {hint.text}
              </div>
            )}
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
            <span data-testid="siglip-status" className={siglip.status === "error" ? "text-amber-600" : ""}>
              {siglip.status === "loading"
                ? `Downloading recognition model ${Math.round(siglip.progress * 100)}%…`
                : siglip.status === "ready"
                  ? `Everyday-object names on (${siglip.device === "webgpu" ? "GPU" : "CPU"})`
                  : siglip.status === "error"
                    ? "Basic names only (recognition model unavailable)"
                    : ""}
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
            <label
              className="flex items-center gap-1 cursor-pointer"
              title="Uses the microphone to wait for your partner to pause, then speaks the queued sentence"
            >
              <input
                type="checkbox"
                checked={autoPause}
                onChange={(e) => {
                  setAutoPause(e.target.checked);
                  e.target.blur();
                }}
              />
              Auto-speak queue at pause (mic)
            </label>
            {source.kind === "webcam" && cameras.length > 1 && (
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
          {scan && (
            <Scanner
              options={scan.options.map((o) => ({
                key: o.key,
                label: o.label,
                thumbnail: o.capture.thumbnail,
                detail:
                  o.capture.source === "claude"
                    ? `Claude's guess · ${RUNG_TEXT[o.rung.kind]}`
                    : `${Math.round(o.score * 100)}% sure · ${RUNG_TEXT[o.rung.kind]}`,
              }))}
              index={scan.index}
              hint={RING_HINTS[sourceSettings.autoScan ? "autoscan" : "scanning"]}
              autoScanSec={sourceSettings.autoScan ? sourceSettings.autoScanSec : null}
              onPick={(i) => setScan((s) => s && { ...s, index: i })}
              onSelect={() => chooseScan()}
              onNext={() => moveScan(1)}
              onRetake={() => retake(scan.level)}
              onCancel={() => endScan()}
            />
          )}
          <SourceSettings
            settings={sourceSettings}
            onChange={setSourceSettings}
            source={source}
            status={sourceStatus}
            buttonStatus={ringStatus}
            calibration={calibration}
            onCalibrate={() => setCalibrating(true)}
            onPersonal={() => setTeaching(true)}
          />
          {teaching && (
            <PersonalObjects
              ref={teachRef}
              ready={siglip.status === "ready"}
              capture={async () => {
                const t = await cameraRef.current?.capture();
                cameraRef.current?.unfreeze();
                return t ?? null;
              }}
              onSaved={(obj) => {
                feedbackRef.current("select");
                showToast(`Learned: ${obj.name}`);
              }}
              onClose={() => setTeaching(false)}
            />
          )}
          {calibrating && (
            <Calibration
              ref={calibRef}
              title={`${source.label}, ${sourceSettings.hand} hand`}
              current={calibration}
              capture={async () => {
                const t = await cameraRef.current?.capture();
                cameraRef.current?.unfreeze();
                return t?.image ?? null;
              }}
              onSave={(cal) => {
                saveCalibration(calibKey, cal);
                setCalibration(cal);
                setCalibrating(false);
                feedbackRef.current("select");
                showToast("Aim calibrated");
              }}
              onReset={() => {
                clearCalibration(calibKey);
                setCalibration(null);
              }}
              onClose={() => setCalibrating(false)}
            />
          )}
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-400 mb-3 text-center uppercase tracking-wider">
            Captured objects
          </div>
          <TileBar
            captures={state.captures}
            selectedTileIds={state.selectedTileIds}
            onToggle={(id) => dispatch({ type: "TOGGLE_TILE", id })}
            onRename={(id, label) => {
              correctSelection(id, label, "manual");
              dispatch({
                type: "UPDATE_CAPTURE",
                id,
                patch: { label, source: "manual", confidence: 0, refining: false },
              });
            }}
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
