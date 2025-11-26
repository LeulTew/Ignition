import json
import logging
import os
from typing import Any, Callable, Dict, Literal, Optional

from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

Language = Literal["en", "am"]
GuardrailStatus = Literal["ok", "gibberish", "abuse"]

GUARDRAIL_MODEL = os.getenv("GEMINI_GUARDRAIL_MODEL", "gemini-2.0-flash-lite")


def _build_guardrail_prompt(goal: str) -> str:
    goal_clean = goal.strip()
    return f"""
You are a mission-control intake filter. Categorize the incoming text using one of three labels:
- OK: valid, actionable, professional request.
- GIBBERISH: nonsense, repeated characters, emoji spam, or unparseable noise.
- ABUSE: insults, harassment, hateful or profane language toward the operator.

Return strict JSON: {{"status": "<OK|GIBBERISH|ABUSE>", "reason": "<short explanation>"}}
Goal: "{goal_clean}"
"""


def _build_guardrail_config() -> types.GenerateContentConfig:
    return types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.0,
        max_output_tokens=128,
    )


def _heuristic_guardrail(goal: str) -> Dict[str, str]:
    text = goal.strip()
    if not text:
        return {"status": "gibberish", "reason": "empty input"}
    unique_chars = {ch for ch in text if ch.isalpha()}
    if len(unique_chars) <= 2 and len(text) > 12:
        return {"status": "gibberish", "reason": "low-information noise"}
    abusive_tokens = {"idiot", "stupid", "dumb", "hate", "trash"}
    lowered = text.lower()
    if any(token in lowered for token in abusive_tokens):
        return {"status": "abuse", "reason": "detected abusive keyword"}
    return {"status": "ok", "reason": "heuristic pass"}


def classify_goal(
    goal: str,
    client: Optional[genai.Client],
    extract_response_text: Callable[[Any], str],
) -> Dict[str, str]:
    if not goal or not goal.strip():
        return {"status": "gibberish", "reason": "empty input"}

    if not client:
        return _heuristic_guardrail(goal)

    prompt = _build_guardrail_prompt(goal)
    try:
        response = client.models.generate_content(
            model=GUARDRAIL_MODEL,
            contents=prompt,
            config=_build_guardrail_config(),
        )
        payload = extract_response_text(response)
        data = json.loads(payload)
        raw_status = str(data.get("status", "ok")).lower()
        normalized: GuardrailStatus = "ok"
        if raw_status.startswith("gib"):
            normalized = "gibberish"
        elif raw_status.startswith("abuse") or raw_status.startswith("harass"):
            normalized = "abuse"
        reason = str(data.get("reason", "")) or ""
        return {"status": normalized, "reason": reason}
    except Exception as exc:
        logger.warning("Guardrail classification failed: %s", exc)
        return {"status": "ok", "reason": "guardrail_error"}


def gibberish_plan(language: Language, reason: Optional[str] = None) -> Dict[str, Any]:
    detail = reason or "input could not be interpreted"
    steps = {
        "en": [
            f"Signal flagged as noise: {detail}.",
            "Archive the raw payload for operator review.",
            "Request a precise objective with verbs, metrics, and timeline.",
            "Validate the refreshed brief before re-running Goal_Breaker.",
            "Resume standard planning pipeline once clarity achieved."
        ],
        "am": [
            f"ግብ እንደ ዝምብል ተታይቷል፡ {detail}.",
            "ያልተገባውን ግብ ለመርማሪያ ይመዝግቡ.",
            "በግልጽ ግምት እና ክልል ያለ አዲስ ግብ ይጠይቁ.",
            "በድጋሜ በፍጻሜ በፊት ግብን ያረጋግጡ.",
            "ግልጽነት ከተጠናቀቀ በኋላ መደበኛውን ሂደት ይቀጥሉ."
        ]
    }
    return {"steps": steps[language], "complexity": 1}


def abuse_plan(language: Language, reason: Optional[str] = None) -> Dict[str, Any]:
    detail = reason or "abusive phrasing detected"
    steps = {
        "en": [
            f"Channel secured: {detail}.",
            "Suspend tactical generation to protect operators.",
            "Issue a professionalism reminder to the requester.",
            "Require a respectful, actionable objective before reinstating access.",
            "Escalate to human review if hostile input persists."
        ],
        "am": [
            f"ግንኙነቱ ተደራጀ፤ {detail}.",
            "የታክቲክ ስራ እንዲቆም እርምጃ ይውሰዱ.",
            "ለጠየቀው የባለሙያነት ማሳሰቢያ ይላኩ.",
            "አክብሮት ያለው ግብ እስኪገባ ድረስ መዳረሻን ያግዱ.",
            "ጥልቅ እና ጠበኛ የሆነ ግብ ቢቀጥል ለሰው እንቅስቃሴ ያስገቡ."
        ]
    }
    return {"steps": steps[language], "complexity": 1}
