import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def generate_breakdown(goal: str):
    if not api_key:
        # Mock response for development if no key provided
        return {
            "steps": [
                "Analyze the market landscape and identify key competitors.",
                "Define the Minimum Viable Product (MVP) core features.",
                "Develop a high-fidelity prototype for user testing.",
                "Launch a beta version to a select group of early adopters.",
                "Iterate based on feedback and prepare for full public launch."
            ],
            "complexity": 5
        }

    # Use Gemini 1.5 Pro for better reasoning
    model = genai.GenerativeModel('gemini-1.5-pro',
        generation_config={"response_mime_type": "application/json"}
    )
    
    prompt = f"""
    You are an elite tactical planner. Break down this goal into exactly 5 actionable, high-impact steps.
    Goal: "{goal}"
    
    Return strictly this JSON structure:
    {{
        "steps": ["step1", "step2", "step3", "step4", "step5"],
        "complexity": <integer between 1-10>
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini Error: {e}")
        # Fallback in case of error
        return {
            "steps": ["Error generating steps. Please try again.", "Check API Key.", "Check Quota.", "Retry.", "Contact Support."],
            "complexity": 0
        }
