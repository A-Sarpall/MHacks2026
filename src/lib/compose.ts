// Sentence composition: tiles + core words -> candidate sentences.
// Template implementation always works offline; App shows it instantly and
// swaps in the Claude composer's sentences when VITE_ANTHROPIC_API_KEY is set.
import { getClaude, CLAUDE_MODEL, textOf } from "./claude";
import { profilePrompt, profileSentences } from "./profileCompose";

export interface ComposeInput {
  tiles: string[];
  coreWords: string[];
  partnerContext?: string;
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
  const { tiles, coreWords } = input;
  if (tiles.length === 0 && coreWords.length === 0) return [];

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

// Quick sentences from just a noun — no intent needed
export function quickSentences(tiles: string[]): string[] {
  const bare = joinList(tiles);
  return [
    `I want the ${bare}.`,
    `Can you help me with the ${bare}?`,
    `What is the ${bare}?`,
  ];
}

// Claude-powered sentences from just a noun
export async function composeFromNoun(tiles: string[]): Promise<string[]> {
  const client = await getClaude();
  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 150,
    system:
      "You write short spoken sentences for an AAC (augmentative and alternative communication) user. " +
      "The user pointed their camera at an object. Predict the 3 most likely things they want to say about it. " +
      "Keep each sentence under 10 words, first person, natural and direct. Output one sentence per line, nothing else.",
    messages: [
      { role: "user", content: `Object: ${tiles.join(", ")}` },
    ],
  });
  const lines = textOf(message)
    .split("\n")
    .map((l) => l.replace(/^\s*(\d+[.)]|[-*•])\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
  if (lines.length === 0) throw new Error("Empty response");
  return lines;
}

export interface Composer {
  compose(input: ComposeInput): Promise<string[]>;
}

export const mockComposer: Composer = {
  compose: async (input) => composeMock(input),
};

export const claudeComposer: Composer = {
  async compose(input) {
    const client = await getClaude();
    const prompt = profilePrompt({ tiles: input.tiles, intent: input.coreWords[0] ?? "" });
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 200,
      system: prompt
        ? prompt.system
        : "You write short spoken sentences for an AAC (augmentative and alternative communication) user. " +
        "Given objects they pointed at and core words they chose, write exactly 3 different natural first-person sentences they might want to say aloud. " +
        "Keep each under 12 words. Output one sentence per line, nothing else.",
      messages: [
        {
          role: "user",
          content: prompt
            ? prompt.user + (input.partnerContext ? `\nPartner just said: ${input.partnerContext}` : "")
            : `Objects: ${input.tiles.join(", ") || "(none)"}\n` +
            `Core words: ${input.coreWords.join(", ") || "(none)"}` +
            (input.partnerContext
              ? `\nPartner just said: ${input.partnerContext}`
              : ""),
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
