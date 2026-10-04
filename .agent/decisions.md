# Architecture Decisions

> Record durable decisions, not ordinary implementation chatter.

## Template

### [YYYY-MM-DD] — [decision title]

**Decision**

[What we decided.] 

**Reason**

[Why.] 

**Alternatives considered**

- [alternative + reason not chosen]

**Consequence**

[What future work should assume.] 

---


### 2026-10-03 — Local hub + sponsor care loop (reverses "browser-only, no backend")

**Decision**

Add a local Node/TypeScript hub (`server/`) and Python agents (`agents/`) so one demo scene uses ElevenLabs, Photon, FinchNode and Fetch.ai as a single care loop. Plan and phases: `docs/care-loop.md`.

**Reason**

API keys must stay off the browser; Photon (iMessage) and uAgents need a server process; FinchNode and Fetch.ai are Python. The earlier "no backend" and "ElevenLabs/Photon non-goal" decisions were for the offline prototype.

**Alternatives considered**

- Keep browser-only and call every sponsor API from the page: exposes keys and cannot run uAgents or Photon.

**Consequence**

The hub speaks the existing ring WebSocket protocol, so the browser's "Ring button (Wi-Fi)" input works unchanged. Offline mode (templates + SpeechSynthesis) must keep working when the hub is down.

---
