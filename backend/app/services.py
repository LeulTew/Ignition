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

    # Use Gemini 2.0 Flash Experimental (Latest available)
    model = genai.GenerativeModel('gemini-2.0-flash-exp',
        generation_config={"response_mime_type": "application/json"}
    )
    
    # Chain of Thought Prompting for better grounding
    prompt = f"""
    You are an elite strategic planner and tactical operations officer.
    Your mission is to break down a vague user goal into exactly 5 high-impact, actionable, and chronologically ordered steps.
    
    Goal: "{goal}"
    
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
