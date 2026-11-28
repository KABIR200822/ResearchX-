# ResearchX Development Plan

## Strategy

Complete and connect the frontend using deterministic mock services first. Integrate live APIs only after the application workflow, data contracts, and frontend acceptance tests are complete.

## Phases

1. **Frontend foundation** — preserve the current landing page, workspace, responsive styling, neon prompt treatment, and interactive dotted background.
2. **Workspace functionality** — finish chat lifecycle, sidebar recovery, history search, preferences, attachment lifecycle, loading/error states, and persistence.
3. **Research workflow** — define one research-session lifecycle spanning source collection, papers, findings, verification, and report generation.
4. **Modules** — complete Source Explorer, Paper Reader, Findings Explorer, Verification Centre, and Report Studio.
5. **Application integration** — connect modules through shared session/document/source/finding/evidence/report models and a mock research service.
6. **API contracts** — define request/response schemas, validation, errors, status updates, and upload behaviour before implementation of real services.
7. **Testing** — exercise the full user journey, refresh persistence, invalid/large PDFs, export, responsive layouts, and production build.
8. **API integration** — replace mock adapters with real backend services without redesigning or rewriting the UI.

## Mandatory product requirements

- Search and retrieve information from multiple sources.
- Read and analyse research papers and PDFs.
- Extract important findings and insights.
- Cross-verify information and identify contradictions.
- Generate structured reports with source citations.

A requirement is complete only when demonstrated end-to-end with real services and traceable evidence, not merely represented by a UI tab.

## Planned shared data model

- `ResearchSession`: id, title, question, mode, status, createdAt, updatedAt
- `ResearchMessage`: id, sessionId, role, content, createdAt
- `ResearchSource`: id, sessionId, url, title, publisher, author, publishedAt, retrievedAt, excerpt, contentStatus
- `ResearchDocument`: id, sessionId, filename, mimeType, size, checksum, storageKey, pageCount, extractionStatus
- `ResearchFinding`: id, sessionId, statement, findingType, sourceIds, documentPageRefs, confidence, limitations
- `EvidenceLink`: id, findingId, sourceId/documentId, relation, quotedText, pageNumber, rationale
- `VerificationResult`: id, findingId, status, supportingEvidenceIds, contradictingEvidenceIds, contextEvidenceIds, explanation
- `ResearchReport`: id, sessionId, sections, findingIds, citationIds, status, generatedAt

These are planned contracts, not claims about existing runtime functionality.

## Live API integration status

The `feature/live-research-integration` branch adds the first live integration pass while retaining the root React/Vite application and the existing `backend/agents` package:

- Tavily multi-query retrieval is connected to the Researcher stage.
- Retrieved excerpts are registered and checked for traceability by the existing Python agent modules.
- Gemini plans searches and generates a source-grounded structured report.
- The existing workspace displays live source references and findings.
- ReportLab exports the report and source list to PDF.

Still outstanding: PDF upload/extraction/OCR, durable document storage, independent source authentication, citation-support validation, and full end-to-end local testing.
