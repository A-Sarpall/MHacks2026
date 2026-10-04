import type { PrivateMessaging } from "../lib/usePrivateMessaging";

// Choose who a sentence goes to privately (or point the ring at their QR code), and show incoming texts.
export function PrivateBar({ pm }: { pm: PrivateMessaging }) {
  if (pm.target) {
    return (
      <div data-testid="private-banner" className="w-full max-w-2xl flex items-center gap-3 rounded-2xl bg-gray-900 text-white px-4 py-3">
        <span aria-hidden>🔒</span>
        <div className="flex-1">
          <div className="text-lg font-bold">Private to {pm.target.name}</div>
          <div className="text-sm text-gray-300">Nothing is spoken aloud. Pick a sentence to send it.</div>
        </div>
        <button onClick={() => pm.setTarget(null)} className="px-4 py-2 rounded-xl bg-gray-700 font-semibold hover:bg-gray-600">
          Cancel
        </button>
      </div>
    );
  }
  if (pm.contacts.length === 0) return null;
  return (
    <div className="w-full max-w-2xl flex flex-wrap items-center gap-2 text-sm text-gray-600" data-testid="private-contacts">
      <span>Private message to:</span>
      {pm.contacts.map((c) => (
        <button
          key={c.id}
          onClick={() => pm.setTarget(c)}
          className="px-3 py-1.5 rounded-full border border-gray-300 bg-white font-semibold text-gray-800 hover:bg-gray-100"
        >
          {c.name}
        </button>
      ))}
      <span className="text-xs text-gray-400">or point the ring at their QR code{pm.mode === "dry-run" ? " · iMessage in test mode" : ""}</span>
    </div>
  );
}
