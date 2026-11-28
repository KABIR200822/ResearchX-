
from app.agents.analysis_agent import analyze_papers

test_papers = [
    {
        "paper_id": "test-001",
        "title": "Artificial Intelligence in Healthcare",
        "abstract": """
        This study aims to investigate the applications
        of artificial intelligence in healthcare.
        Results demonstrate improvements in diagnostic
        support. However, data privacy and limited
        datasets remain important challenges.
        """
    }
]

results = analyze_papers(test_papers)

print("\nAI ANALYSIS RESULT:")
print(results)
