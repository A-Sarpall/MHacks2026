import { groupForLabel, type TemplateGroup } from "../../data/profiles";
import {
  optionLabel,
  optionText,
  validateFrame,
  type FrameInput,
  type FrameOption,
  type FramePart,
  type FrameProvider,
  type FrameRules,
  type SentenceFrame,
} from "./frame";

type Intent = "need" | "dont-want" | "help" | "feeling" | "tell" | "question";
type Verbal = Exclude<Intent, "feeling">;
type Kind = "liquid" | "container" | null;

interface SlotSpec {
  id: string;
  prompt: string;
  options: FrameOption[];
  optional?: boolean;
}

const MAX_CHOICES = 6;
const NOTHING: FrameOption = { label: "nothing", text: "" };
const PLEASE: FrameOption = { label: "please", text: ", please" };
const THANKS: FrameOption = { label: "thank you", text: ", thank you" };

const G = <T>(food: T, drinks: T, clothes: T, electronics: T, bathroom: T, health: T, kitchen: T, leisure: T, general: T): Record<TemplateGroup, T> => ({
  food,
  drinks,
  clothes,
  electronics,
  bathroom,
  health,
  kitchen,
  leisure,
  general,
});

const VERBS: Record<Exclude<Verbal, "question">, Record<TemplateGroup, string[]>> = {
  need: G(
    ["want", "need", "would like", "will eat", "want to try", "want more of"],
    ["want", "need", "would like", "will drink", "want more of", "want to try"],
    ["want", "need", "will wear", "would like", "want to change", "need to wash"],
    ["want", "need", "will use", "would like", "need to charge", "want to unlock"],
    ["want", "need", "will use", "would like", "need to find", "want to clean"],
    ["want", "need", "will take", "would like", "need to open", "need more of"],
    ["want", "need", "will use", "would like", "need to wash", "want to borrow"],
    ["want", "need", "will use", "would like", "want to start", "want to try"],
    ["want", "need", "would like", "will use", "need to find", "want to keep"]
  ),
  "dont-want": G(
    ["don't want", "don't like", "won't eat", "am finished with", "can't eat", "want less of"],
    ["don't want", "don't like", "won't drink", "am finished with", "can't drink", "want less of"],
    ["don't want", "don't like", "won't wear", "will take off", "can't wear", "am too hot in"],
    ["don't want", "don't like", "won't use", "will turn off", "am finished with", "can't hear"],
    ["don't want", "don't need", "won't use", "am finished with", "don't like", "can't use"],
    ["don't want", "don't need", "already took", "won't take", "can't swallow", "want to stop"],
    ["don't want", "don't need", "won't use", "am finished with", "don't like", "can't use"],
    ["don't want", "don't like", "won't use", "am finished with", "am bored of", "need to stop"],
    ["don't want", "don't like", "don't need", "am finished with", "can't use", "will put away"]
  ),
  help: G(
    ["cut", "open", "warm up", "pass me", "hold", "put away"],
    ["pour", "open", "pass me", "hold", "warm up", "cool down"],
    ["fasten", "zip up", "fold", "find", "pass me", "wash"],
    ["unlock", "charge", "turn on", "turn off", "fix", "hold"],
    ["pass me", "open", "find", "rinse", "hold", "reach"],
    ["open", "pass me", "check", "count", "sort", "find"],
    ["open", "pass me", "wash", "reach", "hold", "fix"],
    ["start", "pass me", "fix", "set up", "find", "hold"],
    ["pass me", "open", "hold", "find", "fix", "reach"]
  ),
  tell: G(
    ["like", "am eating", "am finished with", "want to show you", "dropped", "found"],
    ["like", "am drinking", "am finished with", "want to show you", "spilled", "found"],
    ["like", "am wearing", "want to show you", "found", "washed", "chose"],
    ["am using", "like", "want to show you", "charged", "turned off", "found"],
    ["am using", "am finished with", "cleaned", "want to show you", "found", "like"],
    ["took", "need", "forgot", "want to show you", "found", "am finished with"],
    ["am using", "cleaned", "am finished with", "want to show you", "found", "like"],
    ["like", "am using", "am finished with", "want to show you", "found", "enjoyed"],
    ["like", "want to show you", "found", "am using", "am finished with", "cleaned"]
  ),
};

const CONTAINER_VERBS: Record<Verbal, string[]> = {
  need: ["want", "need", "would like", "will drink from", "need to fill", "want to wash"],
  "dont-want": ["don't want", "don't like", "am finished with", "won't drink from", "want to put down", "can't hold"],
  help: ["fill", "pass me", "hold", "empty", "wash", "warm up"],
  tell: ["like", "am drinking from", "am finished with", "want to show you", "knocked over", "found"],
  question: ["use", "have", "keep", "fill", "wash", "borrow"],
};

const CONTAINERS = new Set(["cup", "mug", "glass", "bottle", "can", "thermos", "jar", "flask", "tumbler", "jug", "pitcher", "carton", "box"]);

const ASK: Partial<Record<TemplateGroup, string[]>> = {
  food: ["eat", "have", "share", "keep", "finish", "try"],
  drinks: ["drink", "have", "share", "finish", "keep", "try"],
  electronics: ["use", "turn on", "charge", "borrow", "have", "keep"],
  health: ["take", "skip", "open", "have", "stop", "keep"],
  kitchen: ["use", "have", "borrow", "wash", "keep", "take"],
  leisure: ["use", "play with", "try", "borrow", "have", "keep"],
};

const STATES: Partial<Record<TemplateGroup, string[]>> = {
  bathroom: ["mine", "clean", "new", "yours", "dry", "ready"],
  clothes: ["mine", "clean", "dry", "warm enough", "too small", "ready"],
  general: ["mine", "yours", "new", "clean", "safe", "ready"],
};

const FEELINGS = G(
  ["hungry", "full", "sick", "okay", "tired", "anxious"],
  ["thirsty", "sick", "okay", "tired", "calm", "anxious"],
  ["too hot", "too cold", "itchy", "uncomfortable", "okay", "anxious"],
  ["overwhelmed", "tired", "bored", "anxious", "calm", "okay"],
  ["unwell", "tired", "uncomfortable", "okay", "anxious", "calm"],
  ["hurt", "sick", "dizzy", "tired", "okay", "anxious"],
  ["hungry", "thirsty", "tired", "okay", "anxious", "calm"],
  ["happy", "bored", "tired", "calm", "excited", "okay"],
  ["tired", "calm", "anxious", "uncomfortable", "overwhelmed", "okay"]
);

const NEED_EXTRA = G("with lunch", "with ice", "tomorrow", "for music", "first", "with water", "for dinner", "with you", "again");
const DONT_WANT_DETAILS: FrameOption[] = ["now", PLEASE, "anymore", "today", THANKS];
const HELP_DETAILS: FrameOption[] = [PLEASE, "now", "later", "again", "first"];
const TELL_DETAILS: FrameOption[] = ["now", "today", "already", "again", "too"];
const WHEN: FrameOption[] = ["now", "later", "today", "tonight", "tomorrow"];
const STATE_TAIL: FrameOption[] = ["now", "today", "yet"];
const FEELING_TIMES: FrameOption[] = ["right now", "today", "since this morning", "all day"];

const SEATS: Partial<Record<Verbal, string[]>> = {
  need: ["want", "need", "want to sit on", "would like", "will use", "want to move"],
  help: ["move", "bring me", "fix", "hold", "push", "lift"],
  question: ["sit on", "move", "use", "have", "keep", "borrow"],
};

const PHONE: Partial<Record<Verbal, string[]>> = {
  need: ["want", "need", "need to charge", "would like", "want to unlock", "will use"],
  "dont-want": ["don't want", "don't like", "will turn off", "am finished with", "won't use", "can't hear"],
  help: ["unlock", "charge", "silence", "turn off", "fix", "hold"],
  tell: ["am using", "charged", "want to show you", "dropped", "found", "like"],
  question: ["use", "charge", "borrow", "unlock", "have", "keep"],
};

const COMPUTER: Partial<Record<Verbal, string[]>> = {
  need: ["want", "need", "would like", "will use", "need to charge", "want to open"],
  "dont-want": ["don't want", "don't like", "won't use", "will turn off", "am finished with", "need a break from"],
  help: ["turn on", "unlock", "fix", "restart", "charge", "open"],
  tell: ["am using", "turned off", "want to show you", "fixed", "am finished with", "like"],
  question: ["use", "turn on", "borrow", "restart", "have", "keep"],
};

const BOTTLE: Partial<Record<Verbal, string[]>> = {
  need: ["want", "need", "would like", "will drink from", "need to fill", "want to open"],
  "dont-want": ["don't want", "don't like", "am finished with", "won't drink from", "can't open", "want to put down"],
  help: ["open", "fill", "pass me", "hold", "close", "empty"],
  tell: ["like", "am drinking from", "am finished with", "filled", "want to show you", "found"],
  question: ["use", "have", "fill", "open", "keep", "borrow"],
};

const PEN: Partial<Record<Verbal, string[]>> = {
  need: ["want", "need", "would like", "will use", "need to find", "want to borrow"],
  help: ["pass me", "find", "hold", "bring me", "open", "fix"],
  tell: ["am using", "found", "lost", "want to show you", "like", "am finished with"],
  question: ["use", "borrow", "have", "keep", "try", "take"],
};

const OVERRIDES: Record<string, Partial<Record<Verbal, string[]>>> = {
  chair: SEATS,
  armchair: SEATS,
  stool: SEATS,
  sofa: SEATS,
  couch: SEATS,
  bench: SEATS,
  wheelchair: SEATS,
  bed: {
    need: ["want", "need", "want to lie on", "would like", "will use", "want to make"],
    help: ["make", "fix", "move", "lift", "clean", "check"],
    question: ["lie on", "use", "make", "have", "move", "keep"],
  },
  table: {
    need: ["want", "need", "want to sit at", "would like", "will use", "want to clear"],
    help: ["clear", "move", "wipe", "set", "fix", "clean"],
    question: ["sit at", "use", "clear", "move", "have", "keep"],
  },
  desk: {
    need: ["want", "need", "want to sit at", "would like", "will use", "want to clear"],
    help: ["clear", "move", "wipe", "fix", "clean", "check"],
    question: ["sit at", "use", "clear", "move", "have", "keep"],
  },
  keys: {
    need: ["need", "want", "need to find", "would like", "will take", "want to keep"],
    help: ["find", "pass me", "hold", "reach", "bring me", "check"],
    tell: ["found", "have", "lost", "want to show you", "like", "am finished with"],
  },
  book: {
    need: ["want", "need", "want to read", "would like", "will read", "want to borrow"],
    help: ["pass me", "open", "hold", "find", "read me", "close"],
    tell: ["like", "am reading", "finished", "want to show you", "found", "enjoyed"],
    question: ["read", "borrow", "keep", "have", "open", "finish"],
  },
  glasses: {
    need: ["need", "want", "need to clean", "would like", "will wear", "need to find"],
    help: ["pass me", "clean", "find", "hold", "fix", "reach"],
    tell: ["am wearing", "cleaned", "found", "lost", "want to show you", "like"],
  },
  remote: {
    need: ["want", "need", "would like", "will use", "need to find", "want to hold"],
    help: ["pass me", "find", "fix", "hold", "reach", "check"],
  },
  toothbrush: {
    need: ["need", "want", "will use", "would like", "need to rinse", "need to find"],
    help: ["pass me", "find", "rinse", "hold", "reach", "replace"],
    tell: ["am using", "am finished with", "rinsed", "want to show you", "found", "like"],
  },
  phone: PHONE,
  iphone: PHONE,
  smartphone: PHONE,
  cellphone: PHONE,
  computer: COMPUTER,
  laptop: COMPUTER,
  macbook: COMPUTER,
  pc: COMPUTER,
  "water bottle": BOTTLE,
  pen: PEN,
  pencil: PEN,
  marker: PEN,
  shoes: {
    need: ["want", "need", "will wear", "would like", "need to tie", "want to put on"],
    help: ["tie", "find", "pass me", "clean", "hold", "fasten"],
  },
};

const GROUP_HINTS: Record<string, TemplateGroup> = {
  iphone: "electronics",
  smartphone: "electronics",
  cellphone: "electronics",
  computer: "electronics",
  laptop: "electronics",
  macbook: "electronics",
  pc: "electronics",
  ipad: "electronics",
  monitor: "electronics",
  keyboard: "electronics",
};

const PEOPLE = new Set(["person", "man", "woman", "child", "boy", "girl", "baby", "friend", "nurse", "doctor", "teacher", "caregiver", "mom", "dad", "mother", "father", "sister", "brother", "partner", "people", "someone"]);

const INTENTS = new Set<string>(["need", "dont-want", "help", "feeling", "tell", "question"]);
const DETERMINED = /^(my|your|his|her|their|our|this|that|these|those|the|a|an|some)\s/i;
const POSSESSIVE = /\w['’]s\b/;

function words(text: string): number {
  return text.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;
}

function lastWord(label: string): string {
  const parts = label.toLowerCase().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

function isPlural(label: string): boolean {
  const w = lastWord(label);
  return w.endsWith("s") && !/(ss|us|is|glass|dress|lens|gas)$/.test(w);
}

function hasDeterminer(label: string): boolean {
  return DETERMINED.test(label) || POSSESSIVE.test(label);
}

function objectPhrase(label: string, group: TemplateGroup): string {
  if (hasDeterminer(label)) return label;
  return `${group === "health" ? "my" : "the"} ${label}`;
}

function pointed(label: string): string {
  if (hasDeterminer(label)) return label;
  return `${isPlural(label) ? "these" : "this"} ${label}`;
}

function resolveGroup(input: FrameInput): { group: TemplateGroup; base: string } {
  const label = input.object.label.trim();
  if (input.object.group !== "general" || input.object.category !== null) return { group: input.object.group, base: label };
  const hint = GROUP_HINTS[label.toLowerCase()] ?? GROUP_HINTS[lastWord(label)];
  if (hint) return { group: hint, base: label };
  for (const alt of input.object.alternatives) {
    const group = groupForLabel(alt);
    if (group !== "general") return { group, base: alt.trim() };
  }
  return { group: "general", base: label };
}

function kindOf(group: TemplateGroup, base: string, label: string): Kind {
  if (group !== "drinks") return null;
  return CONTAINERS.has(lastWord(base)) || CONTAINERS.has(lastWord(label)) ? "container" : "liquid";
}

function overrideFor(label: string, base: string): Partial<Record<Verbal, string[]>> | undefined {
  return OVERRIDES[label.toLowerCase()] ?? OVERRIDES[lastWord(label)] ?? OVERRIDES[base.toLowerCase()] ?? OVERRIDES[lastWord(base)];
}

function feelingContext(label: string, group: TemplateGroup, kind: Kind): string {
  const it = pointed(label);
  switch (group) {
    case "food":
      return `after eating ${it}`;
    case "drinks":
      return kind === "container" ? `holding ${it}` : `after drinking ${it}`;
    case "clothes":
      return `wearing ${it}`;
    case "electronics":
    case "kitchen":
      return `using ${it}`;
    case "bathroom":
      return "in the bathroom";
    case "health":
      return `after taking ${objectPhrase(label, "health")}`;
    case "leisure":
      return `with ${it}`;
    default: {
      const w = lastWord(label);
      if (["chair", "armchair", "wheelchair", "bed"].includes(w)) return `in ${it}`;
      if (["sofa", "couch", "bench", "stool"].includes(w)) return `on ${it}`;
      if (["table", "desk"].includes(w)) return `at ${it}`;
      return `near ${it}`;
    }
  }
}

function dedupe(options: FrameOption[]): FrameOption[] {
  const seen = new Set<string>();
  return options.filter((o) => {
    const key = optionLabel(o).trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function build(parts: FramePart[], specs: SlotSpec[], end: "." | "?", rules: FrameRules): SentenceFrame | null {
  const kept = specs.slice(0, Math.max(1, rules.maxSlots));
  const ids = new Set(kept.map((s) => s.id));
  const shape = parts.filter((p) => typeof p === "string" || ids.has(p.slot));
  const limit = Math.max(2, Math.min(MAX_CHOICES, rules.maxOptions));
  const fixed = words(shape.filter((p): p is string => typeof p === "string").join(" "));
  const slots = kept.map((s) => {
    const pool = dedupe(s.options).filter((o) => optionText(o) !== "");
    const chosen = pool.slice(0, s.optional ? limit - 1 : limit);
    const rest = pool.slice(chosen.length);
    if (s.optional) chosen.push(NOTHING);
    return { ...s, chosen, rest };
  });
  const maxOf = (opts: FrameOption[]) => opts.reduce((m, o) => Math.max(m, words(optionText(o))), 0);
  const total = () => fixed + slots.reduce((n, s) => n + maxOf(s.chosen), 0);
  while (total() > rules.maxWords) {
    let victim = -1;
    let cost = Infinity;
    slots.forEach((s, i) => {
      if (s.chosen.length <= 2) return;
      const m = maxOf(s.chosen);
      if (m === 0) return;
      const count = s.chosen.filter((o) => words(optionText(o)) === m).length;
      if (count <= cost) {
        victim = i;
        cost = count;
      }
    });
    if (victim < 0) return null;
    const s = slots[victim];
    const m = maxOf(s.chosen);
    let at = -1;
    s.chosen.forEach((o, j) => {
      if (words(optionText(o)) === m) at = j;
    });
    s.chosen.splice(at, 1);
  }
  for (const s of slots) {
    const others = slots.filter((o) => o !== s).reduce((n, o) => n + maxOf(o.chosen), 0);
    const room = rules.maxWords - fixed - others;
    while (s.chosen.length < limit && s.rest.length > 0) {
      const k = s.rest.findIndex((o) => words(optionText(o)) <= room);
      if (k < 0) break;
      const [o] = s.rest.splice(k, 1);
      s.chosen.splice(s.optional ? s.chosen.length - 1 : s.chosen.length, 0, o);
    }
  }
  const frame: SentenceFrame = {
    parts: shape,
    slots: slots.map((s) => ({
      id: s.id,
      prompt: s.prompt,
      options: s.chosen,
      ...(s.optional ? { defaultIndex: s.chosen.length - 1 } : {}),
    })),
    end,
  };
  return validateFrame(frame, rules).length === 0 ? frame : null;
}

function isPerson(label: string): boolean {
  return PEOPLE.has(label.toLowerCase()) || PEOPLE.has(lastWord(label));
}

function personFrame(intent: Intent, rules: FrameRules): SentenceFrame | null {
  const action = (options: string[]) => ({ id: "action", prompt: "Pick an action", options });
  const detail = (options: FrameOption[]) => ({ id: "detail", prompt: "Add a detail", options, optional: true });
  switch (intent) {
    case "need":
      return build(["I need you to", { slot: "action" }, { slot: "detail" }], [action(["wait", "listen", "help me", "slow down", "stay", "come here"]), detail([PLEASE, "now", "later", "today"])], ".", rules);
    case "dont-want":
      return build(["I don't want you to", { slot: "action" }, { slot: "detail" }], [action(["talk", "leave", "touch me", "rush me", "ask questions", "help"]), detail([PLEASE, "now", "yet", "today"])], ".", rules);
    case "help":
      return build(["Can you", { slot: "action" }, { slot: "detail" }], [action(["help me", "wait", "come here", "stay with me", "write it down", "text me"]), detail([PLEASE, "now", "later", "again", "for a minute"])], "?", rules);
    case "tell":
      return build(["I", { slot: "action" }, { slot: "detail" }], [action(["am okay", "am tired", "like you", "am listening", "need a minute", "am finished"]), detail(["now", "today", "too", "already", THANKS])], ".", rules);
    case "question":
      return build(["Are you", { slot: "state" }, { slot: "detail" }], [{ id: "state", prompt: "Pick a word", options: ["okay", "busy", "leaving", "staying", "finished", "coming"] }, detail(["now", "today", "yet", "with me"])], "?", rules);
    case "feeling":
      return build(
        ["I feel", { slot: "feeling" }, { slot: "context" }],
        [
          { id: "feeling", prompt: "Pick a feeling", options: ["nervous", "calm", "safe", "tired", "overwhelmed", "okay"] },
          { id: "context", prompt: "Add when or where", options: ["with you", "right now", "around people", "today", "all day"], optional: true },
        ],
        ".",
        rules
      );
  }
}

export function lexiconFrame(input: FrameInput): SentenceFrame | null {
  const label = input.object.label.trim();
  if (!label || !INTENTS.has(input.intent.id)) return null;
  const intent = input.intent.id as Intent;
  if (isPerson(label)) return personFrame(intent, input.rules);
  const { group, base } = resolveGroup(input);
  const kind = kindOf(group, base, label);
  const obj = objectPhrase(label, group);
  const over = overrideFor(label, base);
  const verbs = (i: Exclude<Verbal, "question">) => over?.[i] ?? (kind === "container" ? CONTAINER_VERBS[i] : VERBS[i][group]);
  const action = (i: Exclude<Verbal, "question">) => ({ id: "action", prompt: "Pick an action", options: verbs(i) });
  const detail = (options: FrameOption[]) => ({ id: "detail", prompt: "Add a detail", options, optional: true });
  switch (intent) {
    case "need":
      return build(["I", { slot: "action" }, obj, { slot: "detail" }], [action("need"), detail(["now", PLEASE, "later", "today", kind === "container" ? "with coffee" : NEED_EXTRA[group]])], ".", input.rules);
    case "dont-want":
      return build(["I", { slot: "action" }, obj, { slot: "detail" }], [action("dont-want"), detail(DONT_WANT_DETAILS)], ".", input.rules);
    case "help":
      return build(["Can you", { slot: "action" }, obj, { slot: "detail" }], [action("help"), detail(HELP_DETAILS)], "?", input.rules);
    case "tell":
      return build(["I", { slot: "action" }, obj, { slot: "detail" }], [action("tell"), detail(TELL_DETAILS)], ".", input.rules);
    case "question": {
      const ask = over?.question ?? (kind === "container" ? CONTAINER_VERBS.question : ASK[group]);
      if (ask) return build(["Can I", { slot: "action" }, obj, { slot: "detail" }], [{ id: "action", prompt: "Pick an action", options: ask }, detail(WHEN)], "?", input.rules);
      const copula = isPlural(label) ? "Are" : "Is";
      return build([`${copula} ${obj}`, { slot: "state" }, { slot: "detail" }], [{ id: "state", prompt: "Pick a word", options: STATES[group] ?? STATES.general! }, detail(STATE_TAIL)], "?", input.rules);
    }
    case "feeling":
      return build(
        ["I feel", { slot: "feeling" }, { slot: "context" }],
        [
          { id: "feeling", prompt: "Pick a feeling", options: FEELINGS[group] },
          { id: "context", prompt: "Add when or where", options: [feelingContext(label, group, kind), ...FEELING_TIMES], optional: true },
        ],
        ".",
        input.rules
      );
  }
}

export async function modelFrame(input: FrameInput, signal: AbortSignal): Promise<SentenceFrame | null> {
  if (signal.aborted) return null;
  return lexiconFrame(input);
}

export const modelFrameProvider: FrameProvider = {
  id: "model",
  frame: modelFrame,
};
