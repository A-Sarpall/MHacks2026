import { useEffect, useRef, useState } from "react";
import type { CaptureTarget } from "./CameraView";
import { PersonalObjects, type PersonalObjectsHandle } from "./PersonalObjects";
import {
  addContact,
  fetchContacts,
  fetchVoiceStatus,
  type Contact,
} from "../lib/messages";
import type { StatusInfo } from "../vision/sources/types";
import type { FeedbackKind } from "../vision/input/types";
import type { HealthProfile } from "../lib/health";
import { loadHealthProfile, listDemoPatients, setHubPatient, type DemoPatient } from "../lib/health";
import { HUB } from "../lib/hub";

const LS_KEY = "qu.onboarding.done";

export function isOnboardingDone(): boolean {
  return localStorage.getItem(LS_KEY) === "1";
}

function markDone(): void {
  localStorage.setItem(LS_KEY, "1");
}

type Step = "ring" | "health" | "caregiver" | "voice" | "done";
const STEPS: Step[] = ["ring", "health", "caregiver", "voice", "done"];
const STEP_LABELS: Record<Step, string> = {
  ring: "Connect the ring",
  health: "Health record",
  caregiver: "Add caregivers",
  voice: "Voice",
  done: "Done",
};

interface Props {
  onClose: () => void;
  sourceStatus: StatusInfo;
  feedback: (kind: FeedbackKind) => void;
  ringButtonPressed: boolean;
  capture: () => Promise<CaptureTarget | null>;
  siglipReady: boolean;
  health: HealthProfile | null;
  onHealth: (p: HealthProfile | null) => void;
  contacts: Contact[];
  onContactsChanged: () => void;
  wsUrl: string;
}

export function Onboarding({
  onClose,
  sourceStatus,
  feedback,
  ringButtonPressed,
  capture,
  siglipReady,
  health,
  onHealth,
  contacts,
  onContactsChanged,
  wsUrl,
}: Props) {
  const [step, setStep] = useState<Step>("ring");

  const goNext = () => {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  };
  const goTo = (s: Step) => setStep(s);

  const finish = () => {
    markDone();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Set up Qu</h1>
          <button onClick={onClose} className="px-3 py-1 rounded-lg border border-gray-200 text-sm">
            Close
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex gap-1 text-xs">
          {STEPS.map((s) => (
            <button
              key={s}
              onClick={() => goTo(s)}
              className={`px-2 py-1 rounded ${s === step ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {STEP_LABELS[s]}
            </button>
          ))}
        </div>

        {step === "ring" && (
          <StepRing
            status={sourceStatus}
            feedback={feedback}
            buttonPressed={ringButtonPressed}
            wsUrl={wsUrl}
            onNext={goNext}
          />
        )}
        {step === "health" && (
          <StepHealth health={health} onHealth={onHealth} onNext={goNext} />
        )}
        {step === "caregiver" && (
          <StepCaregiver
            contacts={contacts}
            onContactsChanged={onContactsChanged}
            capture={capture}
            siglipReady={siglipReady}
            onNext={goNext}
          />
        )}
        {step === "voice" && <StepVoice onNext={goNext} />}
        {step === "done" && (
          <StepDone
            sourceStatus={sourceStatus}
            health={health}
            contacts={contacts}
            onFinish={finish}
            goTo={goTo}
          />
        )}
      </div>
    </div>
  );
}

// ---- Step 1: Connect the ring ----

function StepRing({
  status,
  feedback,
  buttonPressed,
  wsUrl,
  onNext,
}: {
  status: StatusInfo;
  feedback: (kind: FeedbackKind) => void;
  buttonPressed: boolean;
  wsUrl: string;
  onNext: () => void;
}) {
  const isLive = status.status === "live";
  const isConnecting = status.status === "connecting" || status.status === "reconnecting";

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">1. Connect the ring</h2>

      <div className="flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full ${isLive ? "bg-green-500" : isConnecting ? "bg-amber-400 animate-pulse" : "bg-red-400"}`}
        />
        <span className="font-medium">
          {isLive ? "Ring connected" : isConnecting ? "Connecting..." : "Not connected"}
        </span>
      </div>

      {!isLive && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <p className="font-medium">To connect:</p>
          <ol className="list-decimal ml-4 mt-1 space-y-1">
            <li>Join the <strong>Qu-Ring</strong> Wi-Fi (password: <code className="bg-amber-100 px-1 rounded">12345678</code>)</li>
            <li>The app connects to <code className="bg-amber-100 px-1 rounded">{wsUrl}</code></li>
          </ol>
        </div>
      )}

      {isLive && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => feedback("select")}
            className="self-start px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
          >
            Test vibration
          </button>

          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${buttonPressed ? "bg-green-500" : "bg-gray-300"}`} />
            <span className="text-sm">
              {buttonPressed ? "Button press received" : "Press the ring button now"}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onNext} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">
          {isLive ? "Next" : "Skip"}
        </button>
      </div>
    </div>
  );
}

// ---- Step 2: Health record ----

function StepHealth({
  health,
  onHealth,
  onNext,
}: {
  health: HealthProfile | null;
  onHealth: (p: HealthProfile | null) => void;
  onNext: () => void;
}) {
  const [patients, setPatients] = useState<DemoPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listDemoPatients().then(setPatients).catch(() => {});
  }, []);

  const pick = async (subject: string) => {
    setLoading(true);
    setError("");
    try {
      await setHubPatient(subject);
      const p = await loadHealthProfile(subject);
      onHealth(p);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">2. Choose the health record</h2>
      <p className="text-sm text-gray-600">
        Pick a demo patient from FinchNode. This is used for medicine checks and clinic summaries.
      </p>

      {health && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          Current: <strong>{health.name}</strong>
          {health.meds.length > 0 && ` (${health.meds.length} medications)`}
        </div>
      )}

      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
        {patients.map((p) => (
          <button
            key={p.subject}
            onClick={() => void pick(p.subject)}
            disabled={loading}
            className={`text-left px-3 py-2 rounded-lg text-sm border ${
              health?.subject === p.subject
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:bg-gray-50"
            } disabled:opacity-50`}
          >
            <span className="font-medium">{p.name}</span>
            <span className="text-gray-500 ml-2">{p.scenario}</span>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onNext} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">
          {health ? "Next" : "Skip"}
        </button>
      </div>
    </div>
  );
}

// ---- Step 3: Add caregivers ----

function StepCaregiver({
  contacts,
  onContactsChanged,
  capture,
  siglipReady,
  onNext,
}: {
  contacts: Contact[];
  onContactsChanged: () => void;
  capture: () => Promise<CaptureTarget | null>;
  siglipReady: boolean;
  onNext: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [teaching, setTeaching] = useState<{ contact: Contact } | null>(null);
  const [mode, setMode] = useState<"photon" | "dry-run" | null>(null);
  const teachRef = useRef<PersonalObjectsHandle>(null);

  useEffect(() => {
    fetchContacts()
      .then((r) => setMode(r.mode))
      .catch(() => setMode(null));
  }, []);

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) return;
    setAdding(true);
    setError("");
    try {
      const c = await addContact(name.trim(), phone.trim());
      onContactsChanged();
      setName("");
      setPhone("");
      setTeaching({ contact: c });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">3. Add caregivers</h2>
      <p className="text-sm text-gray-600">
        Add people who can message the Qu user. After adding, teach the ring to recognise their phone
        so pointing at it selects them for private messaging.
      </p>

      {mode !== null && (
        <p className="text-xs text-gray-400">
          Messaging mode: <strong>{mode}</strong>
          {mode === "dry-run" && " (messages are logged, not actually sent)"}
        </p>
      )}

      {/* Existing contacts */}
      {contacts.length > 0 && (
        <div className="flex flex-col gap-1">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center gap-2 border border-gray-100 rounded-lg px-3 py-2 text-sm">
              <span className="font-medium flex-1">{c.name}</span>
              <button
                onClick={() => setTeaching({ contact: c })}
                className="px-2 py-1 rounded border border-blue-200 text-blue-600 text-xs"
              >
                Teach phone
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new contact */}
      <div className="flex gap-2 items-end">
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-xs text-gray-500">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maya"
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-xs text-gray-500">Phone number</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void handleAdd(); }}
            placeholder="+1 (734) 555-0100"
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          />
        </label>
        <button
          onClick={() => void handleAdd()}
          disabled={adding || !name.trim() || !phone.trim()}
          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Teach phone overlay */}
      {teaching && (
        <PersonalObjects
          ref={teachRef}
          ready={siglipReady}
          capture={capture}
          onSaved={() => {
            setTeaching(null);
          }}
          onClose={() => setTeaching(null)}
          contacts={contacts}
          defaultContactId={teaching.contact.id}
        />
      )}

      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onNext} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">
          {contacts.length > 0 ? "Next" : "Skip"}
        </button>
      </div>
    </div>
  );
}

// ---- Step 4: Voice ----

function StepVoice({ onNext }: { onNext: () => void }) {
  const [status, setStatus] = useState<{ configured: boolean; voice: string; cloned: boolean } | null>(null);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetchVoiceStatus()
      .then(setStatus)
      .catch((err) => setError((err as Error).message));
  }, []);

  const playSample = async () => {
    setPlaying(true);
    try {
      const res = await fetch(`${HUB}/voice/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Hello, this is how I sound." }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setPlaying(false);
      };
      audio.onerror = () => setPlaying(false);
      await audio.play();
    } catch {
      setPlaying(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">4. Voice (optional)</h2>
      <p className="text-sm text-gray-600">
        ElevenLabs can clone the patient's pre-stroke voice so Qu speaks in their voice.
      </p>

      {error && (
        <p className="text-sm text-amber-600">
          Hub not reachable — voice will use the browser's built-in speech.
        </p>
      )}

      {status && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${status.configured ? "bg-green-500" : "bg-gray-300"}`} />
            <span className="text-sm">
              {status.configured
                ? `ElevenLabs configured — voice: ${status.voice}${status.cloned ? " (cloned)" : ""}`
                : "ElevenLabs not configured (ELEVENLABS_API_KEY not set)"}
            </span>
          </div>

          {status.configured && (
            <button
              onClick={() => void playSample()}
              disabled={playing}
              className="self-start px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {playing ? "Playing..." : "Play sample"}
            </button>
          )}

          {status.configured && !status.cloned && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">To clone a voice, run in the terminal:</p>
              <code className="block bg-gray-100 rounded px-2 py-1 text-xs break-all">
                npm run voice -- clone path/to/audio.wav --name "Dad"
              </code>
              <p className="text-xs text-gray-500 mt-1">
                Then restart the hub. Use a recording of 30+ seconds for best quality.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onNext} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">
          {status?.configured ? "Next" : "Skip"}
        </button>
      </div>
    </div>
  );
}

// ---- Step 5: Done ----

function StepDone({
  sourceStatus,
  health,
  contacts,
  onFinish,
  goTo,
}: {
  sourceStatus: StatusInfo;
  health: HealthProfile | null;
  contacts: Contact[];
  onFinish: () => void;
  goTo: (s: Step) => void;
}) {
  const items: { label: string; ok: boolean; fix: Step }[] = [
    { label: "Ring connected", ok: sourceStatus.status === "live", fix: "ring" },
    { label: "Patient selected", ok: health !== null, fix: "health" },
    { label: `${contacts.length} caregiver${contacts.length === 1 ? "" : "s"} added`, ok: contacts.length > 0, fix: "caregiver" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">5. Ready</h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.fix} className="flex items-center gap-2 text-sm">
            <span className={`w-3 h-3 rounded-full ${item.ok ? "bg-green-500" : "bg-amber-400"}`} />
            <span className="flex-1">{item.label}</span>
            {!item.ok && (
              <button
                onClick={() => goTo(item.fix)}
                className="text-blue-600 text-xs underline"
              >
                Fix
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onFinish} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium">
          Done
        </button>
      </div>
    </div>
  );
}
