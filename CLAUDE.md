# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Cue: a browser-only AAC prototype (React 19 + Vite + Tailwind v4 + TypeScript). The webcam tracks objects, the user captures one as a tile, taps a core word, picks a generated sentence, and it is spoken aloud. There is no backend; everything runs in one Chrome tab. Stable facts and non-goals live in `project.md`, the current task and acceptance criteria in `task.md`, and verified API quirks in `.agent/knowledge.md`. Read those before changing behavior they cover.

## Commands

```bash
npm install
npm run dev          # http://localhost:5173 (use Chrome, allow camera)
npm run build        # tsc -b && vite build; this is the type check + build gate
npm run lint         # oxlint
npx tsc --noEmit     # typecheck only
```

There is no test suite. Verify with `npm run build`, then by running the real flow in a browser.

`predev`/`prebuild` run `scripts/copy-wasm.mjs` (MediaPipe wasm from node_modules → `public/mediapipe/wasm`) and `scripts/fetch-models.mjs` (TFLite models → `public/models`). Both output dirs are gitignored. The first run needs network access.

Optional `.env.local`: `VITE_ANTHROPIC_API_KEY=...` turns on the Claude vision and composer paths. Without it the app is fully on-device. The key ships to the browser (prototype only). Append `?delegate=CPU` to the URL to force CPU inference.

## Architecture

```
Webcam ─► ObjectDetector (EfficientDet-Lite0, VIDEO mode, every frame)
            └► Tracker (IoU matching, smoothing, label voting) ─► canvas overlay
Click/Space ─► crop box ─► ImageClassifier (EfficientNet-Lite0, ImageNet)
                             └► (optional) Claude vision ─► tile
Tile + core word ─► templates (instant) ─► (optional) Claude composer ─► sentences
Sentence ─► SpeechSynthesis
```

Things that take reading several files to see:

- **State**: one `useReducer` in `src/lib/store.ts` (`CueState`, shapes in `src/lib/types.ts`). `App.tsx` handles orchestration: capture, compose, speak, queue, mic listener. `CameraView` exposes an imperative handle (`CameraViewHandle`) through a ref and owns the detection loop and overlay.
- **Two-stage results with stale guards**: composition dispatches template sentences from `composeMock` right away, then replaces them with `claudeComposer` output only if `composeSeq` still matches, so a newer request wins. Identification does the same thing: a tile shows the classifier label first, with `refining: true` while Claude vision runs, and then gets patched through `UPDATE_CAPTURE`.
- **MediaPipe loading** (`src/lib/vision.ts`): this module provides the shared wasm fileset, `createWithFallback` (GPU → CPU), and a local-model resolver that falls back to storage.googleapis.com. The detector uses the **float16** model on GPU. The classifier is deliberately **CPU-only**, because the int8 model throws on GPU. The int8 detector returns 0 detections on GPU. `detectForVideo` needs strictly increasing timestamps.
- **Coordinates**: `Box` is in unmirrored video-frame pixels. Mirroring and aspect-correct scaling are applied only when drawing and hit-testing in `CameraView`.
- **Claude** (`src/lib/claude.ts`): the SDK is imported lazily and only when the key is set, so Vite tree-shakes it out of keyless builds. Uses `dangerouslyAllowBrowser: true`, and the model constant is `CLAUDE_MODEL`.
- **Extension seams**: `input.ts` maps keys to ring actions `click | double | hold` (Space / D / H), which is where a future ring client plugs in. `speak.ts` has the `TTSEngine` interface, `compose.ts` has the `Composer` interface plus `ComposeInput.partnerContext`, and `listen.ts` holds the energy-based pause detector that auto-speaks the queued sentence.

## Constraints (from project.md)

- Browser only: no server, no Python, no server-side ML. Must work offline apart from the optional Claude calls.
- TTS is browser `SpeechSynthesis`; no ElevenLabs. No ring hardware, mobile layout, accounts, or persistence.
- Tailwind only (v4 via `@tailwindcss/vite`, no config file); no component library.

# Hackathon Goals & Tracks

### Beyond the Code (Hardware) (The main track)

Push past the screen. Build physical, tangible tech — circuits, sensors, wearables, robotics — that bridges the digital and the real.

### ASI:One Agent Challenge (sponsor track)

**FetchAI**

Most AI applications stop at conversation. Your challenge is to go further.

Build an AI agent, register it on Agentverse (https://agentverse.ai/), and make it discoverable through ASI:One (https://asi1.ai/. Your agent should understand a user’s intent and take meaningful action to solve a real-world problem.

It could coordinate services, automate a multi-step workflow, analyze live information, make context-aware recommendations, complete transactions, or collaborate with other specialized agents. The problem space and approach are entirely up to you.

We are looking for agents that do more than answer questions. Your project should demonstrate real utility, autonomy, and the ability to turn a user’s request into an outcome. Avoid simple chatbots or thin wrappers around a single API. Refer the full hackpack here : https://www.fetch.ai/events/hackathons/mhacks-2026/hackpack

Submission Requirement: In addition to your Devpost submission, you must also submit your project on ASI through the designated Submission Agent. (Link : https://asi1.ai/auth/signup?returnTo=%2Ffestival%2Fmhacks2026%2Fdashboard%3Futm_source%3Dmhacks2026)

Refer the submission process here : https://docs.google.com/document/d/1UDW-X1C24hxZviFOQzjTeh0pXRNAoflMb8lhJqZP9Z0

### Best Project Built with ElevenLabs (sponsor track)

**ElevenLabs**

Awarded to the project with the best use of ElevenLabs.

### Agents in iMessage using Photon (sponsor track)

**Photon**

Build AI agents that naturally participate in human conversations through iMessage. Participants can create AI companions, multi-agent systems, or other experiences that understand social context, persist context across interactions, and seamlessly integrate AI into everyday communication.

Projects must integrate with Photon's Spectrum framework and use Spectrum to connect their agent to iMessage to qualify for the prize.

### Build Better Personalized Healthcare with FinchNode (sponsor track)

**FinchNode**

Build an app that makes healthcare easier for patients, clinicians, or care teams using the FinchNode API. Projects should demonstrate a working FinchNode integration using our synthetic demo health records.

### Best use of Spacetime (sponsor track)

**Spacetime**

We’d love to see projects where Spacetime is the core real-time backend, especially anything with live shared state, multiplayer interaction, or instant sync between users/agents/systems. That makes it a great fit not just for games, but also for things like chat/community apps, collaborative tools, social experiences, AI agent coordination, live dashboards, trading / financial-style apps, auctions / marketplaces, shared simulations, multiplayer productivity tools, and stream/creator tools. Spacetime’s docs position it around real-time subscriptions, transactional updates, and server-side logic running close to the data, which is why these kinds of apps fit well.

We’d be excited by something like a real-time portfolio sim, prediction market, collaborative trading game, shared ops dashboard, multi-user planning tool, or AI systems coordinating in a persistent world state. The main thing we’d want is for Spacetime to be meaningfully used, not just added on the side.

A few cool examples already built with Spacetime:

- BitCraft Online
- Pogly, a real-time collaborative stream overlay
- Elegon, a fantasy MMORPG
- Catacomb Crawlers, an online RPG
