import { describe, expect, it } from "vitest";
import { ACTIVE_PROFILE, groupForLabel, isProfileIntent } from "./index";
import type { TemplateGroup } from "./types";

const GROUPS: TemplateGroup[] = ["food", "drinks", "clothes", "electronics", "bathroom", "health", "kitchen", "leisure", "general"];
const words = (s: string) => s.replace("{object}", "cup").trim().split(/\s+/).length;

describe("neurodivergent profile", () => {
  const p = ACTIVE_PROFILE;

  it("has the required quick phrases with their actions", () => {
    expect(p.quickPhrases.map((q) => q.text)).toEqual([
      "I need a break",
      "It's too loud",
      "Stop",
      "Please wait",
      "I can't talk right now",
      "I'm okay",
      "I'm in pain",
    ]);
    expect(p.quickPhrases.find((q) => q.text === "I'm in pain")?.action).toBe("pain");
    expect(p.quickPhrases.find((q) => q.text === "I can't talk right now")?.action).toBe("status");
  });

  it("has six intents in a fixed order, and only feeling works without an object", () => {
    expect(p.intents.map((i) => i.id)).toEqual(["need", "dont-want", "help", "feeling", "tell", "question"]);
    expect(p.intents.filter((i) => !i.needsObject).map((i) => i.id)).toEqual(["feeling"]);
    expect(isProfileIntent("need")).toBe(true);
    expect(isProfileIntent("want")).toBe(false);
  });

  it("covers every intent and group with three short, literal, first-person lines", () => {
    for (const intent of p.intents) {
      for (const g of GROUPS) {
        const lines = p.templates[intent.id][g];
        expect(lines, `${intent.id}/${g}`).toHaveLength(3);
        for (const line of lines) {
          expect(words(line), line).toBeLessThanOrEqual(p.maxWords);
          expect(line, line).not.toMatch(/!/);
          expect(line, line).toMatch(/[.?]$/);
          expect(line, line).toMatch(/^[A-Z]/);
        }
      }
    }
  });

  it("gives the examples from the brief", () => {
    expect(p.templates.need[groupForLabel("mug")][0]).toBe("I want something to drink.");
    expect(p.templates["dont-want"][groupForLabel("shirt")][0]).toBe("This feels itchy.");
    expect(p.templates.help[groupForLabel("phone")][0]).toBe("It's not working.");
  });

  it("has full-sentence feelings that need no object", () => {
    expect(p.feelings).toHaveLength(10);
    for (const f of p.feelings) {
      expect(f).toMatch(/^(I'm|I feel|It's) /);
      expect(f).toMatch(/\.$/);
      expect(words(f)).toBeLessThanOrEqual(p.maxWords);
    }
  });

  it("has four verbs per group for every intent that takes an object, and the four endings", () => {
    for (const intent of p.intents.filter((i) => i.needsObject)) {
      for (const g of GROUPS) {
        const verbs = p.verbs[intent.id][g];
        expect(verbs, `${intent.id}/${g}`).toHaveLength(4);
        expect(new Set(verbs).size, `${intent.id}/${g}`).toBe(4);
        for (const v of verbs) expect(words(`I ${v} the cup now.`), v).toBeLessThanOrEqual(p.maxWords);
      }
    }
    expect(p.endings).toEqual(["now", "please", "later", "none"]);
  });

  it("maps labels to template groups through the vocabulary, with general as the fallback", () => {
    expect(groupForLabel("banana")).toBe("food");
    expect(groupForLabel("water bottle")).toBe("drinks");
    expect(groupForLabel("mug")).toBe("drinks");
    expect(groupForLabel("toothbrush")).toBe("bathroom");
    expect(groupForLabel("pills")).toBe("health");
    expect(groupForLabel("spoon")).toBe("kitchen");
    expect(groupForLabel("ball")).toBe("leisure");
    expect(groupForLabel("Mom's mug")).toBe("general");
    expect(groupForLabel("chair")).toBe("general");
  });

  it("asks for calm defaults", () => {
    expect(p.sensory).toMatchObject({ animation: false, soundFeedback: false, autoScan: false, speakOnHighlight: false, timeouts: false });
    expect(p.sensory.speechRate).toBeLessThan(0.95);
    expect(p.promptNote).not.toMatch(/!/);
  });
});
