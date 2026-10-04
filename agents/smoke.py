"""Integration smoke test: hub (dry-run) + the three agents + a stand-in for ASI:One speaking the Chat Protocol.

    QU_CONTACTS="Maya:+17345550100" npm run hub        (repo root, other terminal)
    cd agents && QU_LOCAL_ONLY=1 QU_PATIENT_LABEL=Dad .venv/bin/python smoke.py
"""
import asyncio
import json
import os
import sys

import aiohttp
from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import ChatAcknowledgement, ChatMessage, TextContent, chat_protocol_spec

import hub
import run

run.ensure_seeds()
os.environ["QU_LOCAL_ONLY"] = "1"
bureau, care, meds, notify = run.build(local_only=True)

asi = Agent(name="asi-one-standin", seed="smoke-asi-one-standin")
proto = Protocol(spec=chat_protocol_spec)
replies: asyncio.Queue[str] = asyncio.Queue()
heard: list[dict] = []  # what the Qu browser would hear (hub /messages/stream)


@proto.on_message(ChatMessage)
async def on_reply(ctx: Context, sender: str, msg: ChatMessage):
    await ctx.send(sender, ChatAcknowledgement(acknowledged_msg_id=msg.msg_id))
    await replies.put(" ".join(c.text for c in msg.content if isinstance(c, TextContent)))


@proto.on_message(ChatAcknowledgement)
async def on_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass


asi.include(proto)
bureau.add(asi)
failures: list[str] = []


def check(name: str, ok: bool, detail: str = ""):
    print(("PASS " if ok else "FAIL ") + name + (f"\n     {detail}" if detail else ""), flush=True)
    if not ok:
        failures.append(name)


async def listen_stream():
    async with aiohttp.ClientSession() as s, s.get(hub.HUB_URL + "/messages/stream") as r:
        async for line in r.content:
            if line.startswith(b"data: "):
                heard.append(json.loads(line[6:]))


async def ask(ctx: Context, text: str) -> str:
    await ctx.send(care.address, ChatMessage(content=[TextContent(type="text", text=text)]))
    return await asyncio.wait_for(replies.get(), timeout=15)


async def script(ctx: Context):
    try:
        asyncio.create_task(listen_stream())
        await asyncio.sleep(3)

        r = await ask(ctx, "How's Dad doing today?")
        check("summary names the patient and the pain medicine", "Dad" in r and "Acetaminophen" in r and "9 hours" in r, r)

        r = await ask(ctx, "What medicines is he on?")
        check("meds answer comes via the Meds agent", "12 regular medicines" in r and "Sulfonamide" in r, r)

        r = await ask(ctx, "Tell him I'll be there at 5")
        await asyncio.sleep(0.5)
        check("caregiver message is delivered to the user's Qu", any(h["text"] == "I'll be there at 5" and h["from"] == "Maya" for h in heard), r)

        await hub.call("POST", "/care/pain", {"level": 6})
        await asyncio.sleep(7)
        outbox = (await hub.call("GET", "/messages/outbox"))["outbox"]
        sent = [o for o in outbox if "reported pain 6/10" in o["text"]]
        check("pain 6/10: Notify texted the caregiver", bool(sent) and sent[0]["to"] == "Maya", json.dumps(outbox[-1:]))
        check("pain 6/10: the text says another dose is allowed", bool(sent) and "9 hours ago, so another dose is allowed" in sent[0]["text"])
        check("pain 6/10: the user hears what happened", any(h["from"] == "Qu" and "told Maya" in h["text"] and "can be taken now" in h["text"] for h in heard), json.dumps([h for h in heard if h["from"] == "Qu"]))

        r = await ask(ctx, "How's Dad doing today?")
        check("summary now includes today's pain report", "6/10" in r, r)

        await hub.call("POST", "/care/pain", {"level": 9})
        await asyncio.sleep(7)
        outbox = (await hub.call("GET", "/messages/outbox"))["outbox"]
        check("pain 9/10 escalates as URGENT", any(o["text"].startswith("URGENT: Dad reported pain 9/10") for o in outbox))
    except Exception as e:  # noqa: BLE001
        check("script ran without errors", False, repr(e))
    print("\nALL PASSED" if not failures else f"\nFAILED: {failures}", flush=True)
    os._exit(1 if failures else 0)


@asi.on_event("startup")
async def start(ctx: Context):
    asyncio.create_task(script(ctx))


if __name__ == "__main__":
    bureau.run()
