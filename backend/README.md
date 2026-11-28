# ResearchX backend

FastAPI service for web research, source collection and Gemini AI synthesis.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Add your API keys to `.env`. Keep this file private; it is ignored by Git.

### Search provider

Set `SEARCH_PROVIDER` to either `exa` or `tavily`.

For Exa:

```env
SEARCH_PROVIDER=exa
EXA_API_KEY=your_exa_api_key
```

For Tavily:

```env
SEARCH_PROVIDER=tavily
TAVILY_API_KEY=your_tavily_api_key
```

Only the key for the selected search provider is required. ResearchX uses Exa's Search API with highlights or Tavily's Search API, then passes the normalized source material to Gemini for synthesis.

### Gemini

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
```

Gemini is optional. Without it, the API returns the collected source summaries without AI synthesis.

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

Health check: `http://127.0.0.1:8000/api/health`

Research endpoint: `POST http://127.0.0.1:8000/api/research` with:

```json
{"query":"your research question","mode":"Research"}
```
