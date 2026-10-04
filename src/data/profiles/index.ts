import { neurodivergentProfile } from "./neurodivergent";
import type { TemplateGroup, UserProfile } from "./types";
import { VOCABULARY } from "../vocabulary";

export type { Ending, Intent, QuickPhrase, SensoryDefaults, TemplateGroup, UserProfile } from "./types";

export const ACTIVE_PROFILE: UserProfile = neurodivergentProfile;

export function groupForLabel(label: string, profile: UserProfile = ACTIVE_PROFILE): TemplateGroup {
  const key = label.trim().toLowerCase();
  const direct = profile.labelGroups[key];
  if (direct) return direct;
  const entry = VOCABULARY.find((v) => v.label.toLowerCase() === key);
  return (entry && profile.categoryGroups[entry.category]) ?? "general";
}

export function isProfileIntent(id: string, profile: UserProfile = ACTIVE_PROFILE): boolean {
  return profile.intents.some((i) => i.id === id);
}
