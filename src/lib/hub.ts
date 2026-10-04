// Where the local hub (server/) lives. Override with VITE_HUB_URL.
export const HUB = (import.meta.env.VITE_HUB_URL as string | undefined) ?? `http://${location.hostname}:8787`;
