"""Care agent: the coordinator. Talks to the caregiver in ASI:One (Agent Chat Protocol) and acts on the
patient's pain reports by orchestrating the Meds and Notify agents."""
import os
from pathlib import Path

from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    StartSessionContent,
    TextContent,
    chat_protocol_spec,
)

import hub
from logic import HELP, decide_pain, format_meds, format_summary, parse_intent
from meds_agent import load_context
from models import MedsContext, NotifyRequest, NotifyResult, PainContextRequest
from notify_agent import caregiver

README = Path(__file__).with_name("AGENT_README.md")


async def labels() -> tuple[str, str]:
    """(what the caregiver calls the patient, the caregiver's name)."""
    patient = os.getenv("QU_PATIENT_LABEL", "").strip()
    if not patient:
        patient = (await hub.call("GET", "/care/summary"))["patient"].split()[0]
    c = await caregiver()
    return patient, (c["name"] if c else "your caregiver")


def reply(text: str) -> ChatMessage:
    return ChatMessage(content=[TextContent(type="text", text=text), EndSessionContent(type="end-session")])


def make(seed: str, meds_address: str, notify_address: str, mailbox: bool = True) -> Agent:
    agent = Agent(
        name="qu-care-agent",
        seed=seed,
        port=8201,
        mailbox=mailbox,
        publish_agent_details=True,
        description="Caregiver assistant for Qu, an AAC device for people who lost speech: daily summary, medicines, messages read aloud to the patient, and automatic pain escalation.",
        readme_path=str(README),
    )
    protocol = Protocol(spec=chat_protocol_spec)

    async def answer(ctx: Context, text: str) -> str:
        intent = parse_intent(text)
        try:
            patient, name = await labels()
            if intent.kind == "summary":
                return format_summary(await hub.call("GET", "/care/summary"), patient)
            if intent.kind == "meds":
                got, _ = await ctx.send_and_receive(meds_address, PainContextRequest(), response_type=MedsContext, timeout=10)
                return format_meds(got or await load_context(), patient)
            if intent.kind == "tell":
                out = await hub.call("POST", "/care/say", {"from": name, "text": intent.message})
                if out.get("delivered"):
                    return f"Done. I told {patient}: \"{intent.message}\". It's being read aloud on his Qu."
                return f"I couldn't reach {patient}'s Qu (it isn't open right now), so he has not heard \"{intent.message}\". Try again in a minute."
        except hub.HubError as e:
            ctx.logger.error("hub error: %s", e)
            return "I can't reach Qu right now. Is the Qu hub running on his laptop?"
        return HELP

    @protocol.on_message(ChatMessage)
    async def on_chat(ctx: Context, sender: str, msg: ChatMessage):
        await ctx.send(sender, ChatAcknowledgement(acknowledged_msg_id=msg.msg_id))
        text = " ".join(c.text for c in msg.content if isinstance(c, TextContent)).strip()
        if not text and any(isinstance(c, StartSessionContent) for c in msg.content):
            text = "help"
        await ctx.send(sender, reply(await answer(ctx, text) if text else HELP))

    @protocol.on_message(ChatAcknowledgement)
    async def on_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
        pass

    agent.include(protocol, publish_manifest=True)

    @agent.on_interval(period=2.0)
    async def poll_pain(ctx: Context):
        """The user reports pain in Qu -> hub queue -> here. Check meds, decide, tell the caregiver and the user."""
        try:
            event = (await hub.call("GET", "/care/next")).get("event")
        except hub.HubError:
            return  # hub not up yet; try again next tick
        if not event:
            return
        level = event.get("level")
        ctx.logger.info("pain report: level %s", level)
        patient, name = await labels()
        meds, _ = await ctx.send_and_receive(meds_address, PainContextRequest(level=level), response_type=MedsContext, timeout=10)
        decision = decide_pain(level, meds, patient, name)
        sent, _ = await ctx.send_and_receive(
            notify_address, NotifyRequest(text=decision.caregiver_text, urgent=decision.urgent), response_type=NotifyResult, timeout=10
        )
        ok = isinstance(sent, NotifyResult) and sent.ok
        ctx.logger.info("decision urgent=%s notified=%s | %s", decision.urgent, ok, decision.caregiver_text)
        await hub.call(
            "POST", "/care/say",
            {"from": "Qu", "text": decision.user_text if ok else "I couldn't reach your caregiver. Please ask someone nearby to help."},
        )

    return agent
