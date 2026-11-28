# ResearchX Python agents (starter)

The `agents/` package contains five Python modules:
- `researcher.py` — scopes a question and registers supplied documents.
- `analyst.py` — extracts cautious, excerpt-level observations.
- `fact_checker.py` — checks traceability to supplied material.
- `report_writer.py` — creates a Markdown research brief.
- `orchestrator.py` — coordinates the four specialist agents.

## Quick test

Run from the `rx_sidebar_update` project directory:

```bash
python - <<'PY'
from backend.agents import ResearchOrchestrator

result = ResearchOrchestrator().run(
    "What are the uses and limitations of machine learning?",
    documents=[{
        "id": "DOC-001",
        "title": "Example notes",
        "content": "Machine learning systems learn patterns from data. "
                   "Their performance depends on data quality and evaluation."
    }]
)
print(result["report"]["markdown"])
PY
```

This is a backend starter, not connected to the React frontend. It uses no API keys
or third-party Python packages. It does not perform live search, PDF extraction,
source authentication, or independent factual verification.
