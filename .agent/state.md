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

## Next ideas

- Partner transcription (Web Speech API) -> partnerContext
- Silero VAD, ElevenLabs, ring client
