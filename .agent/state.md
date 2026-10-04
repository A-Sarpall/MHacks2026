# Current State

## Objective

Working demo: live webcam object tracking -> click a box (or Space) to capture + identify -> tile -> core word -> sentences -> speech.

## Status: demo-ready (branch claude/dazzling-bohr-oazch0)

Done:
- Local wasm + downloaded models (scripts/, run by predev/prebuild), CDN fallback
- Live tracking: detector VIDEO mode + IoU tracker + canvas overlay, adaptive throttle
- Click/Space capture -> crop -> ImageNet classifier (CPU) -> tile with thumbnail + rename alternatives; optional Claude Haiku vision
- Template sentences instantly, Claude composer replaces them when key set
- Toast "Identified: X", mirror toggle, camera picker, say-name toggle, auto-speak-at-pause (energy VAD)
- README / knowledge / DECISIONS updated

## Verified (headless Chromium, fake webcam from still images dog.jpg / fruits.jpg, 4:3 and 16:9)

- Tracking boxes, Space capture, click capture, empty-space click, dedupe, toast, sentences, speak returns to Ready
- Invalid Claude key -> graceful on-device fallback
- Pause detector fires 0.7s after synthetic speech ends (sandbox mic itself unavailable)
- Fresh clone: npm install && npm run build downloads models and builds

## Not verified here

- Real webcam, real audio output, real Claude responses (no key in sandbox), GPU drivers on user's machine

## FinchNode health record (2026-10-03, branch sponsor-features)

Done: `src/lib/health.ts`, `HealthPanel`, `HealthAlerts`; health context in `compose.ts` + Claude vision hints; `?patient=<scenario>`.
Verified (Docker: node:22 build + lint; Playwright headless Chromium with fake webcam pill-bottle image, mocked Anthropic API): 14/14 checks — record card, clinic phrases, pill bottle → medicine chips → med sentences, visit log + clipboard notes, patient switch, allergy alert + refusal-only sentences with the Claude composer skipped, medicine + record in composer/vision prompts.
Not verified: real Claude responses, real webcam, audio.

## Next ideas

- Partner transcription (Web Speech API) -> partnerContext
- Silero VAD, ElevenLabs, ring client
