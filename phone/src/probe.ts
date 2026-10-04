// When a socket cannot connect, test plain HTTP(S) to the same host so the screen says WHY:
// "https check: 200" = the network and TLS are fine, so only the WebSocket upgrade fails.
export async function probe(wsUrl: string): Promise<string> {
  const http = wsUrl.replace(/^ws/, 'http').replace(/\/(phone)?\/?$/, '/health');
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 7000);
  try {
    const r = await fetch(http, { signal: ctl.signal });
    return `https check: ${r.status}`;
  } catch (e) {
    return `https check failed: ${String(e).slice(0, 90)}`;
  } finally {
    clearTimeout(t);
  }
}
