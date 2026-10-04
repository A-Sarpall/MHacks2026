"""Connect the Care agent to its Agentverse mailbox from the terminal (no browser inspector needed).

The inspector page at agentverse.ai/inspect just POSTs your Agentverse token to the agent's local /connect
endpoint; this does the same call. With `npm run agents` already running:

    echo 'AGENTVERSE_API_KEY=<your key>' >> agents/.env      # keep it out of git (.env is ignored)
    cd agents && .venv/bin/python connect_mailbox.py
"""
import asyncio
import os
import sys

from dotenv import load_dotenv
from uagents.crypto import Identity

import hub  # noqa: F401  (keeps env loading consistent with the other scripts)

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


async def main() -> int:
    import aiohttp

    token = os.getenv("AGENTVERSE_API_KEY", "").strip()
    seed = os.getenv("QU_SEED_CARE", "")
    if not token or not seed:
        print("Set AGENTVERSE_API_KEY (and have run.py create QU_SEED_CARE) in agents/.env", file=sys.stderr)
        return 2
    address = Identity.from_seed(seed, 0).address
    port = os.getenv("QU_BUREAU_PORT", "8100")
    try:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30)) as s:
            async with s.post(
                f"http://127.0.0.1:{port}/connect",
                headers={"x-uagents-address": address},
                json={"user_token": token, "agent_type": "mailbox"},
            ) as r:
                body = await r.text()
                print(f"HTTP {r.status}: {body}")
                return 0 if r.status == 200 and '"success": true' in body.replace('":true', '": true') else 1
    except aiohttp.ClientError as e:
        print(f"Could not reach the agents on port {port}: {e}\nIs `npm run agents` running?", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
