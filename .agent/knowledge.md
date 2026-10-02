# Verified Knowledge

## MediaPipe Object Detector (browser)

- Package: `@mediapipe/tasks-vision`
- WASM files loaded from: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm`
- Model: `efficientdet_lite0` (int8), loaded from Google Storage CDN
- Running mode: "IMAGE" for single-frame detection, "VIDEO" for continuous
- Input: HTMLVideoElement, HTMLCanvasElement, or HTMLImageElement
- Output: `ObjectDetectorResult` with `.detections[].categories[].categoryName` and `.score`
- COCO 80 classes include: person, bicycle, car, bottle, cup, chair, laptop, cell phone, book, etc.
- GPU delegate available in Chrome, falls back to CPU

## Browser SpeechSynthesis

- `window.speechSynthesis.speak(utterance)` — async, fires `onend`
- `window.speechSynthesis.cancel()` — stops current speech
- Rate range: 0.1 to 10 (1.0 = normal)
- Must be triggered by user gesture in some browsers (first interaction)
- Chrome on Windows uses Microsoft voices by default

## Tailwind v4 with Vite

- Plugin: `@tailwindcss/vite`
- CSS entry: `@import "tailwindcss";` in index.css
- No tailwind.config needed — v4 uses CSS-based config
