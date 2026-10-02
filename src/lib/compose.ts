// Sentence composition: tiles + core words -> candidate sentences.
// Mock implementation with templates. Replace with real LLM call at hackathon.

const VERB_MAP: Record<string, string> = {
  want: "want",
  no: "don't want",
  more: "want more",
  go: "want to go to",
  help: "need help with",
  yes: "would like",
  question: "have a question about",
};

export interface ComposeInput {
  tiles: string[];
  coreWords: string[];
  partnerContext?: string;
}

export function composeMock(input: ComposeInput): string[] {
  const { tiles, coreWords } = input;
  if (tiles.length === 0 && coreWords.length === 0) return [];

  const noun = tiles[0] ?? "that";
  const verb = coreWords[0] ? VERB_MAP[coreWords[0]] ?? coreWords[0] : "want";
  const article = /^[aeiou]/i.test(noun) ? "an" : "a";

  const candidates: string[] = [];

  // Candidate 1: natural sentence
  if (coreWords[0] === "question") {
    candidates.push(`What is that ${noun}?`);
  } else if (coreWords[0] === "go") {
    candidates.push(`I ${verb} the ${noun}.`);
  } else {
    candidates.push(`Can I have ${article} ${noun}?`);
  }

  // Candidate 2: literal minimal
  candidates.push(`I ${verb} ${noun}.`);

  // Candidate 3: polite variant
  if (coreWords[0] === "no") {
    candidates.push(`No ${noun}, thank you.`);
  } else if (coreWords[0] === "help") {
    candidates.push(`Could you help me with the ${noun}?`);
  } else {
    candidates.push(`${noun.charAt(0).toUpperCase() + noun.slice(1)}, please.`);
  }

  return candidates;
}

// Interface for real LLM implementation
export interface Composer {
  compose(input: ComposeInput): Promise<string[]>;
}

export const mockComposer: Composer = {
  compose: async (input) => composeMock(input),
};
