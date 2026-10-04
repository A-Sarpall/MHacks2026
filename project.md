# Project Context

## Name

Qu

## One-line purpose

Camera-based AAC (Augmentative and Alternative Communication) that turns what you point at into speech, timed to conversation pauses.

## Current stage

prototype

## Stack

- Runtime: Node 20+
- Language: TypeScript
- Frontend: React 19 + Vite 6 + Tailwind 4
- Backend: local hub (`server/`, Node + TypeScript) for the care loop; Python agents in `agents/` (Phases 4+). Recognition still runs in the browser
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

Health record: an optional FinchNode record (public synthetic demo API, called from the browser) adds allergy alerts on captured objects, medicine-aware sentences, one-tap clinic phrases and copyable visit notes.

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

- Camera, recognition, composing and the UI run in the browser. A local hub (`server/`) holds API keys and talks to ElevenLabs, Photon, FinchNode and the Python agents (see `docs/care-loop.md`). No server-side ML.
- Webcam by default. Ring cameras/buttons plug in through `src/vision/` (`FrameSource`, `ButtonInput`); firmware protocols are placeholders until the hardware exists.
- Keyboard shortcuts simulate ring: Space = click (capture + detect), D = double-click (backchannel), H = hold (queue to pause).
- Browser SpeechSynthesis for TTS (not ElevenLabs -- no API dependency for prototype).
- MediaPipe runs client-side. No server-side ML.
- Must work offline except for LLM calls (which can be mocked) and the optional FinchNode health record (fetched from the browser; Cue works without one).

## Explicit non-goals

- Ring firmware (the browser side of WebSocket/BLE exists in `src/vision/`)
- Partner display (second window)
- Production deployment
- User accounts or persistence
- Mobile support
