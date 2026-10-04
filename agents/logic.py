"""Decisions and wording for the care loop. Pure functions (no network, no agent framework): unit-tested.

Qu is not a medical device. It reports what the health record and the dose log say and leaves the
decision to a person: wording is "suggest" / "check with", never "take".
"""
import re
from dataclasses import dataclass

from models import MedsContext, PrnItem

URGENT_LEVEL = 8  # pain at or above this is escalated, whatever the medicine list says
PAIN_REASON = re.compile(r"pain|ache|arthritis|knee|head|sore|migraine", re.I)


@dataclass
class PainDecision:
    urgent: bool
    caregiver_text: str  # texted to the caregiver (via the Notify agent)
    user_text: str  # read aloud to the person who reported the pain


def _pain_meds(ctx: MedsContext) -> list[PrnItem]:
    return [m for m in ctx.as_needed if PAIN_REASON.search(m.reason or "")]


def _med_line(m: PrnItem) -> str:
    dose = f"{m.name}{f' {m.strength}' if m.strength else ''}"
    every = f" (every {m.interval_hours:g} hours)" if m.interval_hours else ""
    if m.hours_since is None:
        return f"Their as-needed {dose}{every} has no recorded dose, so I can't tell when it's due."
    due = m.interval_hours is None or m.hours_since >= m.interval_hours
    ago = f"{m.hours_since:g} hours ago"
    if due:
        return f"Their as-needed {dose}{every} was last taken {ago}, so another dose is allowed."
    wait = m.interval_hours - m.hours_since
    return f"Their as-needed {dose}{every} was last taken {ago}; the next dose is not due for {wait:g} more hours."


def decide_pain(level: int | None, ctx: MedsContext | None, label: str, caregiver: str = "your caregiver") -> PainDecision:
    """Turn a pain report plus the medicine context into a caregiver text and a message for the user."""
    shown = f"{level}/10" if level else "(level not given)"
    meds = _pain_meds(ctx) if ctx else []
    med_text = " ".join(_med_line(m) for m in meds) if meds else (
        "I couldn't check their medicines." if ctx is None else "There is no as-needed pain medicine on their list."
    )

    if level is not None and level >= URGENT_LEVEL:
        return PainDecision(
            True,
            f"URGENT: {label} reported pain {shown}. Please call or check on them now; if it's sudden, severe or in the chest, call emergency services. {med_text}",
            f"I've told {caregiver} right now. If this is an emergency, call 911.",
        )

    first = meds[0] if meds else None
    due_now = first is not None and first.hours_since is not None and (first.interval_hours is None or first.hours_since >= first.interval_hours)
    if due_now:
        user = f"I've told {caregiver}. Your {first.name} can be taken now. Check the bottle first."
    elif first is not None and first.hours_since is not None:
        user = f"I've told {caregiver}. Your {first.name} isn't due yet, so wait for them."
    else:
        user = f"I've told {caregiver}. Wait for them to help you."
    return PainDecision(False, f"{label} reported pain {shown}. {med_text}", user)


@dataclass
class Intent:
    kind: str  # "tell" | "summary" | "meds" | "help"
    message: str = ""


_TELL = re.compile(
    r"^\s*(?:please\s+)?(?:(?:can you\s+)?(?:tell|let)\s+(?:him|her|them|dad|mom|mum|\w+)(?:\s+know)?|(?:can you\s+)?(?:say|send|message|text))\s*(?:that|:|,)?\s+(.+?)\s*$",
    re.I | re.S,
)
_SUMMARY = re.compile(r"how(?:'s| is| are| has)|doing|status|update|summary|today|okay|ok\?", re.I)
_MEDS = re.compile(r"\b(?:meds?|medicines?|medications?|pills?|tylenol|acetaminophen|dose|doses|took|taken)\b", re.I)


def parse_intent(text: str) -> Intent:
    m = _TELL.match(text)
    if m and m.group(1).strip():
        return Intent("tell", m.group(1).strip())
    if _MEDS.search(text):
        return Intent("meds")
    if _SUMMARY.search(text):
        return Intent("summary")
    return Intent("help")


HELP = (
    "I'm Qu's care agent. Ask me \"How's Dad doing today?\" for a summary, \"What medicines is he on?\", "
    "or tell me \"Tell him I'll be there at 5\" and I'll have it read aloud on his Qu."
)


def format_summary(s: dict, label: str) -> str:
    lines = [f"{label} ({s['patient']}, {s['age']})" if s.get("age") else label]
    pain = s.get("painToday") or []
    if pain:
        latest = pain[-1]
        lv = f"{latest['level']}/10" if latest.get("level") else "no level given"
        lines.append(f"- Pain: reported {len(pain)} time(s) today; the latest was {lv}, {latest['minutesAgo']} minutes ago.")
    else:
        lines.append("- Pain: none reported today.")
    for m in s.get("asNeeded", []):
        if PAIN_REASON.search(m.get("reason") or ""):
            h = m.get("hoursSince")
            lines.append(f"- {m['name']} (as needed): " + (f"last taken {h:g} hours ago." if h is not None else "no dose recorded."))
    said = s.get("saidRecently") or []
    if said:
        lines.append("- Recently said with Qu: " + "; ".join(f"\"{x['text']}\" ({x['minutesAgo']} min ago)" for x in said[-3:]))
    else:
        lines.append("- Nothing said with Qu yet today.")
    if s.get("conditions"):
        lines.append(f"- Conditions: {', '.join(s['conditions'][:4])}{'…' if len(s['conditions']) > 4 else ''}.")
    return "\n".join(lines)


def format_meds(ctx: MedsContext, label: str) -> str:
    allergies = ", ".join(ctx.allergies) or "none listed"
    lines = [f"{label} takes {ctx.active_medicines} regular medicines. Allergies: {allergies}."]
    lines += [f"- {_med_line(m)}" for m in ctx.as_needed]
    return "\n".join(lines)
