import type { TemplateGroup } from "../../data/profiles";

export interface FrameInput {
  captureId: string;
  object: {
    label: string;
    alternatives: string[];
    confidence: number;
    source: string;
    category: string | null;
    group: TemplateGroup;
  };
  image: {
    thumbnail: string;
    crop: HTMLCanvasElement | null;
  };
  intent: { id: string; label: string };
  rules: FrameRules;
}

export interface FrameRules {
  maxWords: number;
  maxOptions: number;
  maxSlots: number;
  promptNote: string;
}

export type FrameOption = string | { label: string; text: string };

export interface FrameSlot {
  id: string;
  prompt: string;
  options: FrameOption[];
  defaultIndex?: number;
}

export type FramePart = string | { slot: string };

export interface SentenceFrame {
  parts: FramePart[];
  slots: FrameSlot[];
  end: "." | "?";
}

export interface FrameProvider {
  id: string;
  frame(input: FrameInput, signal: AbortSignal): Promise<SentenceFrame | null>;
}

export type Picks = Record<string, number | null>;

export function optionText(o: FrameOption): string {
  return typeof o === "string" ? o : o.text;
}

export function optionLabel(o: FrameOption): string {
  if (typeof o === "string") return o;
  return o.label;
}

export function initialPicks(frame: SentenceFrame): Picks {
  const picks: Picks = {};
  for (const s of frame.slots) picks[s.id] = s.defaultIndex ?? null;
  return picks;
}

export function isComplete(frame: SentenceFrame, picks: Picks): boolean {
  return frame.slots.every((s) => picks[s.id] !== null && picks[s.id] !== undefined);
}

export function renderFrame(frame: SentenceFrame, picks: Picks, placeholder = "…"): string {
  const slots = new Map(frame.slots.map((s) => [s.id, s]));
  const words = frame.parts.map((p) => {
    if (typeof p === "string") return p;
    const slot = slots.get(p.slot);
    const i = picks[p.slot];
    if (!slot || i === null || i === undefined) return placeholder;
    return optionText(slot.options[i] ?? "");
  });
  let text = words
    .filter((w) => w.trim() !== "")
    .join(" ")
    .replace(/\s+([,.?])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (text === "") return "";
  text = text.charAt(0).toUpperCase() + text.slice(1);
  if (!isComplete(frame, picks)) return text;
  return /[.?]$/.test(text) ? text : `${text}${frame.end}`;
}

export function validateFrame(frame: SentenceFrame, rules: FrameRules): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  if (frame.slots.length === 0) errors.push("a frame needs at least one slot");
  if (frame.slots.length > rules.maxSlots) errors.push(`at most ${rules.maxSlots} slots`);
  if (frame.end !== "." && frame.end !== "?") errors.push('end must be "." or "?"');
  for (const s of frame.slots) {
    if (ids.has(s.id)) errors.push(`duplicate slot id ${s.id}`);
    ids.add(s.id);
    if (s.options.length < 2 || s.options.length > rules.maxOptions) errors.push(`slot ${s.id}: 2 to ${rules.maxOptions} options`);
    if (s.defaultIndex !== undefined && (s.defaultIndex < 0 || s.defaultIndex >= s.options.length)) errors.push(`slot ${s.id}: defaultIndex out of range`);
    const labels = s.options.map(optionLabel);
    if (new Set(labels).size !== labels.length) errors.push(`slot ${s.id}: option labels must be unique`);
    for (const o of s.options) {
      if (/!/.test(optionText(o)) || /!/.test(optionLabel(o))) errors.push(`slot ${s.id}: no exclamation marks`);
      if (optionLabel(o).trim() === "") errors.push(`slot ${s.id}: every option needs a visible label`);
    }
  }
  const used = new Set<string>();
  for (const p of frame.parts) {
    if (typeof p === "string") {
      if (/!/.test(p)) errors.push("no exclamation marks");
      continue;
    }
    if (!ids.has(p.slot)) errors.push(`part refers to unknown slot ${p.slot}`);
    used.add(p.slot);
  }
  for (const id of ids) if (!used.has(id)) errors.push(`slot ${id} is not used in parts`);
  if (errors.length === 0) {
    const longest: Picks = {};
    for (const s of frame.slots) {
      longest[s.id] = s.options.reduce((best, o, j) => (wordCount(optionText(o)) > wordCount(optionText(s.options[best])) ? j : best), 0);
    }
    const text = renderFrame(frame, longest);
    if (wordCount(text) > rules.maxWords) errors.push(`"${text}" has ${wordCount(text)} words; max ${rules.maxWords}`);
  }
  return errors;
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;
}
