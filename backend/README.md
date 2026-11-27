# ResearchX backend

FastAPI service for web research, source collection and AI synthesis.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Add your own `TAVILY_API_KEY` and `GEMINI_API_KEY` to `.env`. Keep `.env` private; it is ignored by Git. Tavily is required for web search. Gemini is optional: without it, the API returns the collected source summaries without AI synthesis.

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

Health check: `http://127.0.0.1:8000/api/health`

Research endpoint: `POST http://127.0.0.1:8000/api/research` with:

```json
{"query":"your research question","mode":"Research"}
```
