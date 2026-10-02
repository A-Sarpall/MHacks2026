# Active Task

## Objective

Build a working browser prototype of Cue that demonstrates the full core loop: webcam capture -> object detection -> tile selection -> sentence composition -> speech output, with keyboard shortcuts simulating the ring.

## Why

To validate the interaction model before the hackathon. A working prototype proves the UX flow, surfaces timing issues, and provides a demo-able artifact.

## Current state

Empty project. Template files only. No code, no dependencies, no UI.

## Required behavior

1. Webcam feed visible in the browser (small preview, not fullscreen)
2. Press Space -> capture frame -> run MediaPipe Object Detector -> show top-3 detected objects as tappable tiles
3. Tap a tile to select it (highlight, add to sentence context)
4. Core-word buttons always visible: want, no, more, go, help, yes, question
5. Tap a core word -> combine with selected tiles -> generate 2-3 candidate sentences (mock LLM initially, real API as stretch)
6. Tap a candidate sentence -> speak it aloud via SpeechSynthesis
7. Press H -> queue selected sentence -> speak at next detected pause (VAD stretch goal, manual button for v1)
8. Press D -> play instant backchannel sound ("yes" / "mm-hmm" / "haha")
9. Status indicator showing: idle / detecting / composing / speaking / queued

## Constraints

- Single-page React app, no routing
- Tailwind for styling, no component library
- MediaPipe Object Detector loaded from CDN or npm
- Sentence generation can be mocked with templates initially (e.g. "I [core_word] [object]")
- All audio via browser APIs (SpeechSynthesis + AudioContext for backchannels)
- Keyboard shortcuts must work even when no element is focused
- No build errors, no TypeScript errors

## Non-goals

- Ring hardware integration
- Real LLM API calls (mock is acceptable for v1)
- Partner speech transcription (stretch goal)
- VAD pause detection (stretch goal -- manual "speak now" is sufficient for v1)
- Polished visual design
- Responsive/mobile layout

## Acceptance criteria

- [ ] Webcam preview renders in browser
- [ ] Space key triggers frame capture and MediaPipe detection
- [ ] Detected objects appear as clickable tiles
- [ ] Core-word buttons render and are clickable
- [ ] Selecting tile + core word produces candidate sentences
- [ ] Tapping a candidate speaks it via SpeechSynthesis
- [ ] D key plays a backchannel audio clip
- [ ] Status indicator reflects current state
- [ ] No TypeScript errors, app builds cleanly

## Verification

```bash
npm run build   # must succeed with no errors
npm run dev     # open browser, test full flow manually:
                # 1. webcam appears
                # 2. Space -> objects detected -> tiles shown
                # 3. tap tile + core word -> sentences appear
                # 4. tap sentence -> spoken aloud
                # 5. D -> backchannel plays
```

## Known unknowns

- MediaPipe Object Detector bundle size and load time in browser
- Whether COCO 80 classes detect common hackathon-demo objects (water bottle, phone, laptop)
- SpeechSynthesis voice quality varies by browser/OS
