"""Analyst agent: extracts structured observations from supplied documents."""
from typing import Any, Dict, List


class AnalystAgent:
    name = "Analyst"

    def run(self, question: str, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        findings = []
        for index, document in enumerate(documents, start=1):
            content = " ".join(str(document.get("content", "")).split())
            if not content:
                continue
            # Deliberately conservative starter: record source excerpts as observations,
            # rather than inventing conclusions from absent or unparsed content.
            excerpt = content[:600]
            findings.append({
                "id": f"F-{index:03d}",
                "statement": f"Relevant material is present in {document.get('title', 'the supplied document')}.",
                "evidence_excerpt": excerpt,
                "source_id": document.get("id"),
                "analysis_status": "excerpt_only",
                "limitations": "This is an excerpt-level observation, not a validated research conclusion.",
            })

        return {
            "agent": self.name,
            "question": question,
            "findings": findings,
            "summary": (
                f"Analysed {len(findings)} supplied document(s)."
                if findings else
                "No readable document text was supplied; no substantive findings were generated."
            ),
        }
