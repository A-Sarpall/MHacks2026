import { describe, expect, it } from "vitest";
import { buildSentence } from "../profileCompose";
import { FRAME_FIXTURES, TEST_RULES } from "./fixtures";
import { initialPicks, isComplete, renderFrame, validateFrame, type FrameProvider, type SentenceFrame } from "./frame";
import { modelFrameProvider } from "./model";
import { profileFrame } from "./profileFrames";
import { resolveFrame } from "./resolve";

const frame: SentenceFrame = {
  parts: ["I", { slot: "verb" }, "the mug", { slot: "ending" }],
  slots: [
    { id: "verb", prompt: "Pick a word", options: ["want", "need", "would like", "will drink"] },
    { id: "ending", prompt: "Add at the end", options: ["now", { label: "please", text: ", please" }, "later", { label: "nothing", text: "" }], defaultIndex: 3 },
  ],
  end: ".",
};

describe("sentence frames", () => {
  it("renders a partial frame with placeholders and a complete one with punctuation", () => {
    const picks = initialPicks(frame);
    expect(picks).toEqual({ verb: null, ending: 3 });
    expect(isComplete(frame, picks)).toBe(false);
    expect(renderFrame(frame, picks)).toBe("I … the mug");
    expect(renderFrame(frame, { verb: 2, ending: 3 })).toBe("I would like the mug.");
    expect(renderFrame(frame, { verb: 0, ending: 1 })).toBe("I want the mug, please.");
    expect(renderFrame({ ...frame, end: "?" }, { verb: 0, ending: 0 })).toBe("I want the mug now?");
  });

  it("accepts a well-formed frame and explains what is wrong with a bad one", () => {
    expect(validateFrame(frame, TEST_RULES)).toEqual([]);
    const bad: SentenceFrame = {
      parts: ["I", { slot: "verb" }, "the mug!", { slot: "nope" }],
      slots: [
        { id: "verb", prompt: "Pick", options: ["want"] },
        { id: "spare", prompt: "Pick", options: ["a", "a", "b", "c", "d"], defaultIndex: 9 },
      ],
      end: ".",
    };
    const errors = validateFrame(bad, TEST_RULES).join(" | ");
    expect(errors).toMatch(/slot verb: 2 to 4 options/);
    expect(errors).toMatch(/slot spare: 2 to 4 options/);
    expect(errors).toMatch(/defaultIndex out of range/);
    expect(errors).toMatch(/labels must be unique/);
    expect(errors).toMatch(/no exclamation marks/);
    expect(errors).toMatch(/unknown slot nope/);
    expect(errors).toMatch(/slot spare is not used/);
  });

  it("rejects frames whose longest sentence is over the word limit", () => {
    const long: SentenceFrame = {
      parts: ["I would really like to have", { slot: "x" }, "right now"],
      slots: [{ id: "x", prompt: "Pick", options: ["the big blue mug", "it"] }],
      end: ".",
    };
    expect(validateFrame(long, TEST_RULES).join()).toMatch(/max 8/);
  });

  it("the default provider says exactly what the old builder said", () => {
    const f = profileFrame(FRAME_FIXTURES[0])!;
    expect(validateFrame(f, TEST_RULES)).toEqual([]);
    const verbs = f.slots[0].options as string[];
    const endings = ["now", "please", "later", "none"] as const;
    for (let v = 0; v < verbs.length; v++) {
      for (let e = 0; e < endings.length; e++) {
        expect(renderFrame(f, { verb: v, ending: e })).toBe(buildSentence(verbs[v], "mug", endings[e]));
      }
    }
  });

  it("the default provider covers every fixture except feelings", () => {
    for (const fx of FRAME_FIXTURES) {
      const f = profileFrame(fx);
      if (fx.intent.id === "feeling") expect(f).toBeNull();
      else expect(validateFrame(f!, fx.rules), fx.captureId).toEqual([]);
    }
  });
});

describe("resolving a frame", () => {
  const good: FrameProvider = { id: "good", frame: async () => frame };
  const empty: FrameProvider = { id: "empty", frame: async () => null };
  const broken: FrameProvider = { id: "broken", frame: async () => ({ ...frame, slots: [] }) };
  const throws: FrameProvider = {
    id: "throws",
    frame: async () => {
      throw new Error("boom");
    },
  };
  const slow: FrameProvider = { id: "slow", frame: () => new Promise((r) => setTimeout(() => r(frame), 200)) };
  const run = (providers: FrameProvider[], timeoutMs = 1000) => {
    const rejects: string[] = [];
    return resolveFrame(FRAME_FIXTURES[0], providers, new AbortController().signal, { timeoutMs, onReject: (p, r) => rejects.push(`${p}: ${r}`) }).then((r) => ({ r, rejects }));
  };

  it("uses the first provider that returns a valid frame", async () => {
    const { r } = await run([good, empty]);
    expect(r?.provider).toBe("good");
  });

  it("falls back past empty, invalid, throwing and slow providers", async () => {
    const { r, rejects } = await run([empty, broken, throws, slow, good], 50);
    expect(r?.provider).toBe("good");
    expect(rejects.map((x) => x.split(":")[0])).toEqual(["broken", "throws", "slow"]);
  });

  it("returns nothing when no provider can help, or when aborted", async () => {
    expect((await run([empty])).r).toBeNull();
    const c = new AbortController();
    c.abort();
    expect(await resolveFrame(FRAME_FIXTURES[0], [good], c.signal, { timeoutMs: 1000 })).toBeNull();
  });
});

describe("the model provider contract", () => {
  it("returns a valid frame or null for every fixture", async () => {
    for (const fx of FRAME_FIXTURES) {
      const f = await modelFrameProvider.frame(fx, new AbortController().signal);
      if (f === null) continue;
      expect(validateFrame(f, fx.rules), `${fx.captureId} ${fx.object.label}/${fx.intent.id}`).toEqual([]);
      expect(renderFrame(f, initialPicks(f)).length, fx.captureId).toBeGreaterThan(0);
    }
  });
});
