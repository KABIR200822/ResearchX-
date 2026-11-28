"""Researcher agent: prepares a source-collection plan and records supplied material.

This starter does not browse the web. Pass real retrieved documents to ``run``
when a retrieval service is connected.
"""
from typing import Any, Dict, List


class ResearcherAgent:
    name = "Researcher"

    def run(self, question: str, documents: List[Dict[str, Any]] | None = None) -> Dict[str, Any]:
        question = (question or "").strip()
        if not question:
            raise ValueError("A research question is required.")

        supplied = documents or []
        records = []
        for index, document in enumerate(supplied, start=1):
            records.append({
                "id": document.get("id", f"DOC-{index:03d}"),
                "title": document.get("title", f"User supplied document {index}"),
                "content": document.get("content", ""),
                "origin": document.get("origin", "user_supplied"),
                "url": document.get("url"),
            })

        return {
            "agent": self.name,
            "question": question,
            "research_plan": [
                f"Define the scope and key terms for: {question}",
                "Collect relevant primary and secondary sources.",
                "Record publication details and source provenance.",
                "Extract passages that directly address the research question.",
            ],
            "documents": records,
            "status": "materials_ready" if records else "awaiting_sources",
            "note": (
                "Only supplied documents are included. No live web search was performed."
                if not records else
                "Documents were supplied to the agent; their contents have not been independently authenticated."
            ),
        }
