"""Notify agent: texts the caregiver through the hub (Photon iMessage, or dry-run without credentials)."""
import os

from uagents import Agent, Context

import hub
from models import NotifyRequest, NotifyResult


async def caregiver() -> dict | None:
    contacts = (await hub.call("GET", "/messages/status"))["contacts"]
    want = os.getenv("QU_CAREGIVER_NAME", "").strip().lower()
    return next((c for c in contacts if c["name"].lower() == want), contacts[0] if contacts else None)


def make(seed: str) -> Agent:
    agent = Agent(name="qu-notify-agent", seed=seed, enable_agent_inspector=False)  # a Bureau serves ONE inspector; it must be the Care agent's

    @agent.on_message(NotifyRequest, replies=NotifyResult)
    async def on_request(ctx: Context, sender: str, msg: NotifyRequest):
        try:
            c = await caregiver()
            if c is None:
                result = NotifyResult(ok=False, detail="no caregiver contact is set up (QU_CONTACTS)")
            else:
                sent = await hub.call("POST", "/messages/send", {"to": c["id"], "text": msg.text})
                ctx.logger.info("texted %s (%s): %s", c["name"], sent.get("mode"), msg.text)
                result = NotifyResult(ok=True, to=c["name"], detail=sent.get("mode", ""))
        except hub.HubError as e:
            ctx.logger.error("notify failed: %s", e)
            result = NotifyResult(ok=False, detail=str(e))
        await ctx.send(sender, result)

    return agent
