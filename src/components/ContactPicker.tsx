import type { PrivateMessaging } from "../lib/usePrivateMessaging";

interface Props {
  pm: PrivateMessaging;
}

export function ContactPicker({ pm }: Props) {
  const names = pm.caretakers.map((c) => c.name);
  const sendLabel =
    names.length === 0 ? "Send to caregiver" : names.length <= 2 ? `Send to ${names.join(" and ")}` : `Send to ${names.length} people`;
  const canText = pm.mode !== "offline" && names.length > 0;
  const texting = pm.deliverTo === "text" && canText;
  return (
    <div className="w-full flex flex-col gap-1" data-testid="contact-picker">
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="How to say it">
        <button
          onClick={(e) => {
            pm.setDeliverTo("speech");
            e.currentTarget.blur();
          }}
          aria-pressed={!texting}
          className={`min-h-(--tap) px-3 rounded-xl border-2 text-base sm:text-lg font-semibold ${
            !texting ? "bg-blue-600 border-blue-700 text-white" : "bg-white border-gray-300 text-gray-900"
          }`}
          data-testid="deliver-speech"
        >
          Say out loud
        </button>
        <button
          onClick={(e) => {
            pm.setDeliverTo("text");
            e.currentTarget.blur();
          }}
          disabled={!canText}
          aria-pressed={texting}
          className={`min-h-(--tap) px-3 rounded-xl border-2 text-base sm:text-lg font-semibold ${
            texting ? "bg-blue-600 border-blue-700 text-white" : "bg-white border-gray-300 text-gray-900"
          } ${canText ? "" : "opacity-50"}`}
          data-testid="deliver-text"
        >
          {sendLabel}
        </button>
      </div>
      {pm.mode === "offline" && <div className="text-sm text-amber-800 text-center">Texting is off: the hub is not running.</div>}
      {pm.mode !== "offline" && names.length === 0 && (
        <div className="text-base text-gray-600 text-center">No caregiver chosen yet. Choose one in Setup, People.</div>
      )}
      {pm.mode === "dry-run" && names.length > 0 && <div className="text-sm text-gray-500 text-center hide-when-short">Test mode: texts are logged, not sent.</div>}
    </div>
  );
}
