// Small HTTP helpers shared by the hub and its route modules.
import type { IncomingMessage, ServerResponse } from "node:http";

// The Vite dev page (another origin) calls the hub directly.
export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export function send(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json", ...CORS });
  res.end(JSON.stringify(body));
}

export async function readJson(req: IncomingMessage, maxBytes = 64_000): Promise<unknown> {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > maxBytes) throw new Error("body too large");
  }
  return raw ? JSON.parse(raw) : {};
}
