# ResearchX backend

This directory keeps the original modular Python agent pipeline in `agents/` and adds the FastAPI integration in `app/`. The live API feeds Tavily-retrieved source material through the existing specialist agents, then uses Gemini for source-grounded synthesis.

## Existing agent modules

- `agents/researcher.py` — scopes a question and registers retrieved or supplied documents.
- `agents/analyst.py` — extracts traceable observations from source excerpts.
- `agents/fact_checker.py` — checks evidence traceability, not factual truth.
- `agents/report_writer.py` — creates a transparent draft from the agent observations.
- `agents/orchestrator.py` — retains the original offline orchestrator for local testing.

## Live API providers

- **Tavily** retrieves web sources.
- **Google Gemini** creates search directions and synthesises the retrieved material.
- **ReportLab** exports the report and source links as PDF.

## Setup

Run these commands from the repository root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set your own `TAVILY_API_KEY`, `GEMINI_API_KEY`, and optionally `GEMINI_MODEL` in `backend/.env`. Do not commit that file or place keys in frontend code.

Start the service from the `backend` directory:

```bash
uvicorn app.main:app --reload --port 8000
```

- Health: `http://localhost:8000/api/health`
- Interactive API docs: `http://localhost:8000/docs`

## Routes

- `GET /api/health` — provider configuration status, without exposing keys.
- `POST /api/research` — multi-query Tavily retrieval, specialist-agent traceability checks, Gemini synthesis and structured report response.
- `POST /api/research/pdf` — PDF export of a generated report and source list.

## Important limitations

- The fact-checker checks traceability to retrieved excerpts; it does not establish factual truth.
- Gemini synthesis is not an independent review. Verify important claims against the linked sources.
- Uploaded PDFs are currently previewed in the browser only. PDF upload, extraction and OCR are not connected to this API.
- The original `ResearchOrchestrator` remains available as an offline starter; the live FastAPI route uses the specialist agent modules with retrieved Tavily source records.
