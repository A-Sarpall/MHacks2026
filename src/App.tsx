import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CameraView,
  type CameraViewHandle,
  type CaptureTarget,
} from "./components/CameraView";
import { TileBar } from "./components/TileBar";
import { IntentButtons } from "./components/IntentButtons";
import { QuickPhrases } from "./components/QuickPhrases";
import { SpokenBanner } from "./components/SpokenBanner";
import { ACTIVE_PROFILE, isProfileIntent, type Ending, type QuickPhrase } from "./data/profiles";
import { BuildSentence, type BuildState } from "./components/BuildSentence";
import { buildSentence, profileVerbs } from "./lib/profileCompose";
import { mostUsedIndex, recordVerb } from "./lib/verbHistory";
import { setSpeechRate } from "./lib/speak";

setSpeechRate(ACTIVE_PROFILE.sensory.speechRate);

function withProfileDefaults<T extends { beep: boolean; speakOnHighlight: boolean; autoScan: boolean }>(settings: T): T {
  let saved = false;
  try {
    saved = localStorage.getItem("cue.vision.source.v1") !== null;
  } catch {
    saved = false;
  }
  if (saved) return settings;
  const s = ACTIVE_PROFILE.sensory;
  return { ...settings, beep: s.soundFeedback, speakOnHighlight: s.speakOnHighlight, autoScan: s.autoScan };
}
import { Candidates } from "./components/Candidates";
import { StatusBar } from "./components/StatusBar";
import { initDetector } from "./lib/detect";
import { initClassifier } from "./lib/classify";
import { identifyFromImage, identifyWithClaude } from "./lib/identify";
import { hasClaude } from "./lib/claude";
import { claudeComposer, composeMock, quickSentences, composeFromNoun } from "./lib/compose";
import { tts } from "./lib/tts";
import { HelpPanel } from "./components/HelpPanel";
import { PrivateBar } from "./components/PrivateBar";
import { Contacts } from "./components/Contacts";
import { ContactPicker } from "./components/ContactPicker";
import { RepeatCoalescer } from "./lib/coalesce";

const HELP_ALOUD = "I need help!";
const HELP_TEXT = "I need help. Can you come?";
import { IncomingCard } from "./components/IncomingCard";
import { usePrivateMessaging } from "./lib/usePrivateMessaging";
import { readContactQr } from "./lib/qr";
import { TAPBACK_EMOJI, sendPrivate, type Contact } from "./lib/messages";
import { useCueStore, nextBackchannel } from "./lib/store";
import { startPauseDetector } from "./lib/listen";
import type { CapturedObject, InputAction } from "./lib/types";
import { Scanner } from "./components/Scanner";
import { RUNG_TEXT, askClaude, nameTarget, withAlternatives, type NamedOption } from "./vision/naming";
import { correctSelection, historyBoost, recordSelection } from "./vision/history";
import { RING_HINTS, commandFor, type RingCommand, type RingMode } from "./vision/input/mappings";
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
  // Last sentence said aloud (the spoken banner)
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);
  const pm = usePrivateMessaging();
  const [helpOpen, setHelpOpen] = useState(false);
  const [overstimulated, setOverstimulated] = useState(() => {
    try {
      return localStorage.getItem("cue.capacity.v1") === "overstimulated";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("cue.capacity.v1", overstimulated ? "overstimulated" : "ok");
    } catch {
      return;
    }
  }, [overstimulated]);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [objectsOpen, setObjectsOpen] = useState(false);
  const demoDoneRef = useRef(false);
  useEffect(() => {
    const demo = new URLSearchParams(window.location.search).get("demo");
    if (!demo || demoDoneRef.current) return;
    demoDoneRef.current = true;
    const c = document.createElement("canvas");
    c.width = 160;
    c.height = 120;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#c7d2fe";
    ctx.fillRect(0, 0, 160, 120);
    ctx.fillStyle = "#1e1b4b";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(demo, 80, 70);
    dispatch({
      type: "ADD_CAPTURE",
      capture: { id: "demo", label: demo, confidence: 0.9, source: "vocab", alternatives: [], thumbnail: c.toDataURL("image/png"), refining: false },
    });
    dispatch({ type: "TOGGLE_INTENT", intent: "need" });
  }, [dispatch]);
  const coalesceRef = useRef(new RepeatCoalescer());
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [setupView, setSetupView] = useState(() => {
    if (new URLSearchParams(window.location.search).get("view") === "setup") return true;
    try {
      return localStorage.getItem("cue.view.v1") === "setup";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("cue.view.v1", setupView ? "setup" : "user");
    } catch {
      return;
    }
  }, [setupView]);
  const [quickIndex, setQuickIndex] = useState<number | null>(null);
  const [intentIndex, setIntentIndex] = useState<number | null>(null);
  const [build, setBuild] = useState<BuildState | null>(null);
  const [buildIndex, setBuildIndex] = useState<number | null>(null);
  const [sentenceIndex, setSentenceIndex] = useState<number | null>(null);
  const flowRef = useRef({ quickIndex: null as number | null, intentIndex: null as number | null, sentenceIndex: null as number | null, build: null as BuildState | null, buildIndex: null as number | null, canBuild: false, buildVerbs: [] as string[] });
  const helpRef = useRef(helpOpen);
  helpRef.current = helpOpen;
  const pmRef = useRef(pm);
  pmRef.current = pm;
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);
  const [sourceSettings, setSourceSettings] = useState(() => withProfileDefaults(loadSourceSettings()));
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
  const settingsRef = useRef(sourceSettings);
  settingsRef.current = sourceSettings;

  // Brief "Identified: X" banner over the camera
  const showToast = useCallback((text: string) => {
    setToast({ text, key: Date.now() });
  }, []);
  useEffect(() => {
    document.documentElement.dataset.calm = String(!ACTIVE_PROFILE.sensory.animation);
  }, []);

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
      setQuickIndex(null);
      setSentenceIndex(null);
      setBuild(null);
      setIntentIndex(null);
      showToast(
        `Identified: ${capture.label}` +
          (capture.confidence ? ` (${Math.round(capture.confidence * 100)}%)` : "")
      );
      if (sayNameRef.current && !refine) tts.speak(capture.label).catch(() => {});
      if (!refine) return;

      dispatch({ type: "SET_STATUS", status: "identifying" });
      try {
        const hints = [capture.label, ...capture.alternatives.map((a) => a.label)];
        const label = await identifyWithClaude(crop, hints);
        const same = !label || label.trim().toLowerCase() === capture.label.trim().toLowerCase();
        const patch =
          label && !same
            ? {
                alternatives: [
                  { label, score: 0, source: "claude" as const },
                  ...capture.alternatives.filter((a) => a.label !== label),
                ],
              }
            : {};
        dispatch({ type: "UPDATE_CAPTURE", id: capture.id, patch: { ...patch, refining: false } });
        if (label && !same) showToast(`Could also be: ${label}`);
        if (sayNameRef.current) tts.speak(capture.label).catch(() => {});
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
      setTimeout(() => cameraRef.current?.unfreeze(), 900);
    },
    [commitCapture]
  );

  const endScan = useCallback((unfreezeAfterMs = 0) => {
    scanSeq.current++;
    setScan(null);
    setTimeout(() => cameraRef.current?.unfreeze(), unfreezeAfterMs);
  }, []);

  const captureBusyRef = useRef(false);
  const busyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ringCapture = useCallback(
    (level: number) => {
      if (captureBusyRef.current) return;
      captureBusyRef.current = true;
      if (busyTimer.current) clearTimeout(busyTimer.current);
      busyTimer.current = setTimeout(() => { captureBusyRef.current = false; }, 15_000);
      reviewRef.current = null;
      const seq = ++scanSeq.current;
      cameraRef.current
        ?.capture()
        .then(async (target) => {
          if (!target || seq !== scanSeq.current) return;
          feedbackRef.current("captured");
          // A contact holding up their Qu QR code means "message them privately", not "name an object".
          const qrId = readContactQr(target.image);
          if (qrId) {
            const name = await pmRef.current.selectById(qrId);
            feedbackRef.current(name ? "select" : "error");
            showToast(name ? `Private to ${name}` : "Unknown QR code");
            endScan();
            return;
          }
          dispatch({ type: "SET_STATUS", status: "identifying" });
          if (target.burst) console.info("[capture] burst", JSON.stringify(target.burst));
          if (target.streamPick) console.info("[capture] stream", JSON.stringify(target.streamPick));
          const res = await nameTarget({ ...target, sharpness: target.burst?.sharpness[0] ?? target.streamPick?.sharpness }, {
            startLevel: level,
            maxOptions: settingsRef.current.maxCandidates,
            namer: { boost: historyBoost() },
          }).finally(() => dispatch({ type: "SET_STATUS", status: "idle" }));
          console.info(
            "[naming]",
            JSON.stringify({
              level: res.level,
              low: res.low,
              blurry: res.blurry,
              broad: res.broad,
              ms: Math.round(res.ms),
              tooSmall: res.tooSmall,
              empty: res.empty,
              options: res.options.map((o) => [o.label, Math.round(o.score * 100), o.rung.kind]),
            })
          );
          if (res.tooSmall) setHint({ text: "Move closer", key: Date.now() });
          if (seq !== scanSeq.current) return;
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
          void commitCapture(withAlternatives(res.best, res.options), res.best.crop);
          reviewRef.current = { until: performance.now() + REVIEW_MS, level: res.level };
          endScan(900);
        })
        .catch((err: unknown) => {
          console.warn("[capture]", err);
          feedbackRef.current("error");
          showToast(String((err as Error)?.message ?? "Could not take a picture"));
        })
        .finally(() => {
          captureBusyRef.current = false;
          if (busyTimer.current) { clearTimeout(busyTimer.current); busyTimer.current = null; }
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
      scanSeq.current++;
      setScan(null);
      cameraRef.current?.unfreeze();
      ringCapture(Math.min(2, fromLevel + 1));
    },
    [ringCapture]
  );

  // With a private contact selected, a picked sentence is texted to them instead of spoken aloud.
  const sendPrivately = useCallback(
    async (sentence: string) => {
      try {
        const name = await pmRef.current.send(sentence);
        feedbackRef.current("select");
        showToast(`Sent privately to ${name}`);
      } catch (err) {
        feedbackRef.current("error");
        showToast(`Couldn't send: ${(err as Error).message}`);
      }
    },
    [showToast]
  );

  // "I need help" texted privately: to that contact, or (from the ring) to the people selected
  // under the camera, else the first contact. Closes the panel and confirms, like any sent phrase.
  const textHelp = useCallback(
    async (contact: Contact | undefined) => {
      const pmNow = pmRef.current;
      let names: string[];
      try {
        if (contact) {
          await sendPrivate(contact.id, HELP_TEXT);
          names = [contact.name];
        } else if (pmNow.caretakers.length > 0) {
          names = await pmNow.sendToTargets(HELP_TEXT);
        } else if (pmNow.contacts[0]) {
          await sendPrivate(pmNow.contacts[0].id, HELP_TEXT);
          names = [pmNow.contacts[0].name];
        } else {
          feedbackRef.current("error");
          showToast("No one to text: add people in Setup");
          throw new Error("no contacts");
        }
      } catch (err) {
        feedbackRef.current("error");
        if ((err as Error).message !== "no contacts") showToast(`Couldn't send: ${(err as Error).message}`);
        throw err;
      }
      feedbackRef.current("select");
      setLastSpoken(HELP_TEXT);
      setHelpOpen(false);
      showToast(`Sent to ${names.join(", ")}: I need help`);
    },
    [showToast]
  );

  const handleQuickPhrase = useCallback(
    (phrase: QuickPhrase) => {
      setQuickIndex(null);
      if (phrase.action === "help") {
        setHelpOpen(true);
        return;
      }
      if (phrase.action === "status") {
        setOverstimulated(true);
        const pmNow = pmRef.current;
        if (pmNow.caretakers.length > 0) void pmNow.sendToTargets(ACTIVE_PROFILE.overstimulated.message).catch(() => feedbackRef.current("error"));
        else if (pmNow.target) void pmNow.send(ACTIVE_PROFILE.overstimulated.message).catch(() => feedbackRef.current("error"));
      }
      void sayRef.current(phrase.text);
    },
    []
  );

  const handleSpeak = useCallback(
    async (sentence: string) => {
      setLastSpoken(sentence);
      dispatch({ type: "SET_STATUS", status: "speaking" });
      try {
        await tts.speak(sentence);
      } catch (err) {
        console.warn("[speak]", err);
      }
      dispatch({ type: "SET_STATUS", status: "idle" });
    },
    [dispatch]
  );

  const ringMode = (): RingMode => {
    if (scanRef.current) return settingsRef.current.autoScan ? "autoscan" : "scanning";
    const f = flowRef.current;
    if (f.build) return f.build.step === "verb" ? "verbs" : "endings";
    if (f.sentenceIndex !== null) return "sentences";
    if (f.intentIndex !== null) return "intents";
    if (f.quickIndex !== null) return "quick";
    if (pmRef.current.fresh) return "message";
    return "normal";
  };

  const flowStep = (mode: RingMode, command: RingCommand): boolean => {
    const f = flowRef.current;
    const cycle = (i: number | null, n: number, d = 1) => (n > 0 ? (((i ?? 0) + d) % n + n) % n : 0);
    switch (mode) {
      case "quick": {
        const phrases = ACTIVE_PROFILE.quickPhrases;
        if (command === "next") {
          if ((f.quickIndex ?? 0) >= phrases.length - 1) {
            setQuickIndex(null);
            setIntentIndex(0);
          } else setQuickIndex(cycle(f.quickIndex, phrases.length));
        } else if (command === "select") handleQuickPhrase(phrases[f.quickIndex ?? 0]);
        else if (command === "back") setQuickIndex(null);
        else return false;
        return true;
      }
      case "intents": {
        const intents = ACTIVE_PROFILE.intents;
        if (command === "next") setIntentIndex(cycle(f.intentIndex, intents.length));
        else if (command === "select") {
          const intent = intents[f.intentIndex ?? 0];
          dispatch({ type: "TOGGLE_INTENT", intent: intent.id });
          setIntentIndex(null);
          setSentenceIndex(0);
        } else if (command === "back") setIntentIndex(null);
        else return false;
        return true;
      }
      case "sentences": {
        const offset = f.canBuild ? 1 : 0;
        const n = candidatesRef.current.length + offset;
        if (command === "next") setSentenceIndex(cycle(f.sentenceIndex, n));
        else if (command === "select") {
          const i = f.sentenceIndex ?? 0;
          if (f.canBuild && i === 0) startBuildRef.current();
          else {
            const sentence = candidatesRef.current[i - offset];
            if (sentence) void sayRef.current(sentence);
          }
        } else if (command === "back") {
          setSentenceIndex(null);
          setIntentIndex(0);
        } else return false;
        return true;
      }
      case "verbs": {
        if (command === "next") setBuildIndex(cycle(f.buildIndex, f.buildVerbs.length));
        else if (command === "select") {
          setBuild((b) => ({ step: "ending", verb: f.buildVerbs[f.buildIndex ?? 0], ending: b?.ending ?? "none" }));
          setBuildIndex(0);
        } else if (command === "back") {
          setBuild(null);
          setBuildIndex(null);
          setSentenceIndex(0);
        } else return false;
        return true;
      }
      case "endings": {
        const endings = ACTIVE_PROFILE.endings;
        if (command === "next") setBuildIndex(cycle(f.buildIndex, endings.length));
        else if (command === "select") finishBuildRef.current(endings[f.buildIndex ?? 0]);
        else if (command === "back") {
          setBuild((b) => ({ step: "verb", verb: b?.verb ?? null, ending: b?.ending ?? "none" }));
          setBuildIndex(0);
        } else return false;
        return true;
      }
      default:
        return false;
    }
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
      if (helpRef.current) {
        switch (commandFor("help", action)) {
          case "next":
            void handleSpeak(HELP_ALOUD);
            break;
          case "select":
            void textHelp(undefined).catch(() => {});
            break;
          case "cancel":
            setHelpOpen(false);
            break;
        }
        return;
      }
      if (teachingRef.current) {
        if (action === "click") teachRef.current?.press();
        if (action === "double") teachRef.current?.undo();
        if (action === "hold") teachRef.current?.save();
        return;
      }
      const mode = ringMode();
      const command = commandFor(mode, action);
      if (flowStep(mode, command)) return;
      switch (command) {
        case "capture":
          ringCapture(0);
          break;
        case "backchannel":
          tts.playBackchannel(nextBackchannel());
          break;
        case "tapback":
          pmRef.current
            .tap("like")
            .then((name) => name && showToast(`${TAPBACK_EMOJI.like} sent to ${name}`))
            .catch(() => feedbackRef.current("error"));
          break;
        case "queue":
          if (pmRef.current.target && state.candidates.length > 0) {
            void sendPrivately(state.candidates[0]);
          } else if (state.candidates.length === 0) {
            setQuickIndex(0);
          } else if (state.candidates.length > 0) {
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
    [state.candidates, dispatch, ringCapture, moveScan, chooseScan, retake, endScan, sendPrivately, textHelp, handleSpeak, showToast, handleQuickPhrase]
  );
  const candidatesRef = useRef(state.candidates);
  candidatesRef.current = state.candidates;

  const scanIndex = scan?.index ?? -1;
  const scanLabel = scan?.options[scan.index]?.label;
  useEffect(() => {
    if (scanIndex < 0) return;
    feedbackRef.current("highlight");
    if (sourceSettings.speakOnHighlight && scanLabel) tts.speak(scanLabel).catch(() => {});
  }, [scanIndex, scanLabel, scan?.options, sourceSettings.speakOnHighlight]);

  const scanning = scan !== null;
  useEffect(() => {
    if (!scanning || !sourceSettings.autoScan) return;
    const t = setInterval(() => moveScan(1), sourceSettings.autoScanSec * 1000);
    return () => clearInterval(t);
  }, [scanning, sourceSettings.autoScan, sourceSettings.autoScanSec, moveScan]);

  const { hub, ringStatus } = useButtonInputs(sourceSettings, handleInput, sourceSettings.beep && !overstimulated);
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
    setBuild(null);
    if (selectedLabels.length === 0 && state.selectedCoreWords.length === 0) return;
    const seq = ++composeSeq.current;
    const input = { tiles: selectedLabels, coreWords: state.selectedCoreWords };
    // When only a noun is captured (no intent selected), generate contextual sentences immediately
    const templates = state.selectedCoreWords.length > 0
      ? composeMock(input)
      : selectedLabels.length > 0
        ? quickSentences(selectedLabels)
        : [];
    dispatch({ type: "SET_CANDIDATES", candidates: templates });
    if (!hasClaude() || selectedLabels.length === 0) return;
    dispatch({ type: "SET_STATUS", status: "composing" });
    const composePromise = state.selectedCoreWords.length > 0
      ? claudeComposer.compose(input)
      : composeFromNoun(selectedLabels);
    composePromise
      .then((candidates) => {
        if (seq !== composeSeq.current) return;
        const extra = candidates.filter((c) => !templates.includes(c));
        dispatch({ type: "SET_CANDIDATES", candidates: [...templates, ...extra].filter((c, i, a) => a.indexOf(c) === i).slice(0, 6) });
      })
      .catch((err) => console.warn("[compose] failed, keeping templates", err))
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

  const handleSpeakRef = useRef(handleSpeak);
  handleSpeakRef.current = handleSpeak;
  const say = useCallback(
    async (text: string) => {
      const pmNow = pmRef.current;
      if (pmNow.targets.length > 0) {
        const offer = coalesceRef.current.offer(text, Date.now());
        setLastSpoken(offer.count > 1 ? `${text} (×${offer.count})` : text);
        feedbackRef.current("select");
        if (offer.action === "hold") {
          showToast(`Sent already. Said ${offer.count} times; ${pmNow.targets.map((c) => c.name).join(", ")} will be told the count.`);
          scheduleFlush();
          return;
        }
        try {
          const names = await pmNow.sendToTargets(text);
          showToast(`Sent to ${names.join(", ")}`);
        } catch (err) {
          feedbackRef.current("error");
          showToast(`Couldn't send: ${(err as Error).message}`);
        }
        return;
      }
      if (pmNow.target) return sendPrivately(text);
      return handleSpeakRef.current(text);
    },
    [sendPrivately, showToast]
  );
  const sayRef = useRef(say);
  sayRef.current = say;
  function scheduleFlush() {
    if (flushTimerRef.current) return;
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null;
      const summary = coalesceRef.current.flush(Date.now());
      if (summary) {
        const pmNow = pmRef.current;
        if (pmNow.targets.length > 0) pmNow.sendToTargets(summary).catch((err: unknown) => console.warn("[messages] repeat summary not sent", err));
      }
      if (coalesceRef.current.pending()) scheduleFlush();
    }, coalesceRef.current.nextUpdateIn(Date.now()));
  }

  const intentId = state.selectedCoreWords[0] ?? null;
  const canBuild =
    intentId !== null && isProfileIntent(intentId) && intentId !== "feeling" && selectedLabels.length > 0 && state.candidates.length > 0;
  const buildVerbs = canBuild ? profileVerbs(intentId, selectedLabels) : [];
  const startBuild = () => {
    setBuild({ step: "verb", verb: null, ending: "none" });
    setBuildIndex(intentId ? mostUsedIndex(intentId, buildVerbs) : 0);
  };
  const builder: BuildState = build ?? { step: "verb", verb: null, ending: "none" };
  const sayBuilt = () => {
    if (!build?.verb || !intentId) return;
    const sentence = buildSentence(build.verb, selectedLabels[0], build.ending);
    recordVerb(intentId, build.verb);
    setBuild(null);
    setBuildIndex(null);
    setSentenceIndex(0);
    void say(sentence);
  };
  flowRef.current = { quickIndex, intentIndex, sentenceIndex, build, buildIndex, canBuild, buildVerbs };
  const currentMode = ringMode();
  const finishBuild = (ending: Ending) => {
    if (!build?.verb || !intentId) return;
    const sentence = buildSentence(build.verb, selectedLabels[0], ending);
    recordVerb(intentId, build.verb);
    setBuild(null);
    setBuildIndex(null);
    setSentenceIndex(0);
    void say(sentence);
  };
  const finishBuildRef = useRef(finishBuild);
  finishBuildRef.current = finishBuild;
  const startBuildRef = useRef(startBuild);
  startBuildRef.current = startBuild;

  const latest = state.captures.find((c) => state.selectedTileIds.includes(c.id)) ?? state.captures[0] ?? null;
  const compactCamera = !setupView && latest !== null && !scan;

  const cameraBlock = (
    <div className={`relative ${setupView ? "w-full max-w-2xl" : overstimulated ? "w-full max-w-[160px]" : compactCamera ? "w-28 sm:w-36 shrink-0" : "w-full max-w-md"}`} data-testid="camera-strip">
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
      {hint && !compactCamera && (
        <div
          key={hint.key}
          data-testid="hint"
          onClick={() => setHint(null)}
          role="status"
          className="absolute bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-amber-400 text-black text-lg font-semibold shadow-lg cursor-pointer"
        >
          {hint.text}
        </div>
      )}
      {toast && !compactCamera && (
        <div
          key={toast.key}
          data-testid="toast"
          onClick={() => setToast(null)}
          role="status"
          className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/75 text-white text-lg font-semibold shadow-lg cursor-pointer"
        >
          {toast.text}
        </div>
      )}
      {setupView && (
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
      )}
    </div>
  );

  const statusRow = setupView && (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
      <span data-testid="track-info">
        {state.status === "loading" ? "Loading detection model…" : `Tracking ${trackCount} object${trackCount === 1 ? "" : "s"}`}
        {" · "}
        {hasClaude() ? "Claude identification on" : "on-device identification (set VITE_ANTHROPIC_API_KEY for Claude)"}
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
      <label className="flex items-center gap-1 cursor-pointer" title="Uses the microphone to wait for your partner to pause, then speaks the queued sentence">
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
  );

  const scannerBlock = scan && (
    <Scanner
      options={scan.options.map((o) => ({
        key: o.key,
        label: o.label,
        thumbnail: o.capture.thumbnail,
        detail:
          o.capture.source === "claude"
            ? `Claude's guess · ${RUNG_TEXT[o.rung.kind]}`
            : o.key === "broad"
              ? `${Math.round(o.score * 100)}% sure it's some kind of ${o.label} · ${RUNG_TEXT[o.rung.kind]}`
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
  );

  const transientBlocks = (
    <>
      {overstimulated && (
        <div className="w-full flex items-center justify-between gap-3 rounded-2xl border-2 border-red-400 bg-red-50 px-4 py-3">
          <div className="text-xl sm:text-2xl font-bold text-red-900" data-testid="overstimulated-status">
            {ACTIVE_PROFILE.overstimulated.badge}
          </div>
          <button
            onClick={() => setOverstimulated(false)}
            className="min-h-11 px-4 py-2 rounded-xl border-2 border-red-400 bg-white text-base font-semibold text-red-900"
            data-testid="clear-status"
          >
            {ACTIVE_PROFILE.overstimulated.clear}
          </button>
        </div>
      )}
      {helpOpen && <HelpPanel contacts={pm.contacts} onSay={() => void handleSpeak(HELP_ALOUD)} onText={textHelp} onClose={() => setHelpOpen(false)} />}
      <IncomingCard pm={pm} />
    </>
  );

  const outputBlock = pm.target ? <PrivateBar pm={pm} /> : <ContactPicker pm={pm} />;

  const quickBlock = <QuickPhrases phrases={ACTIVE_PROFILE.quickPhrases} highlight={quickIndex} onPick={handleQuickPhrase} />;

  const tileBar = (
    <TileBar
      captures={state.captures}
      selectedTileIds={state.selectedTileIds}
      onToggle={(id) => dispatch({ type: "TOGGLE_TILE", id })}
      onRename={(id, label) => {
        correctSelection(id, label, "manual");
        dispatch({ type: "UPDATE_CAPTURE", id, patch: { label, source: "manual", confidence: 0, refining: false } });
      }}
      onRemove={(id) => dispatch({ type: "REMOVE_CAPTURE", id })}
    />
  );

  const intentsBlock = !overstimulated && (
    <IntentButtons
      intents={ACTIVE_PROFILE.intents}
      selected={state.selectedCoreWords[0] ?? null}
      highlight={intentIndex}
      onToggle={(intent) => {
        setIntentIndex(null);
        setSentenceIndex(null);
        setBuild(null);
        setBuildIndex(null);
        dispatch({ type: "TOGGLE_INTENT", intent: intent.id });
      }}
    />
  );

  const builderBlock = !overstimulated && canBuild && (
    <BuildSentence
      object={selectedLabels[0]}
      verbs={buildVerbs}
      endings={ACTIVE_PROFILE.endings}
      state={builder}
      highlight={build ? buildIndex : null}
      stripHighlighted={sentenceIndex === 0 && build === null}
      actionLabel={pm.targets.length > 0 ? `Send to ${pm.targets.map((c) => c.name).join(", ")}` : "Say it"}
      onVerb={(verb) => {
        setBuild({ step: "ending", verb, ending: builder.ending });
        setBuildIndex(0);
      }}
      onEnding={(ending) => {
        if (builder.verb) finishBuild(ending);
        else setBuild({ ...builder, ending });
      }}
      onSay={sayBuilt}
      onOpen={() => (build ? setBuild(null) : startBuild())}
    />
  );

  const sentencesBlock = !overstimulated && (
    <Candidates candidates={state.candidates} onSpeak={(s) => void say(s)} highlight={sentenceIndex === null ? null : sentenceIndex - (canBuild ? 1 : 0)} />
  );

  const header = (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-2 shrink-0">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-900">
          Qu
          <span className="ml-2 text-sm font-normal text-gray-400 hidden sm:inline">prototype</span>
        </h1>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={(e) => {
              setSetupView((v) => !v);
              e.currentTarget.blur();
            }}
            className="min-h-11 px-4 rounded-xl border-2 border-gray-300 text-base font-semibold text-gray-800 hover:bg-gray-100"
            aria-pressed={setupView}
            data-testid="view-toggle"
          >
            {setupView ? "Back to Qu" : "Setup"}
          </button>
          {setupView && (
            <>
              <button
                onClick={(e) => {
                  setPeopleOpen(true);
                  e.currentTarget.blur();
                }}
                className="min-h-11 px-4 rounded-xl border-2 border-gray-300 text-base font-semibold text-gray-800 hover:bg-gray-100"
                data-testid="people-open"
              >
                People
              </button>
              <button onClick={() => setHelpOpen(true)} className="min-h-11 px-4 rounded-xl border-2 border-red-300 bg-red-50 text-base font-semibold text-red-700 hover:bg-red-100">
                I need help
              </button>
            </>
          )}
          <button
            onClick={(e) => {
              setOverstimulated((v) => !v);
              e.currentTarget.blur();
            }}
            className={`min-h-11 px-4 rounded-full border-2 text-base font-semibold ${
              overstimulated ? "border-red-500 bg-red-600 text-white" : "border-green-600 bg-green-50 text-green-900"
            }`}
            aria-pressed={overstimulated}
            data-testid="capacity-badge"
          >
            {overstimulated ? "Overstimulated" : "Talking is OK"}
          </button>
          <StatusBar
            status={state.status}
            queuedSentence={state.queuedSentence}
            onClearQueue={() => dispatch({ type: "CLEAR_QUEUE" })}
            onSpeakQueue={handleSpeakQueue}
            listening={listening}
          />
        </div>
      </div>
    </header>
  );

  const drawers = (
    <>
      {peopleOpen && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={() => setPeopleOpen(false)} data-testid="people-drawer">
          <aside className="h-full w-full max-w-md bg-white shadow-xl p-4 overflow-y-auto flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">People Qu can text</h2>
              <button onClick={() => setPeopleOpen(false)} className="min-h-11 px-4 rounded-xl border-2 border-gray-300 text-base font-semibold">
                Close
              </button>
            </div>
            <Contacts pm={pm} />
          </aside>
        </div>
      )}
      {objectsOpen && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={() => setObjectsOpen(false)} data-testid="objects-drawer">
          <aside className="h-full w-full max-w-md bg-white shadow-xl p-4 overflow-y-auto flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Captured objects</h2>
              <button onClick={() => setObjectsOpen(false)} className="min-h-11 px-4 rounded-xl border-2 border-gray-300 text-base font-semibold">
                Close
              </button>
            </div>
            {tileBar}
            <button
              onClick={() => {
                dispatch({ type: "CLEAR_ALL" });
                setObjectsOpen(false);
              }}
              className="min-h-11 px-4 rounded-xl border-2 border-gray-300 text-base font-semibold text-gray-800 self-start"
            >
              Clear all
            </button>
          </aside>
        </div>
      )}
    </>
  );

  if (setupView) {
    return (
      <div className="h-dvh bg-gray-50 flex flex-col overflow-hidden" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
        {header}
        <main className="flex-1 min-h-0 overflow-y-auto max-w-5xl mx-auto w-full px-6 py-6 flex flex-col gap-6">
          {modelError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{modelError}</div>}
          <section className="flex flex-col items-center gap-2">
            {cameraBlock}
            {statusRow}
            {scannerBlock}
            {transientBlocks}
            {outputBlock}
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
          {quickBlock}
          <div className="text-base text-blue-900 text-center" data-testid="ring-hint">
            {RING_HINTS[currentMode]}
          </div>
          <SpokenBanner spoken={lastSpoken} overstimulated={false} badge={ACTIVE_PROFILE.overstimulated.badge} clearLabel={ACTIVE_PROFILE.overstimulated.clear} onClearStatus={() => setOverstimulated(false)} />
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-400 mb-3 text-center uppercase tracking-wider">Captured objects</div>
            {tileBar}
          </section>
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-400 mb-2 text-center uppercase tracking-wider">What do you want to say?</div>
            {intentsBlock}
          </section>
          <section className="flex flex-col gap-2">
            {builderBlock}
            {sentencesBlock}
          </section>
          {(state.captures.length > 0 || state.selectedCoreWords.length > 0) && (
            <div className="flex justify-center">
              <button onClick={() => dispatch({ type: "CLEAR_ALL" })} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                Clear all
              </button>
            </div>
          )}
        </main>
        {drawers}
      </div>
    );
  }

  return (
    <div className="h-dvh bg-gray-50 flex flex-col overflow-hidden" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {header}
      <main className="flex-1 min-h-0 overflow-hidden max-w-6xl mx-auto w-full px-3 sm:px-4 py-2 flex flex-col gap-2 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-4" data-testid="user-main">
        <section className="flex flex-col gap-2 min-h-0 lg:overflow-y-auto">
          {modelError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">{modelError}</div>}
          {compactCamera ? (
            <div className="flex items-stretch gap-2 w-full">
              {cameraBlock}
              <button
                onClick={(e) => {
                  setObjectsOpen(true);
                  e.currentTarget.blur();
                }}
                className="flex items-center gap-2 min-h-11 px-2 rounded-xl border-2 border-gray-300 bg-white text-left shrink-0 max-w-[45%]"
                data-testid="object-thumb"
                aria-label={`Captured: ${latest.label}. Open captured objects`}
              >
                {latest.thumbnail && <img src={latest.thumbnail} alt="" className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg" />}
                <span className="text-base sm:text-lg font-semibold text-gray-900 capitalize truncate">{latest.label}</span>
              </button>
              <div className="flex-1 min-w-0 flex flex-col justify-center" aria-live="polite">
                <div className="text-xs uppercase tracking-wider text-gray-500">Said</div>
                <div className="text-lg sm:text-xl font-bold text-gray-900 leading-tight line-clamp-2" data-testid="spoken-text">
                  {lastSpoken ?? "—"}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {cameraBlock}
              {lastSpoken && (
                <div className="w-full rounded-2xl border-2 border-gray-300 bg-white px-4 py-2" aria-live="polite">
                  <div className="text-xs uppercase tracking-wider text-gray-500">Said</div>
                  <div className="text-xl font-bold text-gray-900 leading-tight" data-testid="spoken-text">
                    {lastSpoken}
                  </div>
                </div>
              )}
            </div>
          )}
          {scannerBlock}
          {transientBlocks}
          {outputBlock}
          {quickBlock}
          <div className="hidden md:block text-sm text-blue-900 text-center" data-testid="ring-hint">
            {RING_HINTS[currentMode]}
          </div>
        </section>
        <section className="flex flex-col gap-2 min-h-0 flex-1">
          {intentsBlock}
          {builderBlock}
          <div className="flex-1 min-h-0 flex flex-col">{sentencesBlock}</div>
        </section>
      </main>
      {drawers}
    </div>
  );
}
