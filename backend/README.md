# ResearchX Backend (FastAPI)

## Run (Mac / Linux)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env        # then put your real GEMINI_API_KEY in .env

uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs to try the API.

Windows: use `venv\Scripts\activate` and `copy .env.example .env`.

## Endpoints

| Method | Path | What it does |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/research` | Body `{"query": "..."}` → runs all 5 agents |
| GET | `/api/research/history` | List of past research |
| GET | `/api/research/{id}` | Full saved result |

## Quick checks

```bash
python test_gemini.py        # Gemini key + model working?
python test_analysis.py
python test_fact_checker.py
python test_report.py
```

`researchx.db` (SQLite) is created automatically on first start.
