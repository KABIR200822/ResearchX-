
import re
from datetime import datetime
from urllib.parse import urlparse


def extract_arxiv_id(url: str) -> str:
    """Extract the arXiv paper ID from its URL."""

    if not url:
        return ""

    match = re.search(
        r'arxiv\.org/abs/([^/?#]+)',
        url
    )

    return match.group(1) if match else ""


def process_papers(papers: list) -> list:
    """
    Clean, validate and structure papers
    retrieved by the Research Agent.
    """

    processed_papers = []
    seen_ids = set()

    for paper in papers:

        title = " ".join(
            paper.get("title", "").split()
        )

        if not title:
            continue

        url = paper.get("url", "")
        arxiv_id = extract_arxiv_id(url)

        # Prevent duplicate papers
        unique_id = arxiv_id or title.lower()

        if unique_id in seen_ids:
            continue

        seen_ids.add(unique_id)

        authors = paper.get("authors", [])

        if not isinstance(authors, list):
            authors = []

        authors = [
            author.strip()
            for author in authors
            if isinstance(author, str) and author.strip()
        ]

        abstract = " ".join(
            paper.get("summary", "").split()
        )

        published = paper.get("published", "")

        year = None

        if published:
            try:
                year = datetime.strptime(
                    published[:10],
                    "%Y-%m-%d"
                ).year
            except ValueError:
                year = None

        citation = (
            f"{', '.join(authors)} ({year or 'n.d.'}). "
            f"{title}. arXiv. {url}"
        )

        processed_papers.append({
            # Fallback ID so every paper is unique for later agents
            "paper_id": arxiv_id or f"paper-{len(processed_papers) + 1}",
            "title": title,
            "authors": authors,
            "published": published,
            "year": year,
            "abstract": abstract,
            "abstract_length": len(abstract),
            "source": "arXiv",
            "source_url": url,
            "citation": citation
        })

    return processed_papers
