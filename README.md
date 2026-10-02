# Cue — Prototype

Camera-based AAC that turns what you point at into speech.

## Quick start

```bash
npm install
npm run dev        # copies MediaPipe wasm + downloads models into public/ on first run
```

Open **Chrome** at http://localhost:5173 and allow camera access.

1. **Track** — the webcam shows live boxes around objects it recognises (80 COCO classes: cup, bottle, phone, laptop, book, banana, chair, person…). The focused object (hovered, or nearest the centre) has a solid box.
2. **Capture + identify** — **click a box** (or press **Space** to grab the focused one). The crop is identified with a finer 1000-class classifier (e.g. "coffee mug", "water bottle", "remote control") and appears as a tile with a thumbnail. Clicking empty space identifies whatever is under the cursor.
3. **Fix the name** (optional) — tap one of the alternative labels under a tile to rename it.
4. **Core word** — tap WANT / NO / MORE / GO / HELP / YES / QUESTION → 3 candidate sentences.
5. **Speak** — tap a sentence to say it aloud, or **Queue** it and press "Speak Now" later.

| Key | Action (simulates the ring) |
|---|---|
| Space | Capture + identify the focused object |
| D | Instant backchannel (cycles yes / no / haha / mm-hmm / wait / wow / okay / thanks) |
| H | Queue the first candidate sentence |

Extras under the camera: **Say name on capture** (speaks the identified name), **Auto-speak queue at pause** (listens on the mic and speaks the queued sentence when your partner stops talking for ~0.7 s), a camera picker (when you have more than one), and a **Mirror** toggle (turn off if the camera faces away from you).

### Optional: Claude

Create `.env.local`:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

With a key, each capture is also sent to Claude Haiku 4.5 vision for an everyday name ("tv remote", "reusable water bottle"), and sentences come from Claude (template sentences show instantly, then get replaced). Without a key everything runs on-device. **The key is exposed to the browser — prototype only.**

### Troubleshooting

- **"Loading models…" forever / model error** — the first run needs internet to download models (`public/models/`). After that it works offline.
- **No boxes appear on your GPU** — open http://localhost:5173/?delegate=CPU to force CPU inference.
- **Camera denied** — click the camera icon in the address bar, allow, reload.

## Architecture

Everything runs in one browser tab. No backend.

```
Webcam ─► ObjectDetector (EfficientDet-Lite0, VIDEO mode, every frame)
            └► Tracker (IoU matching, smoothing, label voting) ─► canvas overlay
Click/Space ─► crop box ─► ImageClassifier (EfficientNet-Lite0, ImageNet)
                             └► (optional) Claude vision ─► tile
Tile + core word ─► templates (instant) ─► (optional) Claude composer ─► sentences
Sentence ─► SpeechSynthesis
```

## Module structure

| File | Purpose |
|---|---|
| `src/components/CameraView.tsx` | Camera stream, detection loop, overlay drawing, click/Space targeting |
| `src/lib/detect.ts` | MediaPipe ObjectDetector (float16 model, GPU with CPU fallback) |
| `src/lib/tracker.ts` | Frame-to-frame tracker giving stable ids and smooth boxes |
| `src/lib/classify.ts` | MediaPipe ImageClassifier for fine-grained names (CPU) |
| `src/lib/identify.ts` | Crop + classify + choose label; Claude vision refinement |
| `src/lib/vision.ts` | Shared wasm loader, GPU→CPU fallback, local-model resolver |
| `src/lib/claude.ts` | Lazy Anthropic SDK client (only when a key is set) |
| `src/lib/compose.ts` | Template sentences + Claude composer (`Composer` interface) |
| `src/lib/speak.ts` | SpeechSynthesis + backchannels (`TTSEngine` interface) |
| `src/lib/listen.ts` | Energy-based pause detector for auto-speaking the queue |
| `src/lib/input.ts` | Keyboard → ring actions (swap for a ring client later) |
| `src/lib/store.ts` | useReducer state |
| `scripts/` | `copy-wasm.mjs`, `fetch-models.mjs` (run automatically before dev/build) |

## Extension points

1. **Ring hardware** — call the `input.ts` handler with `click` / `double` / `hold` from a WebSocket/BLE client
2. **ElevenLabs TTS** — implement `TTSEngine` in `speak.ts`
3. **Better VAD** — swap the energy detector in `listen.ts` for vad-web/Silero
4. **Partner transcription** — feed Web Speech API text into `ComposeInput.partnerContext`
