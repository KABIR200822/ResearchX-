
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import ssl
import certifi


ARXIV_API_URL = "https://export.arxiv.org/api/query"

# Secure SSL certificate configuration
SSL_CONTEXT = ssl.create_default_context(
    cafile=certifi.where()
)


def search_research_papers(query: str, max_results: int = 5):

    if not query.strip():
        return []

    # Match every word (exact-phrase search often returns 0 papers)
    words = [
        word for word in
        "".join(c if c.isalnum() else " " for c in query).split()
    ]

    if not words:
        return []

    search_query = " AND ".join(f"all:{word}" for word in words)

    params = {
        "search_query": search_query,
        "start": 0,
        "max_results": max_results,
        "sortBy": "relevance",
        "sortOrder": "descending"
    }

    url = ARXIV_API_URL + "?" + urllib.parse.urlencode(params)

    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "ResearchX/1.0"
        }
    )

    try:
        with urllib.request.urlopen(
            request,
            timeout=30,
            context=SSL_CONTEXT
        ) as response:

            xml_data = response.read()

        root = ET.fromstring(xml_data)

        namespace = {
            "atom": "http://www.w3.org/2005/Atom"
        }

        papers = []

        for entry in root.findall("atom:entry", namespace):

            title = entry.findtext(
                "atom:title",
                default="",
                namespaces=namespace
            )

            summary = entry.findtext(
                "atom:summary",
                default="",
                namespaces=namespace
            )

            published = entry.findtext(
                "atom:published",
                default="",
                namespaces=namespace
            )

            paper_url = entry.findtext(
                "atom:id",
                default="",
                namespaces=namespace
            )

            authors = []

            for author in entry.findall(
                "atom:author",
                namespace
            ):

                name = author.findtext(
                    "atom:name",
                    default="",
                    namespaces=namespace
                )

                if name:
                    authors.append(name)

            papers.append({
                "title": " ".join(title.split()),
                "summary": " ".join(summary.split()),
                "authors": authors,
                "published": published[:10],
                "url": paper_url
            })

        return papers

    except Exception as error:
        raise RuntimeError(
            f"Research paper search failed: {error}"
        ) from error
