"""Tiny async client for the Qu hub (server/hub.ts): the agents' only door to Qu's data."""
import os

import aiohttp

HUB_URL = os.getenv("QU_HUB_URL", "http://localhost:8787").rstrip("/")


class HubError(Exception):
    pass


async def call(method: str, path: str, body: dict | None = None, timeout: float = 8.0) -> dict:
    try:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=timeout)) as s:
            async with s.request(method, HUB_URL + path, json=body) as r:
                data = await r.json(content_type=None)
                if r.status >= 400:
                    raise HubError(f"hub {r.status}: {data.get('error', data)}")
                return data
    except aiohttp.ClientError as e:
        raise HubError(f"hub unreachable at {HUB_URL}: {e}") from e
    except TimeoutError as e:
        raise HubError(f"hub timed out at {HUB_URL}") from e
