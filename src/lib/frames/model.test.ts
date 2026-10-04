import { describe, expect, it } from "vitest";
import { ACTIVE_PROFILE, type TemplateGroup } from "../../data/profiles";
import { FRAME_FIXTURES, TEST_RULES } from "./fixtures";
import { initialPicks, optionLabel, renderFrame, validateFrame, type FrameInput, type FrameRules, type Picks, type SentenceFrame } from "./frame";
import { lexiconFrame, modelFrame } from "./model";

const WIDE: FrameRules = { ...TEST_RULES, maxOptions: 6 };
const GROUPS: TemplateGroup[] = ["food", "drinks", "clothes", "electronics", "bathroom", "health", "kitchen", "leisure", "general"];
const INTENTS = ACTIVE_PROFILE.intents.map((i) => ({ id: i.id, label: i.label }));
const SAMPLE: Record<TemplateGroup, string[]> = {
  food: ["banana", "peanut butter"],
  drinks: ["mug", "water", "water bottle"],
  clothes: ["shirt", "rain jacket"],
  electronics: ["phone", "phone charger"],
  bathroom: ["toothbrush", "toilet paper"],
  health: ["pills", "pill bottle"],
  kitchen: ["spoon", "cutting board"],
  leisure: ["ball", "board game"],
  general: ["chair", "coffee table", "keys", "book"],
};

function intent(id: string): { id: string; label: string } {
  return INTENTS.find((i) => i.id === id) ?? { id, label: id };
}

function make(label: string, group: TemplateGroup, intentId: string, rules: FrameRules = WIDE, alternatives: string[] = [], category: string | null = "test"): FrameInput {
  return {
    captureId: `t-${label}-${intentId}`,
    object: { label, alternatives, confidence: 0.7, source: "vocab", category, group },
    image: { thumbnail: "", crop: null },
    intent: intent(intentId),
    rules,
  };
}

function valid(frame: SentenceFrame | null, rules: FrameRules, what: string): SentenceFrame {
  expect(frame, what).not.toBeNull();
  expect(validateFrame(frame!, rules), what).toEqual([]);
  expect(renderFrame(frame!, initialPicks(frame!)).length, what).toBeGreaterThan(0);
  return frame!;
}

function labels(frame: SentenceFrame, id: string): string[] {
  const slot = frame.slots.find((s) => s.id === id);
  expect(slot, id).toBeDefined();
  return slot!.options.map(optionLabel);
}

function say(frame: SentenceFrame, choose: Record<string, string>): string {
  const picks: Picks = {};
  for (const s of frame.slots) {
    const want = choose[s.id];
    const i = want === undefined ? (s.defaultIndex ?? 0) : s.options.findIndex((o) => optionLabel(o) === want);
    expect(i, `${s.id}: ${want}`).toBeGreaterThanOrEqual(0);
    picks[s.id] = i;
  }
  return renderFrame(frame, picks);
}

describe("lexicon frames", () => {
  it("fills every fixture, with four choices today and four to six when allowed", () => {
    for (const fx of FRAME_FIXTURES) {
      for (const rules of [TEST_RULES, WIDE]) {
        const what = `${fx.captureId} ${fx.object.label}/${fx.intent.id} max ${rules.maxOptions}`;
        const f = valid(lexiconFrame({ ...fx, rules }), rules, what);
        for (const s of f.slots) {
          if (rules.maxOptions === 4) expect(s.options.length, `${what} ${s.id}`).toBe(4);
          else {
            expect(s.options.length, `${what} ${s.id}`).toBeGreaterThanOrEqual(4);
            expect(s.options.length, `${what} ${s.id}`).toBeLessThanOrEqual(6);
          }
        }
      }
    }
  });

  it("covers every intent for every group and label shape", () => {
    for (const group of GROUPS) {
      for (const label of SAMPLE[group]) {
        for (const i of INTENTS) {
          for (const rules of [TEST_RULES, WIDE]) {
            const what = `${label}/${i.id} max ${rules.maxOptions}`;
            const f = valid(lexiconFrame(make(label, group, i.id, rules)), rules, what);
            expect(f.slots.length, what).toBeGreaterThanOrEqual(2);
            if (!label.includes(" ")) for (const s of f.slots) expect(s.options.length, `${what} ${s.id}`).toBeGreaterThanOrEqual(4);
          }
        }
      }
    }
  });

  it("keeps the longest sentence within the limit for long labels, or gives up cleanly", () => {
    valid(lexiconFrame(make("peanut butter jar", "food", "need")), WIDE, "3-word label");
    valid(lexiconFrame(make("electric toothbrush charger", "bathroom", "help")), WIDE, "3-word help");
    const absurd = lexiconFrame(make("big blue ceramic coffee mug", "drinks", "need"));
    if (absurd) expect(validateFrame(absurd, WIDE)).toEqual([]);
  });

  it("uses the vision alternatives to pick the word group for personal names", () => {
    const need = valid(lexiconFrame(make("Mom's mug", "general", "need", WIDE, ["mug", "cup"], null)), WIDE, "Mom's mug need");
    expect(labels(need, "action")).toContain("will drink from");
    expect(say(need, { action: "want" })).toBe("I want Mom's mug.");
    expect(say(need, { action: "need to fill", detail: "with coffee" })).toBe("I need to fill Mom's mug with coffee.");
    const feel = valid(lexiconFrame(make("Mom's mug", "general", "feeling", WIDE, ["mug"], null)), WIDE, "Mom's mug feeling");
    expect(labels(feel, "context")).toContain("holding Mom's mug");
  });

  it("says my for medicine and handles plurals", () => {
    const pills = valid(lexiconFrame(make("pills", "health", "need")), WIDE, "pills");
    expect(say(pills, { action: "want" })).toBe("I want my pills.");
    expect(say(pills, { action: "will take", detail: "with water" })).toBe("I will take my pills with water.");
    const keys = valid(lexiconFrame(make("keys", "general", "question", WIDE, [], "personal items")), WIDE, "keys");
    expect(keys.parts[0]).toBe("Are the keys");
    expect(say(keys, { state: "mine" })).toBe("Are the keys mine?");
    const brush = valid(lexiconFrame(make("toothbrush", "bathroom", "question")), WIDE, "toothbrush");
    expect(say(brush, { state: "clean", detail: "yet" })).toBe("Is the toothbrush clean yet?");
  });

  it("tells liquids from containers", () => {
    const water = valid(lexiconFrame(make("water", "drinks", "need")), WIDE, "water");
    expect(labels(water, "action")).toContain("will drink");
    expect(labels(water, "action")).not.toContain("will drink from");
    expect(labels(valid(lexiconFrame(make("mug", "drinks", "help")), WIDE, "mug help"), "action")).toContain("fill");
    expect(labels(valid(lexiconFrame(make("water", "drinks", "help")), WIDE, "water help"), "action")).toContain("pour");
    expect(labels(valid(lexiconFrame(make("water bottle", "drinks", "need")), WIDE, "bottle"), "action")).toContain("need to fill");
  });

  it("builds requests and questions that end with a question mark", () => {
    const help = valid(lexiconFrame(make("mug", "drinks", "help")), WIDE, "help");
    expect(help.end).toBe("?");
    expect(say(help, { action: "fill", detail: "please" })).toBe("Can you fill the mug, please?");
    const ask = valid(lexiconFrame(make("banana", "food", "question")), WIDE, "question");
    expect(say(ask, { action: "eat", detail: "now" })).toBe("Can I eat the banana now?");
    expect(say(ask, { action: "share" })).toBe("Can I share the banana?");
  });

  it("offers feelings with the object as context", () => {
    const chair = valid(lexiconFrame(make("chair", "general", "feeling", WIDE, [], "furniture & home")), WIDE, "chair");
    expect(say(chair, { feeling: "tired", context: "in this chair" })).toBe("I feel tired in this chair.");
    expect(say(chair, { feeling: "okay" })).toBe("I feel okay.");
    expect(labels(valid(lexiconFrame(make("banana", "food", "feeling")), WIDE, "banana"), "context")).toContain("after eating this banana");
    expect(labels(valid(lexiconFrame(make("shirt", "clothes", "feeling")), WIDE, "shirt"), "context")).toContain("wearing this shirt");
    expect(labels(valid(lexiconFrame(make("coffee table", "general", "feeling")), WIDE, "table"), "context")).toContain("at this coffee table");
    expect(labels(valid(lexiconFrame(make("pills", "health", "feeling")), WIDE, "pills"), "context")).toContain("after taking my pills");
  });

  it("applies object-specific actions", () => {
    const book = valid(lexiconFrame(make("book", "general", "help", WIDE, [], "office & reading")), WIDE, "book");
    expect(say(book, { action: "read me", detail: "please" })).toBe("Can you read me the book, please?");
    expect(labels(valid(lexiconFrame(make("chair", "general", "need")), WIDE, "chair"), "action")).toContain("want to sit on");
    expect(labels(valid(lexiconFrame(make("phone", "electronics", "tell")), WIDE, "phone"), "action")).toContain("charged");
    expect(labels(valid(lexiconFrame(make("Mom's chair", "general", "help", WIDE, [], null)), WIDE, "Mom's chair"), "action")).toContain("bring me");
  });

  it("returns null for unknown intents or empty labels", () => {
    expect(lexiconFrame(make("mug", "drinks", "sing"))).toBeNull();
    expect(lexiconFrame(make("   ", "drinks", "need"))).toBeNull();
  });

  it("is deterministic and plain JSON", () => {
    const a = lexiconFrame(FRAME_FIXTURES[0]);
    const b = lexiconFrame(FRAME_FIXTURES[0]);
    expect(a).toEqual(b);
    expect(JSON.parse(JSON.stringify(a))).toEqual(a);
  });

  it("respects smaller limits", () => {
    const tiny: FrameRules = { ...TEST_RULES, maxOptions: 2, maxSlots: 1 };
    const f = valid(lexiconFrame(make("mug", "drinks", "need", tiny)), tiny, "tiny");
    expect(f.slots.length).toBe(1);
    expect(f.slots[0].options.length).toBe(2);
    const three: FrameRules = { ...TEST_RULES, maxOptions: 3 };
    for (const s of valid(lexiconFrame(make("mug", "drinks", "need", three)), three, "three").slots) expect(s.options.length).toBe(3);
  });

  it("the provider returns the same frame, and nothing once aborted", async () => {
    const fx = FRAME_FIXTURES[0];
    expect(await modelFrame(fx, new AbortController().signal)).toEqual(lexiconFrame(fx));
    const c = new AbortController();
    c.abort();
    expect(await modelFrame(fx, c.signal)).toBeNull();
  });
});
