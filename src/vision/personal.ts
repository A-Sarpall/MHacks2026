import { cropImage } from "../lib/identify";
import { aimPoint, type Candidate, type Point } from "./core/aim";
import { teachBoxes, type PersonalEntry } from "./core/personalMatch";
import { embedImages } from "./siglip";
import { SIGLIP } from "./siglipConfig";

export interface PersonalObject {
  id: string;
  name: string;
  embeddings: Float32Array[];
  thumbnail: string;
  createdAt: number;
  model: string;
  contactId?: string;
}

export interface TeachSample {
  embeddings: Float32Array[];
  thumbnail: string;
}

const DB_NAME = "cue-personal";
const STORE = "objects";
const THUMB = 160;

let cache: PersonalObject[] = [];
let loaded: Promise<PersonalObject[]> | null = null;
const listeners = new Set<(list: PersonalObject[]) => void>();

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed"));
  });
}

function openDb(): Promise<IDBDatabase> {
  const req = indexedDB.open(DB_NAME, 1);
  req.onupgradeneeded = () => {
    if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: "id" });
  };
  return request(req);
}

async function withStore<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, mode);
    const result = await request(run(tx.objectStore(STORE)));
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
    });
    return result;
  } finally {
    db.close();
  }
}

function emit(): void {
  for (const l of listeners) l(cache);
}

function setCache(list: PersonalObject[]): void {
  cache = [...list].sort((a, b) => a.createdAt - b.createdAt);
  emit();
}

export function loadPersonal(): Promise<PersonalObject[]> {
  if (typeof indexedDB === "undefined") return Promise.resolve(cache);
  loaded ??= withStore<PersonalObject[]>("readonly", (s) => s.getAll())
    .then((list) => {
      setCache(list);
      return cache;
    })
    .catch((err: unknown) => {
      loaded = null;
      console.warn("[personal] could not read taught objects", err);
      return cache;
    });
  return loaded;
}

export function personalObjects(): PersonalObject[] {
  return cache;
}

export function personalEntries(): PersonalEntry[] {
  return cache.filter((o) => o.model === SIGLIP.model);
}

export function onPersonalChange(cb: (list: PersonalObject[]) => void): () => void {
  listeners.add(cb);
  cb(cache);
  return () => listeners.delete(cb);
}

export async function addPersonal(name: string, samples: TeachSample[], contactId?: string): Promise<PersonalObject> {
  const obj: PersonalObject = {
    id: crypto.randomUUID(),
    name: name.trim(),
    embeddings: samples.flatMap((s) => s.embeddings),
    thumbnail: samples[0]?.thumbnail ?? "",
    createdAt: Date.now(),
    model: SIGLIP.model,
    ...(contactId ? { contactId } : {}),
  };
  if (!obj.name) throw new Error("Type a name first");
  if (obj.embeddings.length === 0) throw new Error("Take some photos first");
  await withStore("readwrite", (s) => s.put(obj));
  setCache([...cache, obj]);
  return obj;
}

export async function renamePersonal(id: string, name: string): Promise<void> {
  const obj = cache.find((o) => o.id === id);
  const trimmed = name.trim();
  if (!obj || !trimmed) return;
  const next = { ...obj, name: trimmed };
  await withStore("readwrite", (s) => s.put(next));
  setCache(cache.map((o) => (o.id === id ? next : o)));
}

export async function deletePersonal(id: string): Promise<void> {
  await withStore("readwrite", (s) => s.delete(id));
  setCache(cache.filter((o) => o.id !== id));
}

function thumbnail(crop: HTMLCanvasElement): string {
  const scale = Math.min(1, THUMB / Math.max(crop.width, crop.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(crop.width * scale));
  canvas.height = Math.max(1, Math.round(crop.height * scale));
  canvas.getContext("2d")!.drawImage(crop, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

export async function teachSample(input: {
  image: HTMLCanvasElement;
  candidates?: Candidate[];
  aim?: Point;
}): Promise<TeachSample> {
  const { width: w, height: h } = input.image;
  const aim = input.aim ?? aimPoint(w, h, { dx: 0, dy: 0 });
  const crops = teachBoxes(w, h, aim, input.candidates).map((b) => cropImage(input.image, w, h, b));
  const embeddings = await embedImages(crops);
  return { embeddings, thumbnail: thumbnail(crops[crops.length - 1]) };
}
