import { useState } from "react";
import type { PrivateMessaging } from "../lib/usePrivateMessaging";

interface Props {
  pm: PrivateMessaging;
}

export function Contacts({ pm }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const offline = pm.mode === "offline";
  const selected = new Set(pm.caretakers.map((c) => c.id));

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await pm.addContact(name, phone);
      setName("");
      setPhone("");
      setAdding(false);
    } catch (err) {
      setError((err as Error).message === "Failed to fetch" ? "Qu can't reach the hub. Start it with npm run hub." : (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto rounded-2xl border border-gray-200 bg-white p-3 flex flex-col gap-3" data-testid="contacts">
      <div className="flex items-center justify-between gap-3">
        <div className="text-base font-semibold text-gray-900">
          {pm.caretakers.length === 0 ? "No caregiver chosen" : `Current caregivers: ${pm.caretakers.map((c) => c.name).join(", ")}`}
        </div>
        <button
          onClick={(e) => {
            setAdding((v) => !v);
            e.currentTarget.blur();
          }}
          className="min-h-11 px-4 rounded-xl border-2 border-gray-300 bg-gray-50 text-base font-semibold text-gray-900"
          data-testid="contact-add-toggle"
        >
          {adding ? "Close" : "Add a person"}
        </button>
      </div>
      {offline && <div className="text-base text-amber-800">Texting is off: the hub is not running.</div>}
      {!offline && pm.mode === "dry-run" && <div className="text-sm text-gray-500">Test mode: texts are logged, not sent.</div>}
      {pm.contacts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label="Tick the people Qu texts">
          {pm.contacts.map((c) => {
            const on = selected.has(c.id);
            return (
              <button
                key={c.id}
                onClick={(e) => {
                  pm.toggleTarget(c);
                  e.currentTarget.blur();
                }}
                aria-pressed={on}
                className={`min-h-14 px-3 py-2 rounded-xl border-2 text-base font-semibold text-left ${
                  on ? "bg-blue-600 border-blue-700 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                data-testid="contact"
              >
                {on ? "✓ " : ""}
                {c.name}
              </button>
            );
          })}
        </div>
      )}
      {adding && (
        <form
          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Name
            <input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-11 rounded-xl border-2 border-gray-300 px-3 text-base"
              placeholder="Maya"
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Phone number
            <input
              id="contact-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="min-h-11 rounded-xl border-2 border-gray-300 px-3 text-base"
              placeholder="+1 555 123 4567"
              inputMode="tel"
              autoComplete="off"
            />
          </label>
          <button type="submit" disabled={busy} className="min-h-11 px-4 rounded-xl bg-blue-600 text-white text-base font-semibold disabled:opacity-50" data-testid="contact-save">
            Save
          </button>
          {error && <div className="sm:col-span-3 text-base text-red-700">{error}</div>}
        </form>
      )}
    </section>
  );
}
