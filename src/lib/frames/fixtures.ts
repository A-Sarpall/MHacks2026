import type { TemplateGroup } from "../../data/profiles";
import type { FrameInput, FrameRules } from "./frame";

export const TEST_RULES: FrameRules = {
  maxWords: 8,
  maxOptions: 4,
  maxSlots: 3,
  promptNote:
    "The speaker is a neurodivergent adult who may be autistic. Write literal, concrete, polite sentences with no idioms, sarcasm, or exclamation marks.",
};

function input(id: string, label: string, group: TemplateGroup, category: string | null, intent: [string, string], alternatives: string[] = []): FrameInput {
  return {
    captureId: id,
    object: { label, alternatives, confidence: 0.6, source: "vocab", category, group },
    image: { thumbnail: "", crop: null },
    intent: { id: intent[0], label: intent[1] },
    rules: TEST_RULES,
  };
}

export const FRAME_FIXTURES: FrameInput[] = [
  input("f1", "mug", "drinks", "kitchen & dining", ["need", "I need"], ["cup", "glass"]),
  input("f2", "phone", "electronics", "personal items", ["help", "Help"], ["tablet", "remote"]),
  input("f3", "shirt", "clothes", "clothes & accessories", ["dont-want", "I don't want"], ["sweater", "jacket"]),
  input("f4", "toothbrush", "bathroom", "bathroom & hygiene", ["question", "Question"], ["comb"]),
  input("f5", "banana", "food", "fruit", ["tell", "Tell"], ["corn", "lemon"]),
  input("f6", "pills", "health", "health & medical", ["need", "I need"], ["pill bottle"]),
  input("f7", "Mom's mug", "general", null, ["need", "I need"], ["mug", "cup"]),
  input("f8", "chair", "general", "furniture & home", ["feeling", "I feel"], ["stool"]),
];
