# ResearchX — Multi-Agent AI Research Assistant

Two parts, run in **two terminals**.

## 1. Backend (FastAPI) — port 8000

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # put your GEMINI_API_KEY here
python test_gemini.py             # optional: checks the key works
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## 2. Frontend (React + Vite) — port 5173

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and search a topic (e.g. "graph neural networks").

## Notes
- Needs internet: arXiv for papers, Gemini for analysis/report.
- A research run takes ~20–60 s (5 agents, 3 Gemini calls).
- Different backend port? Set `VITE_API_BASE` in `frontend/.env`
  and add the frontend URL to `CORS_ORIGINS` in `backend/.env`.
