
from app.agents.report_agent import generate_report

test_papers = [
    {
        "paper_id": "paper-001",
        "title": "Artificial Intelligence in Healthcare",
        "authors": ["Research Author"],
        "published": "2025",
        "source_url": "https://example.com/paper1",
        "abstract": (
            "Artificial intelligence improves diagnostic "
            "support in healthcare. Limited datasets remain "
            "an important challenge."
        )
    }
]

test_analyses = [
    {
        "paper_id": "paper-001",
        "title": "Artificial Intelligence in Healthcare",
        "analysis": {
            "research_objectives": [
                "Study AI applications in healthcare."
            ],
            "key_findings": [
                "AI improves diagnostic support."
            ],
            "benefits": [
                "Improved diagnostic assistance."
            ],
            "limitations": [
                "Limited datasets."
            ],
            "applications": [
                "Healthcare diagnosis."
            ],
            "research_gaps": [
                "Need for more diverse datasets."
            ]
        }
    }
]

test_fact_check = {
    "total_evidence_checked": 1,
    "verified_evidence": [
        {
            "paper_id": "paper-001",
            "statement": "AI improves diagnostic support.",
            "traceability": "supported"
        }
    ],
    "unverified_evidence": [],
    "potential_conflicts": [],
    "conflicts_found": 0,
    "verification_type": (
        "Gemini-assisted abstract evidence screening"
    )
}

result = generate_report(
    query="Artificial Intelligence in Healthcare",
    papers=test_papers,
    analyses=test_analyses,
    fact_check=test_fact_check
)

print("\nREPORT GENERATION SUCCESSFUL!")
print("\nReport Title:", result["report_title"])
print("\nTotal Papers:", result["total_papers"])
print("\nGenerated Report:\n")
print(result["content"])
