export type QuickPhraseAction = "speak" | "pain" | "status";

export interface QuickPhrase {
  text: string;
  action: QuickPhraseAction;
}

export interface Intent {
  id: string;
  label: string;
  needsObject: boolean;
}

export type TemplateGroup =
  | "food"
  | "drinks"
  | "clothes"
  | "electronics"
  | "bathroom"
  | "health"
  | "kitchen"
  | "leisure"
  | "general";

export type Ending = "now" | "please" | "later" | "none";

export interface SensoryDefaults {
  animation: boolean;
  soundFeedback: boolean;
  vibrationFeedback: boolean;
  autoScan: boolean;
  speakOnHighlight: boolean;
  timeouts: boolean;
  speechRate: number;
}

export interface UserProfile {
  id: string;
  name: string;
  quickPhrases: QuickPhrase[];
  intents: Intent[];
  feelings: string[];
  templates: Record<string, Record<TemplateGroup, string[]>>;
  verbs: Record<string, Record<TemplateGroup, string[]>>;
  endings: Ending[];
  categoryGroups: Record<string, TemplateGroup>;
  labelGroups: Record<string, TemplateGroup>;
  sensory: SensoryDefaults;
  promptNote: string;
  maxWords: number;
}
