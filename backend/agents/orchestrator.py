"""Coordinates the five ResearchX agent modules in a predictable sequence."""
from typing import Any, Dict, List

from .researcher import ResearcherAgent
from .analyst import AnalystAgent
from .fact_checker import FactCheckerAgent
from .report_writer import ReportWriterAgent


class ResearchOrchestrator:
    """Runs Researcher -> Analyst -> Fact-checker -> Report Writer.

    The orchestrator is the fifth Python module/agent component. The four
    specialist agents remain independently callable and replaceable.
    """

    def __init__(self) -> None:
        self.researcher = ResearcherAgent()
        self.analyst = AnalystAgent()
        self.fact_checker = FactCheckerAgent()
        self.report_writer = ReportWriterAgent()

    def run(
        self,
        question: str,
        documents: List[Dict[str, Any]] | None = None,
    ) -> Dict[str, Any]:
        research = self.researcher.run(question, documents)
        supplied_documents = research["documents"]
        analysis = self.analyst.run(question, supplied_documents)
        verification = self.fact_checker.run(analysis["findings"], supplied_documents)
        report = self.report_writer.run(question, analysis, verification, supplied_documents)

        return {
            "question": question,
            "stages": [research, analysis, verification, report],
            "research": research,
            "analysis": analysis,
            "verification": verification,
            "report": report,
            "limitations": [
                "Offline starter implementation; no live web retrieval.",
                "No PDF parsing or OCR is included.",
                "Fact-checking is limited to evidence traceability; factual truth is not independently verified.",
            ],
        }
