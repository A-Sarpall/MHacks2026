"""Unit tests for logic.py. Run: .venv/bin/python -m unittest -v"""
import unittest

from logic import decide_pain, format_meds, format_summary, parse_intent
from models import MedsContext, PrnItem

TYLENOL = PrnItem(name="Acetaminophen", strength="500 mg", reason="knee pain", interval_hours=8, hours_since=9)
SLEEP = PrnItem(name="Trazodone", strength="50 mg", reason="sleep", interval_hours=None, hours_since=None)


def ctx(*prn: PrnItem) -> MedsContext:
    return MedsContext(patient="Harriet Lindqvist", age=78, allergies=["Sulfonamide"], active_medicines=12, as_needed=list(prn))


class DecidePain(unittest.TestCase):
    def test_due_dose_is_reported_and_allowed(self):
        d = decide_pain(6, ctx(TYLENOL, SLEEP), "Dad", "Maya")
        self.assertFalse(d.urgent)
        self.assertEqual(
            d.caregiver_text,
            "Dad reported pain 6/10. His as-needed Acetaminophen 500 mg (every 8 hours) was last taken 9 hours ago, so another dose is allowed.",
        )
        self.assertIn("can be taken now", d.user_text)
        self.assertIn("Check the bottle", d.user_text)

    def test_not_yet_due_says_how_long(self):
        d = decide_pain(5, ctx(PrnItem(name="Acetaminophen", strength="500 mg", reason="knee pain", interval_hours=8, hours_since=3)), "Dad", "Maya")
        self.assertIn("not due for 5 more hours", d.caregiver_text)
        self.assertIn("isn't due yet", d.user_text)

    def test_sleep_medicine_is_not_offered_for_pain(self):
        d = decide_pain(4, ctx(SLEEP), "Dad", "Maya")
        self.assertIn("no as-needed pain medicine", d.caregiver_text)
        self.assertNotIn("Trazodone", d.caregiver_text)

    def test_unknown_last_dose_does_not_claim_it_is_due(self):
        d = decide_pain(4, ctx(PrnItem(name="Acetaminophen", reason="knee pain", interval_hours=8)), "Dad", "Maya")
        self.assertIn("can't tell when it's due", d.caregiver_text)
        self.assertNotIn("can be taken now", d.user_text)

    def test_high_pain_escalates_regardless_of_medicine(self):
        d = decide_pain(9, ctx(TYLENOL), "Dad", "Maya")
        self.assertTrue(d.urgent)
        self.assertTrue(d.caregiver_text.startswith("URGENT: Dad reported pain 9/10"))
        self.assertIn("911", d.user_text)

    def test_no_level_and_no_medicine_context(self):
        d = decide_pain(None, None, "Dad", "Maya")
        self.assertFalse(d.urgent)
        self.assertIn("level not given", d.caregiver_text)
        self.assertIn("couldn't check", d.caregiver_text)


class Intents(unittest.TestCase):
    def test_tell(self):
        for text in ["Tell him I'll be there at 5", "tell dad I'll be there at 5", "Let him know I'll be there at 5",
                     "Can you tell him that I'll be there at 5?", "Please say I'll be there at 5"]:
            i = parse_intent(text)
            self.assertEqual(i.kind, "tell", text)
            self.assertIn("be there at 5", i.message)
        self.assertEqual(parse_intent("Tell him I'll be there at 5").message, "I'll be there at 5")

    def test_summary(self):
        for text in ["How's Dad doing today?", "any update?", "how is he"]:
            self.assertEqual(parse_intent(text).kind, "summary", text)

    def test_meds(self):
        self.assertEqual(parse_intent("What medicines is he on?").kind, "meds")
        self.assertEqual(parse_intent("did he take his pills").kind, "meds")

    def test_help(self):
        self.assertEqual(parse_intent("hello").kind, "help")
        self.assertEqual(parse_intent("tell").kind, "help")


class Formatting(unittest.TestCase):
    def test_summary_text(self):
        s = {
            "patient": "Harriet Lindqvist", "age": 78, "conditions": ["Heart failure", "Insomnia"],
            "asNeeded": [{"name": "Acetaminophen", "reason": "knee pain", "hoursSince": 9}, {"name": "Trazodone", "reason": "sleep", "hoursSince": None}],
            "saidRecently": [{"text": "Can I have some water, please?", "minutesAgo": 12}],
            "painToday": [{"level": 6, "minutesAgo": 5}],
        }
        t = format_summary(s, "Dad")
        self.assertIn("latest was 6/10, 5 minutes ago", t)
        self.assertIn("Acetaminophen (as needed): last taken 9 hours ago.", t)
        self.assertNotIn("Trazodone", t)
        self.assertIn('"Can I have some water, please?" (12 min ago)', t)

    def test_meds_text(self):
        t = format_meds(ctx(TYLENOL), "Dad")
        self.assertIn("12 regular medicines", t)
        self.assertIn("Allergies: Sulfonamide", t)


if __name__ == "__main__":
    unittest.main()
