# ResearchX

ResearchX is an AI-assisted research workspace with a React frontend and a FastAPI backend.

## Project structure

- `frontend/` — React + Vite interface
- `backend/` — FastAPI research API using Tavily for web search and Gemini for planning and synthesis

## Run locally

### 1. Start the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Add your API keys to `backend/.env`:

- `TAVILY_API_KEY` — required for web search
- `GEMINI_API_KEY` — enables AI search planning and report synthesis

Then start the API:

```bash
uvicorn app.main:app --reload --port 8000
```

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend uses `http://localhost:8000` by default. Set `VITE_API_URL` in `frontend/.env` if your backend runs elsewhere.

API health check: `http://localhost:8000/api/health`
