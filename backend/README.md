# ResearchX backend

FastAPI service for web research, Gemini synthesis and downloadable PDF reports.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Add your API keys to `.env`. Keep this file private; it is ignored by Git.

## API configuration

ResearchX uses **Tavily** to discover web sources and **Gemini** to plan searches, summarize evidence and write the final report.

```env
TAVILY_API_KEY=your_tavily_api_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

Health check: `http://127.0.0.1:8000/api/health`

Research endpoint: `POST /api/research`

```json
{"query":"your research question","mode":"Research"}
```

PDF export: `POST /api/research/pdf`. Send the research query, generated Markdown report and source list. The endpoint returns an A4 PDF attachment.
