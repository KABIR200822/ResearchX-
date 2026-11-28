
from app.agents.fact_checker import check_evidence

test_papers = [
    {
        "paper_id": "paper-001",
        "title": "AI in Healthcare",
        "abstract": (
            "Artificial intelligence improves diagnostic "
            "support in healthcare. However, limited datasets "
            "remain a challenge."
        ),
        "source_url": "https://example.com/paper1"
    },
    {
        "paper_id": "paper-002",
        "title": "Healthcare AI Limitations",
        "abstract": (
            "Our study finds that artificial intelligence "
            "does not consistently improve diagnostic accuracy "
            "across all clinical settings."
        ),
        "source_url": "https://example.com/paper2"
    }
]

test_analyses = [
    {
        "paper_id": "paper-001",
        "analysis": {
            "key_findings": [
                "Artificial intelligence improves diagnostic support."
            ]
        }
    },
    {
        "paper_id": "paper-002",
        "analysis": {
            "key_findings": [
                "Artificial intelligence does not consistently "
                "improve diagnostic accuracy."
            ]
        }
    }
]

result = check_evidence(test_papers, test_analyses)

print("\nFACT CHECK RESULT:")
print(result)
