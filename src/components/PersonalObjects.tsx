import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { CaptureTarget } from "./CameraView";
import {
  addPersonal,
  deletePersonal,
  loadPersonal,
  onPersonalChange,
  renamePersonal,
  teachSample,
  type PersonalObject,
  type TeachSample,
} from "../vision/personal";
import { SIGLIP } from "../vision/siglipConfig";
import type { Contact } from "../lib/messages";

export interface PersonalObjectsHandle {
  press(): void;
  undo(): void;
  save(): void;
}

interface Props {
  ready: boolean;
  capture: () => Promise<CaptureTarget | null>;
  onSaved: (obj: PersonalObject) => void;
  onClose: () => void;
  contacts?: Contact[];
  defaultContactId?: string;
}

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 5;

export const PersonalObjects = forwardRef<PersonalObjectsHandle, Props>(function PersonalObjects(
  { ready, capture, onSaved, onClose, contacts, defaultContactId },
  ref
) {
  const [objects, setObjects] = useState<PersonalObject[]>([]);
  const [samples, setSamples] = useState<TeachSample[]>([]);
  const [name, setName] = useState("");
  const [contactId, setContactId] = useState(defaultContactId ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const samplesRef = useRef(samples);
  samplesRef.current = samples;
  const nameRef = useRef(name);
  nameRef.current = name;
  const contactIdRef = useRef(contactId);
  contactIdRef.current = contactId;
  const busyRef = useRef(false);

  useEffect(() => {
    void loadPersonal();
    return onPersonalChange(setObjects);
  }, []);

  const press = async () => {
    if (busyRef.current) return;
    if (!ready) {
      setMessage("The recognition model is still loading. Try again in a moment.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setMessage("");
    try {
      const target = await capture();
      if (!target) {
        setMessage("No picture. Is the camera connected?");
        return;
      }
      const sample = await teachSample(target);
      setSamples((prev) => [...prev, sample].slice(-MAX_PHOTOS));
    } catch (err) {
      setMessage(String((err as Error).message ?? err));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const save = async () => {
    const list = samplesRef.current;
    if (busyRef.current) return;
    if (list.length < MIN_PHOTOS) {
      setMessage(`Take at least ${MIN_PHOTOS} photos first.`);
      return;
    }
    if (!nameRef.current.trim()) {
      setMessage("Type a name first.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      const obj = await addPersonal(nameRef.current, list, contactIdRef.current || undefined);
      setSamples([]);
      setName("");
      setContactId("");
      setMessage(`Saved "${obj.name}".`);
      onSaved(obj);
    } catch (err) {
      setMessage(String((err as Error).message ?? err));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const undo = () => setSamples((prev) => prev.slice(0, -1));

  useImperativeHandle(ref, () => ({
    press: () => void press(),
    undo,
    save: () => void save(),
  }));

  const commitRename = async () => {
    if (!editing) return;
    try {
      await renamePersonal(editing.id, editing.name);
      setEditing(null);
    } catch (err) {
      setMessage(String((err as Error).message ?? err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" data-testid="personal-objects">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 grid md:grid-cols-2 gap-5 text-sm">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Teach an object</h2>
          <p className="text-gray-600">
            Point the ring at the object and take {MIN_PHOTOS}–{MAX_PHOTOS} photos from slightly different angles, then
            give it a name like "Mom's mug". Cue will use that name whenever it sees the object.
          </p>
          <div className="flex flex-wrap gap-2 min-h-20" data-testid="personal-photos">
            {Array.from({ length: MAX_PHOTOS }, (_, i) =>
              samples[i] ? (
                <img
                  key={i}
                  src={samples[i].thumbnail}
                  alt={`Photo ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-green-500"
                />
              ) : (
                <div key={i} className="w-20 h-20 rounded-lg border border-dashed border-gray-300" />
              )
            )}
          </div>
          <label className="flex flex-col gap-1">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void save();
              }}
              placeholder="Mom's mug"
              data-testid="personal-name"
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-base"
            />
          </label>
          {contacts && contacts.length > 0 && (
            <label className="flex flex-col gap-1">
              Link to a contact (optional)
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                data-testid="personal-contact"
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-base"
              >
                <option value="">None — just an object</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}'s phone — point to message them
                  </option>
                ))}
              </select>
            </label>
          )}
          {message && <p className="text-amber-700" data-testid="personal-message">{message}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void press()}
              disabled={busy}
              data-testid="personal-photo"
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            >
              {busy ? "Working…" : "Take photo (Space)"}
            </button>
            <button
              onClick={undo}
              disabled={samples.length === 0}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-50"
            >
              Undo (D)
            </button>
            <button
              onClick={() => void save()}
              disabled={busy || samples.length < MIN_PHOTOS || !name.trim()}
              data-testid="personal-save"
              className="px-3 py-1.5 rounded-lg bg-green-600 text-white disabled:opacity-50"
            >
              Save (H)
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Taught objects</h2>
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-gray-200">
              Close
            </button>
          </div>
          {objects.length === 0 && <p className="text-gray-400">Nothing taught yet.</p>}
          <ul className="flex flex-col gap-2" data-testid="personal-list">
            {objects.map((o) => (
              <li key={o.id} className="flex items-center gap-3 border border-gray-100 rounded-lg p-2">
                <img src={o.thumbnail} alt="" className="w-12 h-12 object-cover rounded" />
                {editing?.id === o.id ? (
                  <input
                    autoFocus
                    value={editing.name}
                    onChange={(e) => setEditing({ id: o.id, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void commitRename();
                      if (e.key === "Escape") setEditing(null);
                    }}
                    className="flex-1 border border-gray-300 rounded px-2 py-1"
                  />
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{o.name}</div>
                    <div className="text-xs text-gray-400">
                      {o.embeddings.length} views
                      {o.contactId ? ` · linked to ${contacts?.find((c) => c.id === o.contactId)?.name ?? "a contact"}` : ""}
                      {o.model !== SIGLIP.model ? " · taught with an older model, teach again" : ""}
                    </div>
                  </div>
                )}
                {editing?.id === o.id ? (
                  <button onClick={() => void commitRename()} className="px-2 py-1 rounded border border-gray-200">
                    OK
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing({ id: o.id, name: o.name })}
                    className="px-2 py-1 rounded border border-gray-200"
                  >
                    Rename
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm(`Forget "${o.name}"?`)) {
                      deletePersonal(o.id).catch((err: unknown) => setMessage(String((err as Error).message ?? err)));
                    }
                  }}
                  className="px-2 py-1 rounded border border-red-200 text-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
});
