from __future__ import annotations

import asyncio
import html
import io
import json
import os
import re
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer
from pydantic import BaseModel, Field

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()

app = FastAPI(
    title="ResearchX API",
    description="Multi-stage web research API for the ResearchX workspace.",
    version="1.1.0",
)

origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class ResearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=1200)
    mode: str = Field(default="Research", max_length=40)


class PDFSource(BaseModel):
    title: str = Field(default="Source", max_length=500)
    url: str = Field(max_length=2000)


class PDFReportRequest(BaseModel):
    query: str = Field(min_length=3, max_length=1200)
    report: str = Field(min_length=1, max_length=100000)
    sources: list[PDFSource] = Field(default_factory=list, max_length=30)


async def gemini_generate(
    client: httpx.AsyncClient,
    prompt: str,
    *,
    json_mode: bool = False,
) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent"
    )
    generation_config: dict[str, Any] = {"temperature": 0.25}
    if json_mode:
        generation_config["responseMimeType"] = "application/json"

    response = await client.post(
        url,
        params={"key": GEMINI_API_KEY},
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": generation_config,
        },
    )
    response.raise_for_status()
    payload = response.json()
    try:
        return payload["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError("Gemini returned an empty or unexpected response.") from exc


async def plan_searches(
    client: httpx.AsyncClient,
    question: str,
) -> list[str]:
    if GEMINI_API_KEY:
        prompt = (
            "You are the planning agent for a research system. Turn the user's "
            "question into exactly three distinct, concise web-search queries. "
            "Cover the core topic, evidence or recent developments, and limitations "
            "or competing perspectives. Return only JSON in this shape: "
            '{"queries":["query 1","query 2","query 3"]}.\n'
            f"Question: {question}"
        )
        try:
            raw = await gemini_generate(client, prompt, json_mode=True)
            parsed = json.loads(raw)
            queries = parsed.get("queries", [])
            clean = [str(item).strip() for item in queries if str(item).strip()]
            if clean:
                return clean[:3]
        except (httpx.HTTPError, RuntimeError, ValueError, TypeError):
            pass

    return [
        question,
        f"{question} research evidence and key findings",
        f"{question} limitations debates and recent developments",
    ]


async def tavily_search(
    client: httpx.AsyncClient,
    query: str,
) -> list[dict[str, Any]]:
    if not TAVILY_API_KEY:
        raise RuntimeError("TAVILY_API_KEY is not configured.")

    response = await client.post(
        "https://api.tavily.com/search",
        json={
            "api_key": TAVILY_API_KEY,
            "query": query,
            "search_depth": "advanced",
            "topic": "general",
            "max_results": 5,
            "include_answer": False,
            "include_raw_content": False,
        },
    )
    response.raise_for_status()
    data = response.json()
    return data.get("results", [])


def make_source_list(results: list[dict[str, Any]]) -> list[dict[str, str]]:
    sources: list[dict[str, str]] = []
    seen: set[str] = set()
    for item in results:
        url = str(item.get("url", "")).strip()
        if not url or url in seen:
            continue
        seen.add(url)
        sources.append(
            {
                "title": str(item.get("title") or "Untitled source"),
                "url": url,
                "content": str(item.get("content") or "")[:1800],
                "published_date": str(
                    item.get("published_date") or item.get("publishedDate") or ""
                ),
            }
        )
    return sources[:12]


def fallback_report(question: str, sources: list[dict[str, str]]) -> str:
    if not sources:
        return (
            "## No sources found\n\nThe search provider did not return any usable "
            "results. Try narrowing or rephrasing the research question."
        )
    lines = [
        "## Research results",
        "",
        f"Search results for **{question}** are listed below. "
        "AI synthesis was unavailable for this request.",
        "",
    ]
    for index, source in enumerate(sources, start=1):
        lines.extend(
            [
                f"### {index}. {source['title']}",
                source["content"] or "No summary was provided by the search provider.",
                f"[Open source]({source['url']})",
                "",
            ]
        )
    return "\n".join(lines)


def markdown_inline(value: str) -> str:
    escaped = html.escape(value, quote=False)
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", escaped)
    escaped = re.sub(r"\*(.+?)\*", r"<i>\1</i>", escaped)
    escaped = re.sub(r"`(.+?)`", r"<font name='Courier'>\1</font>", escaped)
    escaped = re.sub(
        r"\[([^\]]+)\]\((https?://[^\s)]+)\)",
        r"<link href='\2' color='#2457A6'>\1</link>",
        escaped,
    )
    return escaped


def markdown_to_pdf_story(report: str, styles: Any) -> list[Any]:
    story: list[Any] = []
    bullets: list[str] = []

    def flush_bullets() -> None:
        nonlocal bullets
        if bullets:
            items = [ListItem(Paragraph(markdown_inline(item), styles["BodyText"])) for item in bullets]
            story.append(ListFlowable(items, bulletType="bullet", leftIndent=18))
            story.append(Spacer(1, 4))
            bullets = []

    for raw_line in report.splitlines():
        line = raw_line.strip()
        if not line:
            flush_bullets()
            story.append(Spacer(1, 3))
        elif line.startswith(("- ", "* ")):
            bullets.append(line[2:].strip())
        else:
            flush_bullets()
            if line.startswith("### "):
                story.append(Paragraph(markdown_inline(line[4:]), styles["Heading3"]))
            elif line.startswith("## "):
                story.append(Paragraph(markdown_inline(line[3:]), styles["Heading2"]))
            elif line.startswith("# "):
                story.append(Paragraph(markdown_inline(line[2:]), styles["Heading1"]))
            else:
                numbered = re.match(r"^\d+[.)]\s+(.*)$", line)
                content = "• " + numbered.group(1) if numbered else line
                story.append(Paragraph(markdown_inline(content), styles["BodyText"]))
    flush_bullets()
    return story


@app.post("/api/research/pdf")
async def download_research_pdf(request: PDFReportRequest) -> StreamingResponse:
    buffer = io.BytesIO()
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="ResearchXTitle", parent=styles["Title"], fontName="Helvetica-Bold",
        fontSize=20, leading=25, alignment=TA_CENTER,
        textColor=colors.HexColor("#172033"), spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        name="ResearchXSubtitle", parent=styles["Normal"], fontSize=9,
        textColor=colors.HexColor("#64748b"), alignment=TA_CENTER, spaceAfter=16,
    ))
    styles["Heading1"].textColor = colors.HexColor("#172033")
    styles["Heading2"].textColor = colors.HexColor("#2457A6")
    styles["Heading3"].textColor = colors.HexColor("#334155")
    styles["BodyText"].leading = 15
    styles["BodyText"].spaceAfter = 6

    document = SimpleDocTemplate(
        buffer, pagesize=A4, rightMargin=19 * mm, leftMargin=19 * mm,
        topMargin=18 * mm, bottomMargin=18 * mm,
        title=f"ResearchX - {request.query[:100]}", author="ResearchX",
    )
    story: list[Any] = [
        Paragraph("RESEARCHX", ParagraphStyle(
            name="ResearchXBrand", parent=styles["Normal"], alignment=TA_CENTER,
            fontName="Helvetica-Bold", fontSize=10,
            textColor=colors.HexColor("#64748b"), spaceAfter=10,
        )),
        Paragraph("Research Report", styles["ResearchXTitle"]),
        Paragraph(markdown_inline(request.query), styles["ResearchXSubtitle"]),
        HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#dbe2ea")),
        Spacer(1, 12),
    ]
    story.extend(markdown_to_pdf_story(request.report, styles))
    if request.sources:
        story.extend([
            Spacer(1, 14),
            HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#dbe2ea")),
            Paragraph("Sources", styles["Heading1"]),
        ])
        for index, source in enumerate(request.sources, start=1):
            url = html.escape(source.url, quote=True)
            story.append(Paragraph(
                f"[{index}] <link href='{url}' color='#2457A6'>{markdown_inline(source.title)}</link>",
                styles["BodyText"],
            ))

    document.build(story)
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="researchx-report.pdf"'},
    )


@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "ResearchX API",
        "search_provider": "tavily",
        "providers": {
            "tavily_configured": bool(TAVILY_API_KEY),
            "gemini_configured": bool(GEMINI_API_KEY),
        },
    }


@app.post("/api/research")
async def research(request: ResearchRequest) -> dict[str, Any]:
    question = request.query.strip()
    if len(question) < 3:
        raise HTTPException(status_code=422, detail="Enter a longer research question.")

    if not TAVILY_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="TAVILY_API_KEY is missing from backend/.env.",
        )
    search_function = tavily_search

    timeout = httpx.Timeout(45.0, connect=15.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            queries = await plan_searches(client, question)
            search_batches = await asyncio.gather(
                *(search_function(client, query) for query in queries)
            )
        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code
            if status in (401, 403):
                detail = "Tavily rejected the API key or its permissions. Check TAVILY_API_KEY."
            elif status == 429:
                detail = "Tavily rate limit or usage quota reached. Try again later."
            else:
                detail = f"Tavily search failed with HTTP {status}."
            raise HTTPException(status_code=502, detail=detail) from exc
        except (httpx.HTTPError, RuntimeError) as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc

        raw_results = [item for batch in search_batches for item in batch]
        sources = make_source_list(raw_results)
        if not sources:
            raise HTTPException(
                status_code=404,
                detail="No useful sources were found. Try a more specific question.",
            )

        report = fallback_report(question, sources)
        synthesis_used = False
        if GEMINI_API_KEY:
            source_context = "\n\n".join(
                f"[{index}] {source['title']}\nURL: {source['url']}\n"
                f"Summary: {source['content']}"
                for index, source in enumerate(sources, start=1)
            )
            synthesis_prompt = (
                "You are the synthesis and verification stage of ResearchX, an "
                "evidence-focused research assistant. Write a clear Markdown report "
                "for the user's question using only the supplied source material. "
                "Include: an executive summary, key findings, points of agreement "
                "and disagreement, limitations or uncertainty, and a conclusion. "
                "Attach inline citations like [1] to claims and do not invent facts, "
                "dates, quotations, or sources. If the sources do not support a claim, "
                "say so. Finish with a short 'Research limitations' section.\n\n"
                f"Research question: {question}\n\nSources:\n{source_context}"
            )
            try:
                report = await gemini_generate(client, synthesis_prompt)
                synthesis_used = True
            except (httpx.HTTPError, RuntimeError):
                pass

    return {
        "query": question,
        "mode": request.mode,
        "report": report,
        "sources": [
            {
                "index": index,
                "title": source["title"],
                "url": source["url"],
                "published_date": source["published_date"],
            }
            for index, source in enumerate(sources, start=1)
        ],
        "agents": [
            {"name": "Research planner", "status": "complete", "detail": f"Prepared {len(queries)} search directions."},
            {"name": "Web researcher", "status": "complete", "detail": f"Collected {len(sources)} unique sources using Tavily."},
            {"name": "Evidence analyst", "status": "complete" if synthesis_used else "partial", "detail": "Compared source evidence and uncertainty." if synthesis_used else "AI analysis is unavailable; showing source summaries."},
            {"name": "Report writer", "status": "complete" if synthesis_used else "partial", "detail": "Generated a cited research report." if synthesis_used else "Showing search results without AI synthesis."},
        ],
        "ai_synthesis": synthesis_used,
    }
