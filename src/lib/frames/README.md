# Sentence frames: the one function to implement

The "build my own sentence" bubble appears above the predefined sentences only when an object has been captured and an intent is chosen. What it offers comes from a **frame provider**. Everything else (UI, touch, ring scanning, speaking, sending to caregivers, history pre-highlight, caching, timeouts, validation, fallback) is done.

**Your job:** implement `modelFrame` in `src/lib/frames/model.ts`. Do not edit any other file.

```ts
export async function modelFrame(input: FrameInput, signal: AbortSignal): Promise<SentenceFrame | null>
```

Return `null` to let the built-in profile frame handle this object and intent.

## Input (`FrameInput`, see `frame.ts`)

| Field | Meaning |
|---|---|
| `captureId` | Stable id of the captured object |
| `object.label` | What the user chose or the namer decided ("mug", "Mom's mug") |
| `object.alternatives` | Other names the namer considered |
| `object.confidence`, `object.source` | Namer confidence 0–1; `vocab`, `personal`, `claude`, `classifier`, `manual` |
| `object.category` | Vocabulary category ("kitchen & dining") or `null` |
| `object.group` | Coarse group: food, drinks, clothes, electronics, bathroom, health, kitchen, leisure, general |
| `image.crop` | Full-resolution `HTMLCanvasElement` of the object, or `null` |
| `image.thumbnail` | 160 px JPEG data URL |
| `intent` | `{ id, label }`: need, dont-want, help, feeling, tell, question |
| `rules` | `maxWords` 8, `maxOptions` 4, `maxSlots` 3, `promptNote` (the profile's tone rules) |

## Output (`SentenceFrame`)

```ts
{
  parts: ["I", { slot: "verb" }, "the mug", { slot: "ending" }],
  slots: [
    { id: "verb", prompt: "Pick a word", options: ["want", "need", "would like", "will drink"] },
    { id: "ending", prompt: "Add at the end",
      options: ["now", { label: "please", text: ", please" }, "later", { label: "nothing", text: "" }],
      defaultIndex: 3 },
  ],
  end: ".",
}
```

- `parts` is fixed text and slot references, joined with spaces; space before `, . ?` is removed and the first letter is capitalised.
- An option is a string, or `{ label, text }` when the button label differs from the inserted text (`text: ""` = optional slot).
- `defaultIndex` pre-selects an option (use it for optional slots).
- The user picks slots left to right; picking in the last slot says the sentence.

**Rejected automatically** (then the profile frame is used, and the console says why): 0 or more than 3 slots, fewer than 2 or more than 4 options, duplicate labels, `!` anywhere, unknown or unused slot ids, a bad `defaultIndex`, or a longest-possible sentence over 8 words.

## Runtime behaviour

- Called once per captured object × intent; the result is cached. Never on renders or key presses.
- 8 s timeout (`FRAME_TIMEOUT_MS` in `index.ts`); while waiting, the bubble shows a fixed-size placeholder, so nothing jumps.
- `signal` aborts when the user changes object or intent: pass it to any `fetch`.
- No API keys in the browser. If you call a hosted model, add a route to the hub (`server/`, keys in `server/.env.local`) and `fetch` it from here.

## Test and try

```bash
npx vitest run src/lib/frames
```

`frames.test.ts` runs `modelFrame` over the fixtures in `fixtures.ts` and fails on any invalid frame. In the app, `?frames=model` uses only your provider (no fallback) and `?frames=profile` only the built-in one; the default tries yours first. The console logs `[frames] {"provider":…}` for each frame shown and `[frames] model frame rejected: …` when validation fails.
