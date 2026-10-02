import type { InputAction } from "./types";

type InputHandler = (action: InputAction) => void;

let handler: InputHandler | null = null;
let holdTimer: ReturnType<typeof setTimeout> | null = null;
let lastKeyDown = 0;
const HOLD_MS = 800;

function onKeyDown(e: KeyboardEvent): void {
  if (!handler) return;
  if (e.repeat) return;
  // Ignore if user is typing in an input
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  )
    return;

  if (e.code === "Space") {
    e.preventDefault();
    const now = Date.now();
    // Start hold detection
    holdTimer = setTimeout(() => {
      handler?.("hold");
      holdTimer = null;
    }, HOLD_MS);
    lastKeyDown = now;
  }

  if (e.code === "KeyD") {
    e.preventDefault();
    handler("double");
  }

  if (e.code === "KeyH") {
    e.preventDefault();
    handler("hold");
  }
}

function onKeyUp(e: KeyboardEvent): void {
  if (!handler) return;
  if (e.code === "Space") {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
      const elapsed = Date.now() - lastKeyDown;
      if (elapsed < HOLD_MS) {
        handler("click");
      }
    }
  }
}

export function startInputListening(h: InputHandler): void {
  handler = h;
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
}

export function stopInputListening(): void {
  handler = null;
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
}
