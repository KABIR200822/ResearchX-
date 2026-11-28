from app.tools.gemini_client import generate_text, get_model_name

print(f"Connecting to Gemini ({get_model_name()})...")

try:
    reply = generate_text(
        "Reply with exactly: ResearchX Gemini connection successful."
    )
    print("\nGemini Response:")
    print(reply)
    print("\nGemini connection successful!")

except Exception as error:
    print("\nGemini connection failed.")
    print("Error:", error)
