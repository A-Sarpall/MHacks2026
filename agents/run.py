"""Start the three Qu agents in one Bureau. Only the Care agent is exposed to ASI:One (Agentverse mailbox).

    cd agents && .venv/bin/python run.py

First run creates agents/.env with random seeds (they are the agents' private keys: keep them secret and
stable, because the addresses, and the Agentverse registration, come from them)."""
import os
import secrets
from pathlib import Path

from dotenv import load_dotenv

ENV = Path(__file__).with_name(".env")
KEYS = ["QU_SEED_CARE", "QU_SEED_MEDS", "QU_SEED_NOTIFY"]


def ensure_seeds() -> None:
    load_dotenv(ENV)
    missing = [k for k in KEYS if not os.getenv(k)]
    if missing:
        with ENV.open("a") as f:
            for k in missing:
                f.write(f"{k}={secrets.token_hex(24)}\n")
        print(f"[run] created seeds in {ENV.name}: {', '.join(missing)}")
        load_dotenv(ENV, override=True)


def build(local_only: bool):
    from uagents import Bureau
    from uagents.crypto import Identity

    import care_agent
    import meds_agent
    import notify_agent

    meds = meds_agent.make(os.environ["QU_SEED_MEDS"])
    notify = notify_agent.make(os.environ["QU_SEED_NOTIFY"])
    care = care_agent.make(os.environ["QU_SEED_CARE"], meds.address, notify.address, mailbox=not local_only)
    bureau = Bureau(port=int(os.getenv("QU_BUREAU_PORT", "8100")))
    for a in (care, meds, notify):
        bureau.add(a)
    return bureau, care, meds, notify


if __name__ == "__main__":
    ensure_seeds()
    local = os.getenv("QU_LOCAL_ONLY", "0") == "1"
    bureau, care, meds, notify = build(local)
    print(f"[run] Care   {care.address}   <- the ASI:One / Agentverse agent{' (local only: no mailbox)' if local else ''}")
    print(f"[run] Meds   {meds.address}")
    print(f"[run] Notify {notify.address}")
    if not local:
        from urllib.parse import quote

        port = os.getenv("QU_BUREAU_PORT", "8100")
        # A Bureau does not log the inspector link (a standalone Agent does), so build it here.
        print(f"[run] Connect the Care agent to Agentverse: open\n      https://agentverse.ai/inspect/?uri={quote(f'http://127.0.0.1:{port}')}&address={care.address}")
    bureau.run()
