"""Meds agent: wraps the FinchNode health record (through the hub) and answers medicine questions."""
from uagents import Agent, Context

import hub
from models import MedsContext, PainContextRequest, PrnItem


async def load_context() -> MedsContext:
    s = await hub.call("GET", "/care/summary")
    return MedsContext(
        patient=s["patient"],
        age=s.get("age"),
        allergies=[a["substance"] for a in s.get("allergies", [])],
        conditions=s.get("conditions", []),
        active_medicines=s.get("activeMedicines", 0),
        as_needed=[
            PrnItem(
                name=m["name"], strength=m.get("strength"), reason=m.get("reason"),
                interval_hours=m.get("intervalHours"), hours_since=m.get("hoursSince"),
            )
            for m in s.get("asNeeded", [])
        ],
    )


def make(seed: str) -> Agent:
    agent = Agent(name="qu-meds-agent", seed=seed, enable_agent_inspector=False)  # a Bureau serves ONE inspector; it must be the Care agent's

    @agent.on_message(PainContextRequest, replies=MedsContext)
    async def on_request(ctx: Context, sender: str, msg: PainContextRequest):
        ctx.logger.info("medicine context requested (pain level %s)", msg.level)
        await ctx.send(sender, await load_context())

    return agent
