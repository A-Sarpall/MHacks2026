import { useEffect, useRef, useState } from "react";
import type { PrivateMessaging } from "../lib/usePrivateMessaging";

interface Props {
  pm: PrivateMessaging;
}

export function ContactPicker({ pm }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = new Set(pm.targets.map((c) => c.id));
  const shown = pm.contacts.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));
  const label =
    pm.targets.length === 0 ? "Say it out loud" : pm.targets.length <= 2 ? `To: ${pm.targets.map((c) => c.name).join(" and ")}` : `To: ${pm.targets.length} people`;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (pm.mode === "offline") {
    return (
      <div className="w-full max-w-md mx-auto text-base text-amber-800 text-center" data-testid="contact-picker">
        Texting is off: the hub is not running.
      </div>
    );
  }
  if (pm.contacts.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto text-base text-gray-600 text-center" data-testid="contact-picker">
        No people added yet. Add them in Setup.
      </div>
    );
  }

  return (
    <div ref={ref} className="relative w-full max-w-md mx-auto" data-testid="contact-picker">
      <button
        onClick={(e) => {
          setOpen((v) => !v);
          e.currentTarget.blur();
        }}
        aria-expanded={open}
        className={`w-full min-h-12 px-4 rounded-xl border-2 text-base font-semibold text-left flex items-center justify-between ${
          pm.targets.length > 0 ? "border-blue-600 bg-blue-50 text-blue-900" : "border-gray-300 bg-white text-gray-900"
        }`}
        data-testid="contact-picker-button"
      >
        <span>{label}</span>
        <span aria-hidden="true">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 rounded-xl border-2 border-gray-300 bg-white shadow-lg p-2 flex flex-col gap-2" data-testid="contact-picker-list">
          {pm.contacts.length > 3 && (
            <input
              id="contact-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="min-h-11 rounded-lg border-2 border-gray-300 px-3 text-base"
              autoComplete="off"
            />
          )}
          <div className="max-h-[11.5rem] overflow-y-auto flex flex-col gap-1" role="group" aria-label="Send to">
            {shown.map((c) => {
              const on = selected.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => pm.toggleTarget(c)}
                  aria-pressed={on}
                  className={`min-h-14 px-3 rounded-lg border-2 text-base font-semibold text-left flex items-center gap-3 ${
                    on ? "bg-blue-600 border-blue-700 text-white" : "bg-white border-gray-200 text-gray-900"
                  }`}
                  data-testid="contact-option"
                >
                  <span className="w-5 text-center" aria-hidden="true">{on ? "✓" : ""}</span>
                  {c.name}
                </button>
              );
            })}
            {shown.length === 0 && <div className="px-3 py-2 text-base text-gray-500">No one matches.</div>}
          </div>
          <button
            onClick={() => {
              pm.clearTargets();
              setOpen(false);
            }}
            className="min-h-11 px-3 rounded-lg border-2 border-gray-300 text-base font-semibold text-gray-900"
          >
            Say it out loud instead
          </button>
        </div>
      )}
    </div>
  );
}
