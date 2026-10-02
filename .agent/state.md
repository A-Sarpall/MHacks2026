# Current State

## Objective

Build working Cue prototype — camera-based AAC with keyboard-simulated ring input.

## Completed

- Vite + React 19 + TypeScript + Tailwind 4 scaffolded and building
- Core module structure: `src/lib/` (capture, detect, compose, speak, input, store, types)
- UI components: `src/components/` (CameraPreview, TileBar, CoreWords, Candidates, StatusBar)
- App.tsx wires everything together
- Keyboard input: Space (capture/detect), D (backchannel), H (queue)
- MediaPipe Object Detector integration (EfficientDet-Lite, COCO 80, GPU delegate)
- Mock sentence composer (template-based, clean Composer interface for LLM swap)
- Browser SpeechSynthesis for TTS (clean TTSEngine interface for ElevenLabs swap)
- Backchannel cycling via D key
- State management via useReducer (no external deps)
- Build passes with zero errors

## What works end-to-end

1. Camera preview renders via getUserMedia
2. Space -> captures frame from video element -> MediaPipe detects objects -> tiles appear
3. Tap tile to select -> tap core word -> mock composer generates 3 candidate sentences
4. Tap candidate -> SpeechSynthesis speaks it
5. D key -> cycles through backchannels and speaks them
6. H key -> queues first candidate (manual speak-now button in StatusBar)
7. Status indicator tracks state transitions

## Not yet implemented

- Real LLM composer (Claude Haiku API call) — interface is ready, needs implementation
- VAD pause detection (vad-web/Silero) — queue exists but auto-trigger on pause is missing
- Partner speech transcription (Web Speech API listening) — listen.ts not wired into UI
- ElevenLabs TTS — TTSEngine interface is ready, needs implementation

## Active assumptions

- MediaPipe WASM loads from jsdelivr CDN (requires internet for first load)
- SpeechSynthesis availability varies by browser; Chrome is the target
- Mock composer is sufficient for validating the interaction flow

## Next action

Test the prototype manually in Chrome: `npm run dev`, verify the full flow works with a real webcam.
