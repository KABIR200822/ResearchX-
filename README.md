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

This is a frontend prototype. It does not yet perform live web retrieval, AI reasoning, automatic PDF text extraction, OCR, source authentication, automatic contradiction detection, or verified citation generation.

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
