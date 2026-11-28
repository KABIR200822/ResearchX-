"""Fact-checker agent: checks evidence traceability, not factual truth."""
from typing import Any, Dict, List


class FactCheckerAgent:
    name = "Fact-checker"

    def run(self, findings: List[Dict[str, Any]], documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        known_ids = {document.get("id") for document in documents}
        checks = []
        for finding in findings:
            source_id = finding.get("source_id")
            has_excerpt = bool(str(finding.get("evidence_excerpt", "")).strip())
            traceable = source_id in known_ids and has_excerpt
            checks.append({
                "finding_id": finding.get("id"),
                "traceability": "traceable_to_supplied_material" if traceable else "missing_traceability",
                "factual_status": "not_independently_verified",
                "explanation": (
                    "A supplied document ID and excerpt are attached."
                    if traceable else
                    "A matching supplied document and excerpt could not be established."
                ),
            })

        return {
            "agent": self.name,
            "checks": checks,
            "overall_status": "traceability_review_only",
            "warning": (
                "This agent checks whether findings point to supplied material. "
                "It does not confirm that claims are true or perform independent cross-verification."
            ),
        }
