# Agent Session Brief

Read this before touching any code. Also read `CLAUDE.md` and `.agent/knowledge.md` — they contain accurate technical constraints and verified API quirks that will save you time.

---

## What this project was

**Qu** was a browser-only AAC (Augmentative and Alternative Communication) prototype built for a hackathon. It tracked objects via webcam, let users capture them as tiles, tap core words (WANT / NO / MORE / HELP etc.), and generate sentences to speak aloud. The hackathon is over. That whole pattern is being removed. The underlying infrastructure — camera source abstraction, ring button input, TTS engine, the Vite/React/TS stack — is solid and worth keeping.

---

## What the user wants

A **camera-based ring**. The hardware is an **ESP32-CAM**. The user points it at something, presses a button, and immediately hears a spoken explanation back.

The use cases they have in mind:

- Point at a **medicine bottle** → hear what it is, what it does
- Point at a **ceiling, wall, or room** → hear what's in the environment
- Point at **text — a label, a sign, a word** → have it read and explained
- Build up an understanding of an environment over a session, so the system gets smarter about context the longer you use it

The core insight they described: **pointing and listening is faster and easier than reading a wall of text**. It's a general-purpose tool for anyone — not accessibility software, just a better way to take in information when your hands are busy, the light is bad, or audio is simply faster for you.

---

## Ideas from the conversation (not prescriptions — research and decide)

A few things came up in the discussion that are worth knowing as you design:

- **The ESP32-CAM has real hardware limits** — the standard OV2640 has fixed focus (~30–50cm sweet spot), low-light struggles, and resolution limits for streaming. There are upgraded modules (OV5640 with autofocus). Factor this into your approach — the camera source abstraction already exists so swapping sources is clean.

- **Caching similar images** — the user specifically mentioned this as an idea. The thinking was: if you point at the same thing twice, the response should be instant without a round trip. Worth researching what the right mechanism is (perceptual hashing, embedding similarity, something else entirely).

- **Seamless speed** — the user used the phrase "seamless speeds." Whatever the pipeline ends up being, latency from press to first spoken word is a key quality metric. Think about streaming, on-device vs API tradeoffs, and what the realistic latency floor is given the hardware.

- **Session context** — the idea that context accumulates over a session came up. Pointing at things in a pharmacy vs a kitchen should produce different explanations for the same object. How to build and use that context is an open design question.

---

## Your job

**Research first. Then build.**

The existing pipeline (detect → classify → compose sentence) is the wrong pattern for this. Figure out what the right pattern is. What technologies fit — on-device, API-based, hybrid? What are the tradeoffs given an ESP32-CAM as the image source? What does the latency profile look like for each approach?

Build the best product you can determine from that research. Document your design decisions in `.agent/decisions.md` before implementing them.

---

## What to strip

Remove the AAC features. Delete, don't comment out:

- Core-word buttons (WANT / NO / MORE / GO / HELP / YES / QUESTION)
- Sentence composition UI, tile bar, queue/speak controls
- 637-label vocabulary and label-matching classification flow
- Scanner / choice UI
- Personal objects (teach/rename/delete)
- Any UI copy framing this as a communication aid

---

## Constraints

- Do not break the `FrameSource` / `ButtonInput` abstraction in `src/vision/` — this is how the ESP32-CAM plugs in
- Stay on the existing stack: Vite + React + TypeScript + Tailwind v4
- `npm run build` must pass at all times — it is the verification gate
- No server-side ML; no new backend beyond the existing local hub in `server/`
- Do not commit secrets

---

## You have room to move

The AAC architecture is the wrong shape for this use case. Redesign freely — new modules, new state shape, new core loop. The camera abstraction and the stack stay. Everything else is open if you have a good reason for it.
