# Project Context

## Name

Cue

## One-line purpose

Camera-based AAC (Augmentative and Alternative Communication) that turns what you point at into speech, timed to conversation pauses.

## Current stage

prototype

## Stack

- Runtime: Node 20+
- Language: TypeScript
- Frontend: React 19 + Vite 6 + Tailwind 4
- Backend: none (all in-browser)
- Data: none
- Deployment: none (local only)

## Architecture

One browser tab runs everything. No backend server.

1. **Capture**: Laptop webcam (simulates ring camera) provides frames via getUserMedia
2. **Track + identify**: MediaPipe Object Detector (EfficientDet-Lite0, COCO 80) tracks objects live; clicking one crops it and runs MediaPipe Image Classifier (EfficientNet-Lite0, ImageNet 1000), optionally refined by Claude vision
3. **Compose**: Selected object tiles + core words + partner transcript sent to LLM API (Claude Haiku), returns 2-3 candidate sentences
4. **Listen**: energy-based VAD detects partner pauses (Silero later); Web Speech transcription is future work
5. **Speak**: Browser SpeechSynthesis API for TTS output. Pre-rendered backchannel audio clips for instant reactions
6. **UI**: Tile bar (detected objects), core-word buttons, candidate sentences, speak/queue controls

Data flow: Webcam -> live tracking -> click -> identify -> object tiles -> user taps core word -> LLM generates sentences -> user picks one -> TTS speaks it (now or at next pause)

## Important directories

| Path | Purpose |
|---|---|
| `src/` | All application code |
| `src/lib/` | Core modules: capture, detect, compose, speak, listen |
| `src/components/` | React UI components |
| `public/` | Static assets, backchannel audio clips |

## Important commands

```text
Install: npm install
Dev: npm run dev
Build: npm run build
Lint: npm run lint
Typecheck: npx tsc --noEmit
```

## Environment

Required variables/configuration:

- `VITE_ANTHROPIC_API_KEY` — Claude API key for sentence composition (optional for prototype, can use mock)

Never put secret values here.

## Stable constraints

- Everything runs in the browser. No backend server, no Python, no FastAPI.
- Webcam only. No ESP32 ring hardware in this prototype.
- Keyboard shortcuts simulate ring: Space = click (capture + detect), D = double-click (backchannel), H = hold (queue to pause).
- Browser SpeechSynthesis for TTS (not ElevenLabs -- no API dependency for prototype).
- MediaPipe runs client-side. No server-side ML.
- Must work offline except for LLM calls (which can be mocked).

## Explicit non-goals

- Ring hardware integration (ESP32S3 firmware, WebSocket, BLE)
- ElevenLabs TTS integration
- Photon private messaging
- Partner display (second window)
- Production deployment
- User accounts or persistence
- Mobile support
