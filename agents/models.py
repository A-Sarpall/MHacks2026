"""uAgent-to-uAgent messages between the Care, Meds and Notify agents."""
from uagents import Model


class PainContextRequest(Model):
    level: int | None = None


class PrnItem(Model):
    name: str
    strength: str | None = None
    reason: str | None = None
    interval_hours: float | None = None
    hours_since: float | None = None  # None = no record of a dose


class MedsContext(Model):
    patient: str
    age: int | None = None
    allergies: list[str] = []
    conditions: list[str] = []
    active_medicines: int = 0
    as_needed: list[PrnItem] = []


class NotifyRequest(Model):
    text: str
    urgent: bool = False


class NotifyResult(Model):
    ok: bool
    to: str = ""
    detail: str = ""
