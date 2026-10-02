# Current State

## Objective

Working demo: live webcam object tracking (boxes overlaid) -> click a box (or Space) to capture + identify the object -> captured object becomes a tile -> core word -> sentences -> speech.

## Plan (session 2)

1. [x] Local MediaPipe wasm (copied from node_modules into public/, pinned version) — jsdelivr `@latest` can mismatch the npm package
2. [x] Live tracking: ObjectDetector VIDEO mode in rAF loop + IoU tracker (stable ids, smoothing) + canvas overlay
3. [x] Click-to-identify: crop box -> ImageClassifier (EfficientNet-Lite0, ImageNet 1000) + detector label; optional Claude vision if VITE_ANTHROPIC_API_KEY
4. [x] Captured objects become tiles with thumbnails, auto-selected
5. [x] Claude composer when key present, mock fallback
6. [x] Verify in headless Chromium with injected test image stream
7. [ ] Update README / state, commit, push

## Completed (session 1)

- Vite + React 19 + TS + Tailwind 4 skeleton; snapshot detection on Space; mock composer; SpeechSynthesis; D/H keys

## Active assumptions

- Models load from storage.googleapis.com (reachable); jsdelivr is blocked in the agent sandbox but fine for user
- Chrome is the target browser

## Verified facts (headless Chromium + canvas-stream fake webcam)

- int8 EfficientDet on GPU delegate -> 0 detections; float16 model on GPU works -> using float16
- int8 EfficientNet classifier on GPU throws "Unsupported input tensor type: Float32" -> classifier runs on CPU
- Tracking, click-to-identify, Space capture, toast, tiles, composer all observed working (dog.jpg, fruits.jpg)
- Invalid Claude key: identification + sentences fall back to on-device results
- MediaPipe posts telemetry to odml.pa.googleapis.com (harmless failures in sandbox)

## Next action

Docs (README/knowledge), commit, then polish: speak-on-capture option, VAD/auto-speak queue (stretch).
