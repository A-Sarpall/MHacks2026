import { useEffect, useState } from "react";
import {
  formatDate,
  healthPhrases,
  hubPatient,
  listDemoPatients,
  loadHealthProfile,
  medSentence,
  setHubPatient,
  type DemoPatient,
  type HealthProfile,
} from "../lib/health";

export interface SpokenEntry {
  text: string;
  at: number;
}

interface Props {
  profile: HealthProfile | null;
  onProfile: (profile: HealthProfile | null) => void;
  onSpeak: (sentence: string) => void;
  spokenLog: SpokenEntry[];
  onClearLog: () => void;
}

// ?patient=pediatric-asthma preselects a demo patient; otherwise the hub's patient is used
const initialScenario = new URLSearchParams(location.search).get("patient");

function time(at: number): string {
  return new Date(at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function visitNotes(p: HealthProfile, log: SpokenEntry[]): string {
  return [
    `Qu visit notes: ${p.name}${p.age !== null ? `, age ${p.age}` : ""}`,
    `Record: ${p.sources.join(", ")} via FinchNode${p.synthetic ? " (synthetic demo data)" : ""}`,
    `Allergies: ${p.allergies.map((a) => `${a.keyword}${a.severity ? ` (${a.severity})` : ""}`).join(", ") || "none recorded"}`,
    `Medications: ${p.meds.map((m) => m.spoken).join(", ") || "none recorded"}`,
    "",
    "Said by the patient with Qu during this visit:",
    ...(log.length ? log.map((e) => `${time(e.at)}  "${e.text}"`) : ["(nothing yet)"]),
  ].join("\n");
}

export function HealthPanel({ profile, onProfile, onSpeak, spokenLog, onClearLog }: Props) {
  const [patients, setPatients] = useState<DemoPatient[]>([]);
  const [subject, setSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [copied, setCopied] = useState(false);
  // Whether the hub (medicine checks, clinic summary, agents) is on the same patient
  const [hubSync, setHubSync] = useState<"ok" | "down" | "error" | null>(null);

  useEffect(() => {
    listDemoPatients()
      .then((list) => {
        setPatients(list);
        const pre = list.find((p) => p.scenario === initialScenario || p.subject === initialScenario);
        if (pre) setSubject(pre.subject);
        else if (!initialScenario)
          void hubPatient().then((s) => {
            if (s && list.some((p) => p.subject === s)) setSubject((cur) => cur ?? s);
          });
      })
      .catch((err) => {
        console.warn("[health] patient list failed", err);
        setError("Could not reach FinchNode. Check your connection.");
      });
  }, [attempt]);

  useEffect(() => {
    if (!subject) {
      onProfile(null);
      setHubSync(null);
      return;
    }
    let cancelled = false;
    void setHubPatient(subject).then((r) => !cancelled && setHubSync(r));
    setLoading(true);
    setError("");
    loadHealthProfile(subject)
      .then((p) => !cancelled && onProfile(p))
      .catch((err) => {
        console.warn("[health] record failed", err);
        if (!cancelled) {
          onProfile(null);
          setError(err instanceof Error ? err.message : "Could not load the record");
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [subject, attempt, onProfile]);

  const copyNotes = () => {
    if (!profile) return;
    navigator.clipboard
      .writeText(visitNotes(profile, spokenLog))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((err) => console.warn("[health] copy failed", err));
  };

  const phrases = profile ? healthPhrases(profile) : [];

  return (
    <div className="flex flex-col gap-4" data-testid="health-panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Health record</div>
          <div className="text-[11px] text-gray-400">FinchNode synthetic demo patients</div>
        </div>
        <select
          value={subject ?? ""}
          onChange={(e) => {
            setSubject(e.target.value || null);
            e.target.blur();
          }}
          className="border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-sm max-w-full"
          data-testid="patient-select"
        >
          <option value="">No record connected</option>
          {patients.map((p) => (
            <option key={p.subject} value={p.subject}>
              {p.name}: {p.title}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-sm">
          {error}
          <button onClick={() => setAttempt((a) => a + 1)} className="underline">
            Retry
          </button>
        </div>
      )}
      {loading && <div className="text-sm text-gray-500">Loading record from FinchNode…</div>}
      {!subject && !error && (
        <div className="text-sm text-gray-500">
          Connect a patient's record to get allergy alerts when they point at food, sentences
          about their own medicines, and one-tap answers for clinic visits.
        </div>
      )}

      {profile && !loading && (
        <>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-lg font-bold text-gray-900">{profile.name}</span>
            {profile.age !== null && <span className="text-gray-500">age {profile.age}</span>}
            <span className="text-xs text-gray-400">
              {profile.sources.join(", ")}
              {profile.dataAsOf ? ` · data as of ${formatDate(profile.dataAsOf)}` : ""}
            </span>
            {profile.synthetic && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                synthetic
              </span>
            )}
          </div>
          {hubSync && (
            <div className="text-xs text-gray-500 -mt-2" data-testid="hub-sync">
              {hubSync === "ok"
                ? "Check medicine, Clinic summary and the care agents use this record too."
                : hubSync === "down"
                  ? "Hub not running: Check medicine, Clinic summary and the care agents are off."
                  : "The hub could not load this record, so Check medicine and Clinic summary may use another patient."}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-red-700 mb-1">Allergies</div>
              {profile.allergies.length ? (
                <div className="flex flex-wrap gap-1">
                  {profile.allergies.map((a) => (
                    <span
                      key={a.keyword}
                      title={a.reaction ?? undefined}
                      className={`px-2 py-0.5 rounded-full capitalize ${
                        a.severity === "high" ? "bg-red-600 text-white" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {a.keyword}
                      {a.severity ? ` · ${a.severity}` : ""}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400">None recorded</div>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Conditions</div>
              {profile.conditions.length ? (
                <ul className="text-gray-700">
                  {profile.conditions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400">None recorded</div>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-teal-700 mb-1">
                Medications <span className="font-normal text-gray-400">(tap to say)</span>
              </div>
              {profile.meds.length ? (
                <ul className="flex flex-col gap-0.5">
                  {profile.meds.map((m) => (
                    <li key={m.drug}>
                      <button
                        onClick={() => onSpeak(medSentence(m))}
                        title={m.name}
                        className="text-left text-gray-700 hover:text-teal-700 hover:underline"
                      >
                        <span className="capitalize font-medium">{m.spoken}</span>
                        {m.dosage && <span className="text-gray-400">: {m.dosage}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400">None recorded</div>
              )}
            </div>
          </div>

          {(profile.appointment || profile.careTeam.length > 0) && (
            <div className="text-sm text-gray-600">
              {profile.appointment && (
                <span>
                  Next appointment: <b>{formatDate(profile.appointment.start)}</b>,{" "}
                  {profile.appointment.type.toLowerCase()}
                  {profile.appointment.with ? ` with ${profile.appointment.with}` : ""}
                  {". "}
                </span>
              )}
              {profile.careTeam.length > 0 && (
                <span>Care team: {profile.careTeam.map((c) => c.name).join(", ")}</span>
              )}
            </div>
          )}

          <div>
            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
              Say at the clinic
            </div>
            <div className="flex flex-wrap gap-2" data-testid="health-phrases">
              {phrases.map((p) => (
                <button
                  key={p.text}
                  onClick={() => onSpeak(p.text)}
                  className={`px-3 py-2 rounded-xl border-2 text-left transition-all ${
                    p.group === "safety"
                      ? "border-red-200 bg-red-50 text-red-800 hover:border-red-400"
                      : p.group === "record"
                        ? "border-teal-200 bg-teal-50 text-teal-900 hover:border-teal-400"
                        : "border-gray-200 bg-white text-gray-800 hover:border-blue-400"
                  }`}
                >
                  {p.text}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                Visit notes for the care team
              </div>
              <div className="flex gap-2">
                {spokenLog.length > 0 && (
                  <button
                    onClick={onClearLog}
                    className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={copyNotes}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-medium"
                >
                  {copied ? "Copied" : "Copy for clinician"}
                </button>
              </div>
            </div>
            {spokenLog.length ? (
              <ol className="text-sm text-gray-700 flex flex-col gap-0.5" data-testid="visit-log">
                {spokenLog.map((e, i) => (
                  <li key={i}>
                    <span className="text-gray-400 tabular-nums mr-2">{time(e.at)}</span>"{e.text}"
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-sm text-gray-400">
                Everything {profile.firstName} says with Qu shows up here.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
