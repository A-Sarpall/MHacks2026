import { ACTIVE_PROFILE, type UserProfile } from "../../data/profiles";
import type { FrameInput, FrameProvider, SentenceFrame } from "./frame";

export function profileFrame(input: FrameInput, profile: UserProfile = ACTIVE_PROFILE): SentenceFrame | null {
  const verbs = profile.verbs[input.intent.id]?.[input.object.group];
  if (!verbs || verbs.length === 0) return null;
  return {
    parts: ["I", { slot: "verb" }, `the ${input.object.label}`, { slot: "ending" }],
    slots: [
      { id: "verb", prompt: "Pick a word", options: verbs.slice(0, input.rules.maxOptions) },
      {
        id: "ending",
        prompt: "Add at the end",
        options: [
          { label: "now", text: "now" },
          { label: "please", text: ", please" },
          { label: "later", text: "later" },
          { label: "nothing", text: "" },
        ],
        defaultIndex: 3,
      },
    ],
    end: ".",
  };
}

export const profileFrameProvider: FrameProvider = {
  id: "profile",
  frame: async (input) => profileFrame(input),
};
