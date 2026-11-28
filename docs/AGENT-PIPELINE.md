# ResearchX v16 — offline mock evidence pipeline

## Purpose
Demonstrate the complete data flow from a research question to a substantive report without connecting external APIs.

## Included demo knowledge pack
The local demo corpus includes an introductory Artificial Intelligence topic pack. When the question matches AI / artificial intelligence, the pipeline returns:
- A set of locally bundled illustrative knowledge cards.
- Five structured findings.
- Topic-specific explanatory sections covering definition, branches, operation, applications and limitations.
- A traceability review that explicitly leaves claims unverified.
- A report composed from the Analyst output.

The demo cards are synthetic local content, not external publications. They must not be represented as citations or as independently verified research.

## Other topics
For topics without a bundled demo pack, the pipeline generates a research brief, research questions and an analysis plan. It does not fabricate topic-specific findings.

## Agent responsibilities
1. Researcher: selects the local demo pack and returns demo material records / search plan.
2. Analyst: transforms the selected material into structured findings and report sections.
3. Fact-checker: checks traceability metadata and marks claims as not independently verified. It does not assert factual truth.
4. Report writer: synthesises the Analyst output and includes provenance and limitations.

## API replacement contract
`runMockResearchPipeline({ question, documents, options })` returns `stages`, `report`, `limitations` and document metadata. Replace the mock implementation with a real backend adapter while preserving the response shape.

## Current limitations
- No live web retrieval.
- No external publications or real citations.
- No PDF text extraction; uploaded files are only inventoried.
- No independent fact-checking.
- The demo AI pack is illustrative and intended to test the UI/data flow.
