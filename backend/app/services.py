import copy
import json
import logging
import os
import random
import time
from functools import lru_cache
from typing import Any, Dict, List, Optional

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
    "gemini-3-pro-latest",   # flagship reasoning (Nov 2025 docs)
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash"
]

def _get_model_chain() -> List[str]:
    raw = os.getenv("GEMINI_MODEL_CHAIN")
    if raw:
        chain = [m.strip() for m in raw.split(",") if m.strip()]
        if chain:
            return chain
    return DEFAULT_MODEL_CHAIN


def _build_prompt(goal: str) -> str:
    goal_clean = goal.strip()
    if not goal_clean:
        raise ValueError("Goal cannot be empty")
    return f"""
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


def _build_generation_config() -> types.GenerateContentConfig:
    return types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=TEMPERATURE,
        max_output_tokens=MAX_OUTPUT_TOKENS,
    )


def _call_model(model: str, prompt: str, parser_func) -> Dict[str, Any]:
    last_exc: Optional[Exception] = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=_build_generation_config(),
            )
            return parser_func(response.text)
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


def _safe_parse_response(payload: str, goal: str) -> Dict[str, Any]:
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
        return _offline_plan(goal)


def _safe_parse_sub_response(payload: str) -> Dict[str, Any]:
    try:
        data = json.loads(payload)
        substeps = data.get("substeps")
        if not isinstance(substeps, list):
             raise ValueError("Missing substeps list")
        return {"substeps": [str(s) for s in substeps[:3]]}
    except Exception as exc:
        logger.error("Failed to parse Gemini sub-response: %s", exc)
        return {"substeps": ["Initialize subsystem.", "Execute protocol.", "Verify status."]}


def _is_rate_limit_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return "429" in message or "rate limit" in message or "resource_exhausted" in message


def _offline_plan(goal: str) -> Dict[str, Any]:
    # Provide deterministic yet goal-aware fallbacks so UX still works offline
    goal_lower = goal.lower()
    if "launch" in goal_lower or "deploy" in goal_lower:
        steps = [
            "Audit launch prerequisites, key dependencies, and regulatory blockers.",
            "Build and validate an execution playbook with timeline gates.",
            "Stage infrastructure and rehearsal environments for dry runs.",
            "Run limited-scope launch rehearsal capturing telemetry and gaps.",
            "Green-light full launch with war-room monitoring and postmortem plan."
        ]
    elif "research" in goal_lower or "analyze" in goal_lower:
        steps = [
            "Define research hypotheses, success metrics, and scope boundaries.",
            "Collect and normalize critical datasets or expert interviews.",
            "Synthesize findings into structured frameworks and models.",
            "Pressure-test insights with stakeholders for blind spots.",
            "Publish decision-ready brief with recommended actions."
        ]
    else:
        steps = [
            "Define scope, success metrics, and constraints for the goal.",
            "Map critical resources, tools, and personnel needed.",
            "Develop a sequenced execution playbook with owners.",
            "Instrument telemetry to monitor progress in real-time.",
            "Run post-action review and iterate on next objectives."
        ]
    return {
        "steps": steps,
        "complexity": 5
    }


@lru_cache(maxsize=128)
def _generate_breakdown_cached(goal: str) -> Dict[str, Any]:
    prompt = _build_prompt(goal)
    if not client:
        return _offline_plan(goal)

    for model in _get_model_chain():
        try:
            parser = lambda payload, _goal=goal: _safe_parse_response(payload, _goal)
            result = _call_model(model, prompt, parser)
            logger.debug("Gemini model %s succeeded", model)
            return result
        except Exception as exc:
            logger.info("Model %s failed with %s; attempting next fallback", model, exc)
            continue
    logger.error("All Gemini models failed; returning offline fallback")
    return _offline_plan(goal)


def generate_breakdown(goal: str) -> Dict[str, Any]:
    # Return a copy so callers cannot mutate the cached payload
    return copy.deepcopy(_generate_breakdown_cached(goal))


@lru_cache(maxsize=256)
def _generate_sub_breakdown_cached(step: str) -> Dict[str, Any]:
    prompt = f"""
    Break this single step into 3 tactical sub-actions.
    Step: "{step}"
    Return only JSON: {{ "substeps": ["sub1", "sub2", "sub3"] }}
    Tone: Dark, technical, concise (max 12 words per substep).
    """
    if not client:
        return {"substeps": ["Initialize subsystem.", "Execute protocol.", "Verify status."]}

    for model in _get_model_chain():
        try:
            result = _call_model(model, prompt, _safe_parse_sub_response)
            return result
        except Exception:
            continue
    return {"substeps": ["Initialize subsystem.", "Execute protocol.", "Verify status."]}


def generate_sub_breakdown(step: str) -> Dict[str, Any]:
    return copy.deepcopy(_generate_sub_breakdown_cached(step))
