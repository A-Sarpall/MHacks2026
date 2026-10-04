import { ACTIVE_PROFILE, groupForLabel, isProfileIntent, type Ending, type TemplateGroup, type UserProfile } from "../data/profiles";

export interface ProfileComposeInput {
  tiles: string[];
  intent: string;
}

export function fillObject(template: string, object: string): string {
  return template.replace(/\{object\}/g, object);
}

export function profileGroup(tiles: string[], profile: UserProfile = ACTIVE_PROFILE): TemplateGroup {
  return tiles.length > 0 ? groupForLabel(tiles[0], profile) : "general";
}

export function profileSentences(input: ProfileComposeInput, profile: UserProfile = ACTIVE_PROFILE): string[] | null {
  if (!isProfileIntent(input.intent, profile)) return null;
  if (input.intent === "feeling") {
    const group = profileGroup(input.tiles, profile);
    const lines = input.tiles.length > 0 ? profile.templates.feeling[group] : profile.feelings.slice(0, 3);
    return [...new Set(lines)];
  }
  if (input.tiles.length === 0) return [...new Set(profile.objectless[input.intent] ?? [])];
  const group = profileGroup(input.tiles, profile);
  const object = input.tiles[0];
  return [...new Set(profile.templates[input.intent][group].map((t) => fillObject(t, object)))];
}

export function profileVerbs(intent: string, tiles: string[], profile: UserProfile = ACTIVE_PROFILE): string[] {
  const bank = profile.verbs[intent];
  if (!bank) return [];
  return bank[profileGroup(tiles, profile)];
}

export function buildSentence(verb: string, object: string, ending: Ending): string {
  const base = `I ${verb} the ${object}`;
  switch (ending) {
    case "now":
      return `${base} now.`;
    case "please":
      return `${base}, please.`;
    case "later":
      return `${base} later.`;
    default:
      return `${base}.`;
  }
}

export function profilePrompt(input: ProfileComposeInput, profile: UserProfile = ACTIVE_PROFILE): { system: string; user: string } | null {
  if (!isProfileIntent(input.intent, profile)) return null;
  const intent = profile.intents.find((i) => i.id === input.intent)!;
  const group = profileGroup(input.tiles, profile);
  const system =
    "You write short spoken sentences for an AAC (augmentative and alternative communication) user. " +
    `${profile.promptNote} ` +
    `Write exactly 3 first-person sentences with different meanings, one per line, ${profile.maxWords} words or fewer each, ` +
    "and make one of them very short and direct. Output only the sentences.";
  const user =
    `Intent: ${intent.label} (${intent.id})\n` +
    `Object: ${input.tiles[0] ?? "(none)"}\n` +
    `Object category: ${group}`;
  return { system, user };
}
