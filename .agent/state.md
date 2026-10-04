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

## 2026-10-03 care-loop work (branch cv-pipeline)

- Phase 0 hub done (`server/`, `npm run hub`). Phone-as-ring done: `phone/` Expo app + hub relay (`/phone` <-> `/ring`). Relay verified with ws clients; not yet run with a real phone or the browser UI.
- Next: Phase 1 (ElevenLabs) once `ELEVENLABS_API_KEY` + a voice sample exist.
- Phase 1 built: server/voice.ts + voice-cli.ts, /voice/status, /voice/speak, src/lib/tts.ts wired into App, public/reactions/ generated with the stock voice. Browser fallback verified in headless Chrome; ElevenLabs path verified via curl through the hub before the key in .env.local lost a character (now 50 chars). Waiting on: fixed key, voice sample for `voice clone`, then Phase 2/3.
- Phase 2 built: server/{finch,meds,label}.ts + /meds/{profile,check,clinic}, server/meds.test.ts (10 tests), src/lib/meds.ts, MedCard, ClinicPanel, App hooks. Verified: live FinchNode via hub, typed check + clinic panel in headless Chrome. NOT verified: photo label reading (no ANTHROPIC_API_KEY); SigLIP named the only pill-bottle test photo "salt" 12%, so auto-trigger from a real bottle is untested.
- Phase 3 built: server/{messages,routes-messages,http}.ts, QR page, /messages/*, reader voice, src/lib/{messages,qr,usePrivateMessaging}.ts, PrivateBar, IncomingCard, ring "message" mode. Verified in headless Chrome (dry-run): QR -> private target -> sentence sent -> inbound shown -> double-click tapback. 76 tests. NOT verified: real iMessage (no Photon credentials), real phone showing the QR.
- Phase 4 built: agents/ (care, meds, notify, models, hub client, logic + 12 unit tests, run.py Bureau, smoke.py), hub server/care.ts + routes-care.ts (+4 tests), browser PainPanel, "I took it", spoken-sentence log, ring pain mode. Verified: agents/smoke.py (8 checks, ASI:One stand-in over the real Chat Protocol), headless-Chrome E2E (ring hold -> pain 6 -> caregiver text -> user hears it). NOT verified: Agentverse mailbox connection, discovery/chat inside real ASI:One, the submission agent (need the user's Agentverse account).
- Photon live: project "Qu" (id kept in server/.env.local) created via CLI; credentials in server/.env.local; one Spectrum user (a teammate, real number kept out of the repo) with assigned line; inbound + outbound iMessage verified. Removed my stale fake contact (+1734555xxxx) from server/contacts.json. Next: reply -> read aloud in the app, QR on a real phone, ASI:One chat.

## FinchNode unified with the hub (2026-10-04)

Browser Health record panel and hub share one patient (`GET/POST /meds/patient`, `server/finch.ts` setSubject; fixture only for polypharmacy). A matched label check renames the tile to that medicine. Agents' wording is gender-neutral.
Verified: npm test (114), agents:test (12), typecheck:server, build, lint; Playwright in Docker with the real hub + live FinchNode: 22/22 (patient sync, clinic summary, typed check, pill bottle with/without label reading (mocked match), pain queue, on-device "peanut butter" 91% -> allergy refusals, hub down).
Not verified: real Claude label reading, ElevenLabs/Photon with keys, Agentverse.

## Scope change (2026-10-04)

FinchNode, medication/clinic modes, pain report and the Fetch.ai agents removed; "I need help" (say aloud / text a contact) replaces the pain panel. The FinchNode sections above are history.
