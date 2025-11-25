import copy
import json
import logging
import os
import random
import time
from functools import lru_cache
from typing import Any, Dict, List, Optional, Literal, Callable

from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

TEMPERATURE = float(os.getenv("GEMINI_TEMPERATURE", "0.1"))
MAX_OUTPUT_TOKENS = int(os.getenv("GEMINI_MAX_OUTPUT_TOKENS", "512"))
MAX_RETRIES = int(os.getenv("GEMINI_MAX_RETRIES", "3"))
BASE_RETRY_DELAY = float(os.getenv("GEMINI_RETRY_BASE_DELAY", "1.0"))

# Allow ops to override model priority without code changes
DEFAULT_MODEL_CHAIN = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash"
]

Language = Literal["en", "am"]

def _get_model_chain() -> List[str]:
    raw = os.getenv("GEMINI_MODEL_CHAIN")
    if raw:
        chain = [m.strip() for m in raw.split(",") if m.strip()]
        if chain:
            return chain
    return DEFAULT_MODEL_CHAIN


def _normalize_language(language: str) -> Language:
    return "am" if language and language.lower().startswith("am") else "en"


def _build_prompt(goal: str, language: Language) -> str:
    goal_clean = goal.strip()
    if not goal_clean:
        raise ValueError("Goal cannot be empty")
    prompt = f"""
You are an elite strategic planner and tactical operations officer.
Your mission is to break down a vague user goal into exactly 5 high-impact, actionable, and chronologically ordered steps.

Goal: "{goal_clean}"

Instructions:
1. Analyze the goal to understand the core objective and implied constraints.
2. Determine the complexity level (1-10) based on resource requirements, time, and skill.
3. Formulate 5 distinct steps. Each step must be:
   - Action-oriented (start with a strong verb).
   - Specific and measurable.
   - Logical in sequence (Step 1 leads to Step 2, etc.).
   - "Dark Technical" in tone (concise, professional, no fluff).

Output strictly valid JSON in this format:
{{
    "steps": ["step1", "step2", "step3", "step4", "step5"],
    "complexity": <integer between 1-10>
}}
"""
    if language == "am":
        prompt += "\nWhen responding, return the same JSON structure but write every step description in modern Amharic while keeping the Dark Technical tone concise and precise."
    return prompt


def _build_generation_config() -> types.GenerateContentConfig:
    return types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=TEMPERATURE,
        max_output_tokens=MAX_OUTPUT_TOKENS,
    )


def _call_model(model: str, prompt: str, parser_func: Callable[[str], Dict[str, Any]]) -> Dict[str, Any]:
    last_exc: Optional[Exception] = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=_build_generation_config(),
            )
            payload = _extract_response_text(response)
            return parser_func(payload)
        except Exception as exc:
            last_exc = exc
            if not _is_rate_limit_error(exc) or attempt == MAX_RETRIES:
                logger.warning("Gemini model %s failed: %s", model, exc)
                raise
            backoff = BASE_RETRY_DELAY * (2 ** (attempt - 1)) + random.uniform(0, 0.5)
            logger.warning(
                "Gemini rate limit hit on %s (attempt %s/%s). Retrying in %.2fs",
                model,
                attempt,
                MAX_RETRIES,
                backoff,
            )
            time.sleep(backoff)

    # Should never hit due to raise above but keeps type checker satisfied
    raise last_exc if last_exc else RuntimeError("Unknown Gemini failure")


def _extract_response_text(response: Any) -> str:
    if response is None:
        raise ValueError("Gemini returned empty response")

    text = getattr(response, "text", None)
    if isinstance(text, str) and text.strip():
        return text

    candidates = getattr(response, "candidates", None) or []
    parts: List[str] = []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        if not content:
            continue
        for part in getattr(content, "parts", []) or []:
            part_text = getattr(part, "text", None)
            if isinstance(part_text, str) and part_text.strip():
                parts.append(part_text)
    if parts:
        return "\n".join(parts)

    raise ValueError("Gemini response contained no text payload")


def _safe_parse_response(payload: str, goal: str, language: Language) -> Dict[str, Any]:
    try:
        data = json.loads(payload)
        if not isinstance(data, dict):
            raise ValueError("Gemini response is not an object")
        steps = data.get("steps")
        complexity = data.get("complexity")
        if not isinstance(steps, list) or len(steps) != 5:
            raise ValueError("Gemini response must include exactly 5 steps")
        if not all(isinstance(step, str) and step.strip() for step in steps):
            raise ValueError("Each step must be a non-empty string")
        if not isinstance(complexity, int) or not 1 <= complexity <= 10:
            raise ValueError("Complexity must be an integer between 1 and 10")
        return {"steps": steps, "complexity": complexity}
    except Exception as exc:
        logger.error("Failed to parse Gemini response: %s", exc)
        return _offline_plan(goal, language)


def _safe_parse_sub_response(payload: str, language: Language) -> Dict[str, Any]:
    try:
        data = json.loads(payload)
        substeps = data.get("substeps")
        if not isinstance(substeps, list):
            raise ValueError("Missing substeps list")
        return {"substeps": [str(s) for s in substeps[:3]]}
    except Exception as exc:
        logger.error("Failed to parse Gemini sub-response: %s", exc)
        return _offline_substeps(language)


def _is_rate_limit_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return "429" in message or "rate limit" in message or "resource_exhausted" in message


def _offline_plan(goal: str, language: Language) -> Dict[str, Any]:
    # Provide deterministic yet goal-aware fallbacks so UX still works offline
    goal_lower = goal.lower()
    if "launch" in goal_lower or "deploy" in goal_lower:
        steps = {
            "en": [
                "Audit launch prerequisites, key dependencies, and regulatory blockers.",
                "Build and validate an execution playbook with timeline gates.",
                "Stage infrastructure and rehearsal environments for dry runs.",
                "Run limited-scope launch rehearsal capturing telemetry and gaps.",
                "Green-light full launch with war-room monitoring and postmortem plan."
            ],
            "am": [
                "የመጀመሪያ አስፈላጊዎችን፣ ቁልፍ ጥገኞችን እና የህጋዊ ግዴታዎችን ይፈትሹ።",
                "ጊዜ ማዕቀፍ ያላቸው ደረጃዎችን የሚያካትት የእንቅስቃሴ መመዝገብ ይዘጋጁ።",
                "ተግባራዊ መድረኮችን እና ሙከራ አካባቢዎችን ይዘጋጁ።",
                "ገደብ ያለው የሙከራ እንቅስቃሴ አስኬዱ እና ቴሌሜትሪ ይያዙ።",
                "በዋር-ሩም መቆጣጠሪያ ጋር ሙሉ ማስጀመሪያን ይፈቅዱ እና ድጋሜ እቅድ ያቅርቡ።"
            ]
        }
    elif "research" in goal_lower or "analyze" in goal_lower:
        steps = {
            "en": [
                "Define research hypotheses, success metrics, and scope boundaries.",
                "Collect and normalize critical datasets or expert interviews.",
                "Synthesize findings into structured frameworks and models.",
                "Pressure-test insights with stakeholders for blind spots.",
                "Publish decision-ready brief with recommended actions."
            ],
            "am": [
                "የምርምር ግምቶችን፣ የስኬት መለኪያዎችን እና የስፋት መስመሮችን ይግለጹ።",
                "አስፈላጊ ውሂብን ወይም ባለሙያ ቃለ መጠይቆችን ይሰብስቡ እና ያስመዝግቡ።",
                "ግኝቶችን ወደ ተዋቋማ መዋቅሮችና ሞዴሎች ይቀይሩ።",
                "ከተፈላጊ ተሳታፊዎች ጋር ጉድለቶችን ይፈትኑ።",
                "የውሳኔ ዝግጅት የሆነ ሪፖርት ከምክሮች ጋር ይዘጋጁ።"
            ]
        }
    else:
        steps = {
            "en": [
                "Define scope, success metrics, and constraints for the goal.",
                "Map critical resources, tools, and personnel needed.",
                "Develop a sequenced execution playbook with owners.",
                "Instrument telemetry to monitor progress in real-time.",
                "Run post-action review and iterate on next objectives."
            ],
            "am": [
                "የግብ ድርሻ፣ የስኬት መለኪያዎችን እና ገደቦችን ይግለጹ።",
                "አስፈላጊ ሀብቶችን፣ መሣሪያዎችን እና ተጠሪዎችን ይካዩ።",
                "ተከታታይ የእንቅስቃሴ መመዝገብ ከባለሥልጣኖች ጋር ይዘጋጁ።",
                "ሂደቱን በቀጥታ ለመመርመር ቴሌሜትሪ ይጫኑ።",
                "ከተፈፀመ በኋላ ግምገማ አድርጉ እና ቀጣይ ግቦችን ይዘጋጁ።"
            ]
        }
    return {
        "steps": steps[language],
        "complexity": 5
    }


def _offline_substeps(language: Language) -> Dict[str, Any]:
    if language == "am":
        return {"substeps": ["ንዑስ ሲስተሙን ያስነሱ.", "ፕሮቶኮሎችን በቅድሚያ አስኪዱ.", "ውጤቱን ያረጋግጡ እና ይህበሩ."]}
    return {"substeps": ["Initialize subsystem.", "Execute protocol.", "Verify status."]}


@lru_cache(maxsize=256)
def _generate_breakdown_cached(goal: str, language: Language) -> Dict[str, Any]:
    prompt = _build_prompt(goal, language)
    if not client:
        return _offline_plan(goal, language)

    for model in _get_model_chain():
        try:
            parser = lambda payload, _goal=goal, _lang=language: _safe_parse_response(payload, _goal, _lang)
            result = _call_model(model, prompt, parser)
            logger.debug("Gemini model %s succeeded", model)
            return result
        except Exception as exc:
            logger.info("Model %s failed with %s; attempting next fallback", model, exc)
            continue
    logger.error("All Gemini models failed; returning offline fallback")
    return _offline_plan(goal, language)


def generate_breakdown(goal: str, language: str = "en") -> Dict[str, Any]:
    normalized_language = _normalize_language(language)
    return copy.deepcopy(_generate_breakdown_cached(goal, normalized_language))


@lru_cache(maxsize=512)
def _generate_sub_breakdown_cached(step: str, language: Language) -> Dict[str, Any]:
    prompt = _build_sub_prompt(step, language)
    if not client:
        return _offline_substeps(language)

    for model in _get_model_chain():
        try:
            parser = lambda payload, _lang=language: _safe_parse_sub_response(payload, _lang)
            result = _call_model(model, prompt, parser)
            return result
        except Exception:
            continue
    return _offline_substeps(language)


def _build_sub_prompt(step: str, language: Language) -> str:
    if language == "am":
        return f"""
Break this single step into 3 tactical sub-actions.
Step: "{step}"
Return only JSON: {{ "substeps": ["sub1", "sub2", "sub3"] }}
Tone: Dark, technical, concise (max 12 words per substep).
When responding, keep the JSON schema identical but write each substep in modern Amharic while preserving the same concise tone.
"""
    return f"""
    Break this single step into 3 tactical sub-actions.
    Step: "{step}"
    Return only JSON: {{ "substeps": ["sub1", "sub2", "sub3"] }}
    Tone: Dark, technical, concise (max 12 words per substep).
    """


def generate_sub_breakdown(step: str, language: str = "en") -> Dict[str, Any]:
    normalized_language = _normalize_language(language)
    return copy.deepcopy(_generate_sub_breakdown_cached(step, normalized_language))
