import { describe, expect, it } from "vitest";
import { composeMock } from "./compose";
import { buildSentence, profilePrompt, profileSentences, profileVerbs } from "./profileCompose";

describe("profile sentences", () => {
  it("fills the templates for the intent and the object's group", () => {
    const mug = profileSentences({ tiles: ["mug"], intent: "need" })!;
    expect(mug.slice(0, 3)).toEqual(["I want something to drink.", "I would like the mug.", "Can I have the mug, please?"]);
    expect(mug).toHaveLength(6);
    expect(new Set(mug).size).toBe(6);
    expect(profileSentences({ tiles: ["shirt"], intent: "dont-want" })?.[0]).toBe("This feels itchy.");
    expect(profileSentences({ tiles: ["phone"], intent: "help" })?.[0]).toBe("It's not working.");
    expect(profileSentences({ tiles: ["Mom's mug"], intent: "need" })?.slice(0, 3)).toEqual([
      "I need the Mom's mug.",
      "Can I have the Mom's mug, please?",
      "I want the Mom's mug now.",
    ]);
  });

  it("gives feelings without an object and nothing for other intents without one", () => {
    expect(profileSentences({ tiles: [], intent: "feeling" })).toEqual(["I'm tired.", "I'm hurt.", "I'm hungry.", "I'm too hot.", "I'm too cold.", "I'm scared."]);
    expect(profileSentences({ tiles: ["shirt"], intent: "feeling" })?.slice(0, 3)).toEqual(["I'm too hot.", "I'm too cold.", "This feels itchy."]);
    expect(profileSentences({ tiles: [], intent: "need" })).toEqual(["I need something.", "I need help with something.", "Can you come here, please?"]);
    expect(profileSentences({ tiles: [], intent: "question" })).toHaveLength(3);
  });

  it("leaves the old core words alone", () => {
    expect(profileSentences({ tiles: ["mug"], intent: "want" })).toBeNull();
    expect(composeMock({ tiles: ["mug"], coreWords: ["want"] })[0]).toBe("Can I have a mug?");
    expect(composeMock({ tiles: ["mug"], coreWords: ["need"] })[0]).toBe("I want something to drink.");
  });

  it("builds a sentence from a verb, the object and an ending", () => {
    expect(profileVerbs("need", ["mug"])).toEqual(["want", "need", "would like", "will drink"]);
    expect(profileVerbs("feeling", ["mug"])).toEqual([]);
    expect(buildSentence("want", "mug", "now")).toBe("I want the mug now.");
    expect(buildSentence("would like", "mug", "please")).toBe("I would like the mug, please.");
    expect(buildSentence("don't want", "mug", "later")).toBe("I don't want the mug later.");
    expect(buildSentence("need", "mug", "none")).toBe("I need the mug.");
  });

  it("asks Claude for three literal sentences with the profile's note", () => {
    const p = profilePrompt({ tiles: ["mug"], intent: "need" })!;
    expect(p.system).toContain("neurodivergent adult");
    expect(p.system).toContain("exactly 3");
    expect(p.system).toContain("8 words or fewer");
    expect(p.system).toContain("very short and direct");
    expect(p.user).toBe("Intent: I need (need)\nObject: mug\nObject category: drinks");
    expect(profilePrompt({ tiles: ["mug"], intent: "want" })).toBeNull();
  });
});
