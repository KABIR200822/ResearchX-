"""Report writer agent: composes a transparent Markdown research draft."""
from typing import Any, Dict, List


class ReportWriterAgent:
    name = "Report Writer"

    def run(
        self,
        question: str,
        analysis: Dict[str, Any],
        verification: Dict[str, Any],
        documents: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        findings = analysis.get("findings", [])
        lines = [
            f"# Research brief: {question}",
            "",
            "## Executive summary",
            analysis.get("summary", "No analysis summary is available."),
            "",
            "## Findings",
        ]

        if findings:
            for finding in findings:
                lines.extend([
                    f"### {finding.get('id', 'Finding')}",
                    finding.get("statement", "No statement supplied."),
                    "",
                    f"> Evidence excerpt: {finding.get('evidence_excerpt', 'No excerpt available')}",
                    "",
                    f"Source ID: `{finding.get('source_id') or 'not supplied'}`",
                    "",
                ])
        else:
            lines.append("No findings were generated from the supplied material.")

        lines.extend([
            "## Source inventory",
            *(
                [f"- `{doc.get('id')}` — {doc.get('title', 'Untitled document')}" for doc in documents]
                or ["- No source documents were supplied."]
            ),
            "",
            "## Verification and limitations",
            verification.get("warning", "No verification information is available."),
            "",
            "**Important:** This is a draft based only on supplied material. "
            "No live web research, source authentication, or independent factual verification was performed.",
        ])

        return {
            "agent": self.name,
            "title": f"Research brief: {question}",
            "markdown": "\n".join(lines),
            "status": "draft",
        }
