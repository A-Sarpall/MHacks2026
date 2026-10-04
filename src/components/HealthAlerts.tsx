import type { CapturedObject } from "../lib/types";
import { matchHealth, type HealthProfile } from "../lib/health";

interface Props {
  profile: HealthProfile | null;
  captures: CapturedObject[]; // the selected tiles
  onRename: (id: string, label: string) => void;
}

// What the selected objects mean for this patient: allergens, and which of
// their medicines they are pointing at
export function HealthAlerts({ profile, captures, onRename }: Props) {
  if (!profile) return null;
  const rows = captures
    .filter((c) => !c.refining)
    .map((c) => ({ capture: c, match: matchHealth(c.label, profile) }))
    .filter(({ match: m }) => m.allergies.length || m.meds.length || m.medGuesses.length);
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 w-full max-w-lg mx-auto mb-3" data-testid="health-alerts">
      {rows.map(({ capture, match }) => (
        <div key={capture.id} className="flex flex-col gap-2">
          {match.allergies.map((a) => (
            <div
              key={a.keyword}
              role="alert"
              className="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-red-800"
            >
              <div className="font-bold">
                Allergy alert: <span className="capitalize">{capture.label}</span> may
                contain {a.keyword}
              </div>
              <div className="text-sm">
                {profile.firstName}'s record lists {a.severity ? `a ${a.severity}-severity` : "an"}{" "}
                {a.keyword} allergy{a.reaction ? ` (${a.reaction.toLowerCase()})` : ""}.
              </div>
            </div>
          ))}
          {match.meds.map((m) => (
            <div
              key={m.drug}
              className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-teal-900 text-sm"
            >
              <span className="font-semibold capitalize">{m.spoken}</span> is one of{" "}
              {profile.firstName}'s medicines{m.dosage ? `: ${m.dosage}` : "."}
            </div>
          ))}
          {match.medGuesses.length > 0 && (
            <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-teal-900 text-sm">
              <div className="mb-1.5">
                Which of {profile.firstName}'s medicines is the{" "}
                <span className="font-semibold">{capture.label}</span>?
              </div>
              <div className="flex flex-wrap gap-1.5">
                {match.medGuesses.slice(0, 8).map((m) => (
                  <button
                    key={m.drug}
                    onClick={() => onRename(capture.id, m.spoken)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-teal-300 hover:bg-teal-100 capitalize"
                  >
                    {m.spoken}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
