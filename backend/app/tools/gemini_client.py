import os
import json
import re
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types


# Load backend/.env once
BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")

DEFAULT_MODEL = "gemini-3.8-flash"

_client = None


def get_model_name() -> str:
    return os.getenv("GEMINI_MODEL", DEFAULT_MODEL)


def get_gemini_client():
    """Create the Gemini client only when it is first needed."""
    global _client

    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in backend/.env")

        _client = genai.Client(api_key=api_key)

    return _client


def _strip_code_fence(text: str) -> str:
    text = text.strip()
    match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL)
    return match.group(1) if match else text


def generate_text(prompt: str) -> str:
    response = get_gemini_client().models.generate_content(
        model=get_model_name(),
        contents=prompt
    )
    return (response.text or "").strip()


def generate_json(prompt: str, label: str) -> dict:
    """Ask Gemini for JSON and parse it safely."""
    response = get_gemini_client().models.generate_content(
        model=get_model_name(),
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )

    if not response.text:
        raise ValueError(f"Gemini returned an empty {label} response.")

    try:
        result = json.loads(_strip_code_fence(response.text))
    except json.JSONDecodeError as error:
        raise ValueError(f"Gemini returned invalid {label} JSON.") from error

    if not isinstance(result, dict):
        raise ValueError(f"Gemini returned an invalid {label} structure.")

    return result
