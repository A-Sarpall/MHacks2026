// Sentence composition: tiles + core words -> candidate sentences.
// Template implementation always works offline; App shows it instantly and
// swaps in the Claude composer's sentences when VITE_ANTHROPIC_API_KEY is set.
import { getClaude, CLAUDE_MODEL, textOf } from "./claude";
import { allergySentences, type HealthContext } from "./health";
import { profilePrompt, profileSentences } from "./profileCompose";

export interface ComposeInput {
  tiles: string[];
  coreWords: string[];
  partnerContext?: string;
  health?: HealthContext; // FinchNode record + what the objects matched in it
}

// Template sentences per core word. `the` = "the cup" (or "that" with no
// object), `a` = "a cup", `bare` = "cup".
type Forms = { the: string; a: string; bare: string; more: string };
const TEMPLATES: Record<string, (f: Forms) => string[]> = {
  want: (f) => [`Can I have ${f.a}?`, `I want ${f.the}.`, `${cap(f.bare)}, please.`],
  no: (f) => [`No, I don't want ${f.the}.`, `Not ${f.the}, thanks.`, `Please take ${f.the} away.`],
  more: (f) => [`Can I have more ${f.more}?`, `More ${f.more}, please.`, `I'd like some more.`],
  go: (f) => [`Let's go to ${f.the}.`, `I want to go to ${f.the}.`, `Can we go now?`],
  help: (f) => [`Can you help me with ${f.the}?`, `I need help with ${f.the}.`, `Help, please.`],
  yes: (f) => [`Yes, ${f.the}, please.`, `Yes, I'd like ${f.the}.`, `Yes!`],
  question: (f) => [`What is ${f.the}?`, `Whose is ${f.the}?`, `Can I ask about ${f.the}?`],
};

// When the object is one of the user's own medicines (`m` = "albuterol inhaler")
const MED_TEMPLATES: Record<string, (m: string) => string[]> = {
  want: (m) => [`I need my ${m}.`, `Can I have my ${m}, please?`, `Is it time for my ${m}?`],
  no: (m) => [`I don't want my ${m} right now.`, `I already took my ${m}.`, `Not now, please.`],
  more: (m) => [`My ${m} is running out.`, `Can we refill my ${m}?`, `I need more ${m}.`],
  go: (m) => [`Can we go get my ${m}?`, `Can we go to the pharmacy?`, `Let's go.`],
  help: (m) => [`Can you help me take my ${m}?`, `I need help with my ${m}.`, `Help, please.`],
  yes: (m) => [`Yes, I'll take my ${m}.`, `Yes, I took my ${m}.`, `Yes!`],
  question: (m) => [`Is it time for my ${m}?`, `Did I take my ${m} today?`, `What is my ${m} for?`],
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function anOrA(word: string): string {
  // Rough English rule: vowel sound, except "uni-", "use-", "eu-", "one"
  return /^(uni|use|usu|eu|one)/i.test(word) || !/^[aeiou]/i.test(word)
    ? "a"
    : "an";
}

function joinList(items: string[]): string {
  return items.length > 1
    ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
    : (items[0] ?? "");
}

export function composeMock(input: ComposeInput): string[] {
  const { tiles, coreWords, health } = input;
  if (tiles.length === 0 && coreWords.length === 0) return [];

  // An allergen overrides the core word: never offer to ask for it
  if (health?.allergies.length) return allergySentences(health.allergies);
  if (health?.meds.length) {
    const template = MED_TEMPLATES[coreWords[0] ?? "want"] ?? MED_TEMPLATES.want;
    return [...new Set(template(joinList(health.meds.map((m) => m.spoken))))];
  }

  const profile = profileSentences({ tiles, intent: coreWords[0] ?? "" });
  if (profile) return profile;

  const bare = tiles.length ? joinList(tiles) : "that";
  const forms: Forms = tiles.length
    ? {
        bare,
        more: bare,
        the: `the ${bare}`,
        a: tiles.length > 1 ? `the ${bare}` : `${anOrA(bare)} ${bare}`,
      }
    : { bare, more: "of that", the: "that", a: "that" };

  const template = TEMPLATES[coreWords[0] ?? "want"] ?? TEMPLATES.want;
  return [...new Set(template(forms))];
}

export interface Composer {
  compose(input: ComposeInput): Promise<string[]>;
}

export const mockComposer: Composer = {
  compose: async (input) => composeMock(input),
};

export const claudeComposer: Composer = {
  async compose(input) {
    // Allergen sentences come from code, never the model
    if (input.health?.allergies.length) return allergySentences(input.health.allergies);
    const client = await getClaude();
    const prompt = input.health?.meds.length ? null : profilePrompt({ tiles: input.tiles, intent: input.coreWords[0] ?? "" });
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 200,
      system: prompt
        ? prompt.system
        : "You write short spoken sentences for an AAC (augmentative and alternative communication) user. " +
        "Given objects they pointed at and core words they chose, write exactly 3 different natural first-person sentences they might want to say aloud. " +
        "Keep each under 12 words. Output one sentence per line, nothing else." +
        (input.health
          ? " You also get facts from their health record. Use them only when relevant (refer to their medicines by name), and never state medical facts that are not in the record."
          : ""),
      messages: [
        {
          role: "user",
          content: prompt
            ? prompt.user + (input.partnerContext ? `\nPartner just said: ${input.partnerContext}` : "")
            : `Objects: ${input.tiles.join(", ") || "(none)"}\n` +
            `Core words: ${input.coreWords.join(", ") || "(none)"}` +
            (input.partnerContext
              ? `\nPartner just said: ${input.partnerContext}`
              : "") +
            (input.health ? healthPrompt(input.health) : ""),
        },
      ],
    });
    const lines = textOf(message)
      .split("\n")
      .map((l) => l.replace(/^\s*(\d+[.)]|[-*•])\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 3);
    if (lines.length === 0) throw new Error("Empty composer response");
    return lines;
  },
};

function healthPrompt(h: HealthContext): string {
  let text = `\n\nTheir health record:\n${h.summary}`;
  if (h.meds.length)
    text += `\nThe object is their medicine: ${h.meds.map((m) => m.spoken).join(", ")}.`;
  return text;
}
