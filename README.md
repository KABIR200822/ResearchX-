# ResearchX — Consolidated Frontend Baseline

This repository is the consolidated frontend baseline for ResearchX. It is based on the latest cumulative Report Studio v8 workspace, not an older intermediate ZIP.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
npm run preview
```

## Current frontend capabilities

- Existing ResearchX landing page and workspace visual design
- Interactive full-window dotted background and prompt-card neon treatment
- Collapsible sidebar with a persistent reopen control
- New chat, recent conversation list, search, and simulated research progress
- Research and Web mode selection, model preference selection, and capability prompt starters
- PDF selection and in-session browser PDF preview
- Research workspace tabs: Overview, Sources, Papers, Findings, Verification, Report
- Manually captured evidence entries with stance labels and browser-local persistence
- Report preview populated from manually captured evidence and Markdown export

## Important current limitations

The React/Vite frontend now connects to an optional FastAPI service for live Tavily web retrieval, Gemini research synthesis, and PDF report export. Automatic PDF text extraction/OCR and independent source authentication are not implemented. AI-generated findings and citations must be checked against the linked sources.

Conversation metadata and evidence entries use `localStorage`. PDF previews currently use temporary object URLs and selected files are not durably stored across refreshes. That is a known task for the next frontend functionality pass (IndexedDB-backed document storage).

Research progress and agent stages are simulated. They must remain clearly labelled as previews until the real backend is integrated.

## Project principles

1. Preserve the existing visual design; make incremental changes only.
2. Keep API keys out of the frontend and out of Git.
3. Build and test each module with mock data before connecting external services.
4. Keep mock-service interfaces aligned with the API contracts planned for the final integration phase.
5. Never present mock output, manually assigned evidence labels, or unverified references as real research results.

See `docs/DEVELOPMENT-PLAN.md` for the staged roadmap and `docs/FRONTEND-STATUS.md` for the current acceptance checklist.

### v10 update
Research progress is displayed as a vertical, connected step timeline. The existing agent stages, status logic, workspace layout and visual theme are retained.


### v12 — Report typography
Refined generated-report typography with stronger editorial hierarchy, more readable body copy, improved line spacing, and responsive type sizing. Workspace UI typography and layout remain unchanged.


### v13 — Output typography matched to reference
Report titles now use a large, heavy, high-contrast sans-serif display style. Supporting copy uses a smaller, muted grey sans-serif style with comfortable line spacing, matching the supplied reference. Workspace controls and layout are unchanged.


## v15 — Modular offline agent pipeline
The four agent roles now run through a modular local pipeline with structured outputs and a stable adapter contract for final API integration. The UI exposes each completed agent's structured output. This remains an offline mock: no web retrieval, PDF text extraction, AI reasoning, factual verification or citations are performed.


## v16 — Offline mock evidence pipeline
Adds a substantive, bundled AI topic demo pack so the Researcher, Analyst, Fact-checker and Report Writer pass structured content between stages. The report now renders explanatory sections and findings, shows demo material provenance, and explicitly distinguishes illustrative local content from verified sources. Unsupported topics receive a research brief rather than fabricated findings.


## Deploy to Vercel

This project includes `vercel.json` and a Vite base-path switch:
- Vercel builds use `/` as the asset base.
- GitHub Pages builds keep `/ResearchX/`.

### Deploy with the Vercel dashboard

1. Push this project folder to a GitHub repository.
2. Open https://vercel.com/new and import that repository.
3. Set **Root Directory** to `rx_sidebar_update` if this folder is inside a larger repository. If you upload/import this folder as the repository root, leave Root Directory as `.`.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Click **Deploy**.

The included `vercel.json` already defines the build, output directory and SPA fallback rewrite.

### Deploy from the terminal

From this project folder:

```bash
npm install
npm run build
npx vercel
```

Follow the prompts, then run `npx vercel --prod` for production deployment.

### Current scope

This is a static React/Vite frontend using local mock research data. Vercel deployment does not add live AI research, web search, backend APIs, or persistent user accounts. Browser-local data remains local to each visitor's browser.

## Live research API integration

The frontend remains at the repository root. The Python API is a separate service in `backend/`; it does not replace the existing React workspace or modular demo pipeline.

### Providers

- **Tavily** retrieves web sources for the Researcher stage.
- **Google Gemini** plans search directions and synthesises retrieved source material into the existing report structure.
- **ReportLab** exports the generated report and source links as a PDF.

### Configure the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Add your own `TAVILY_API_KEY` and `GEMINI_API_KEY` to `backend/.env`. Keep this file private and out of Git.

Start the API from the repository root:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

API health and interactive docs:

- `http://localhost:8000/api/health`
- `http://localhost:8000/docs`

### Configure the frontend

Create a root `.env` file containing:

```env
VITE_API_URL=http://localhost:8000
```

Then, in a second terminal from the repository root:

```bash
npm install
npm run dev
```

### API endpoints

- `GET /api/health` — provider configuration status (never returns API keys).
- `POST /api/research` — Tavily retrieval and Gemini synthesis using the workspace research-pipeline response shape.
- `POST /api/research/pdf` — export the structured report and source list as a PDF.

### Deployment note

The included Vercel configuration deploys the static Vite frontend only. Deploy the FastAPI service separately, then set the Vercel environment variable `VITE_API_URL` to the deployed API origin and configure `FRONTEND_ORIGINS` on the backend.

### Remaining research limitations

- Uploaded PDFs are previewed in the browser but are not yet uploaded to or extracted by the backend.
- Gemini source-based synthesis is not an independent fact-check.
- Source quality, publication status and citation support still require human review.
