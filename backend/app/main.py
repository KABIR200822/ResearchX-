from __future__ import annotations

import asyncio
import html
import io
import json
import os
import re
from typing import Any
from urllib.parse import urlparse

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from agents import AnalystAgent, FactCheckerAgent, ReportWriterAgent, ResearcherAgent
from reportlab.platypus import (
    HRFlowable,
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()
MAX_SOURCES = 12

app = FastAPI(
    title="ResearchX Research API",
    description="Tavily retrieval, Gemini synthesis and PDF report export for ResearchX.",
    version="1.0.0",
)

origins = [
    value.strip()
    for value in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if value.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


class ResearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=1200)
    mode: str = Field(default="Research", max_length=40)
    preference: str = Field(default="Balanced", max_length=40)
    tool: str | None = Field(default=None, max_length=80)
    documents: list[dict[str, Any]] = Field(default_factory=list, max_length=10)


class PDFReportRequest(BaseModel):
    query: str = Field(min_length=1, max_length=1200)
    report: dict[str, Any]
    sources: list[dict[str, Any]] = Field(default_factory=list, max_length=30)


def _clean_url(value: Any) -> str:
    url = str(value or "").strip()
    parsed = urlparse(url)
    return url if parsed.scheme in {"http", "https"} and parsed.netloc else ""


async def gemini_generate(
    client: httpx.AsyncClient,
    prompt: str,
    *,
    json_mode: bool = False,
) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent"
    )
    generation_config: dict[str, Any] = {"temperature": 0.2}
    if json_mode:
        generation_config["responseMimeType"] = "application/json"

    response = await client.post(
        endpoint,
        params={"key": GEMINI_API_KEY},
        json={
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": generation_config,
        },
    )
    response.raise_for_status()
    payload = response.json()
    try:
        return payload["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError("Gemini returned an empty or unexpected response.") from exc


def _parse_json(raw: str) -> dict[str, Any]:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^\```(?:json)?\s*|\s*\```$", "", text, flags=re.I)
    value = json.loads(text)
    if not isinstance(value, dict):
        raise ValueError("Gemini returned JSON in an unexpected format.")
    return value


async def plan_searches(client: httpx.AsyncClient, question: str) -> list[str]:
    if GEMINI_API_KEY:
        prompt = (
            "Create three complementary web search queries for the research question. "
            "Cover foundational/primary information, recent evidence or developments, "
            "and limitations or competing views. Return JSON only as "
            '{"queries":["...","...","..."]}.\n'
            f"Research question: {question}"
        )
        try:
            data = _parse_json(await gemini_generate(client, prompt, json_mode=True))
            queries = [
                str(item).strip()
                for item in data.get("queries", [])
                if str(item).strip()
            ]
            if queries:
                return list(dict.fromkeys(queries))[:3]
        except (httpx.HTTPError, RuntimeError, ValueError, TypeError):
            pass

    return [
        question,
        f"{question} research evidence findings",
        f"{question} limitations debate recent developments",
    ]


async def tavily_search(client: httpx.AsyncClient, query: str) -> list[dict[str, Any]]:
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
            "include_raw_content": True,
        },
    )
    response.raise_for_status()
    payload = response.json()
    results = payload.get("results", [])
    return results if isinstance(results, list) else []


def collect_sources(batches: list[list[dict[str, Any]]]) -> list[dict[str, Any]]:
    sources: list[dict[str, Any]] = []
    seen: set[str] = set()
    for batch in batches:
        for item in batch:
            url = _clean_url(item.get("url"))
            if not url or url in seen:
                continue
            seen.add(url)
            content = item.get("raw_content") or item.get("content") or ""
            sources.append(
                {
                    "id": f"S{len(sources) + 1}",
                    "title": str(item.get("title") or "Untitled source")[:500],
                    "url": url,
                    "publisher": urlparse(url).netloc,
                    "publishedAt": str(
                        item.get("published_date") or item.get("publishedDate") or ""
                    ),
                    "excerpt": str(content)[:6500],
                    "score": item.get("score"),
                }
            )
            if len(sources) >= MAX_SOURCES:
                return sources
    return sources


def fallback_report(question: str, sources: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "title": question,
        "status": "LIVE SEARCH RESULTS · AI SYNTHESIS UNAVAILABLE",
        "executiveSummary": (
            "ResearchX retrieved web sources, but Gemini synthesis was unavailable. "
            "Review the source summaries below before drawing conclusions."
        ),
        "sections": [
            {
                "heading": "Retrieved source summaries",
                "body": "The following material was returned by Tavily. It has not been independently verified.",
                "bullets": [
                    f"{source['title']}: {source['excerpt'][:900]}"
                    for source in sources
                ],
            }
        ],
        "findings": [],
        "references": [
            {
                "id": source["id"],
                "title": source["title"],
                "url": source["url"],
                "publisher": source["publisher"],
                "publishedAt": source["publishedAt"],
            }
            for source in sources
        ],
        "demoMaterials": [],
        "evidenceCount": 0,
        "verificationSummary": (
            "Automated independent fact-checking has not been performed. "
            "The returned sources are provided for manual review."
        ),
        "limitations": [
            "The report is a source digest because Gemini synthesis was unavailable.",
            "Search ranking and snippets do not establish that a claim is true.",
            "Sources have not been independently authenticated or peer reviewed.",
        ],
        "provenance": "Live web search via Tavily; no AI synthesis",
    }


def _normalise_report(data: dict[str, Any], sources: list[dict[str, Any]], question: str) -> dict[str, Any]:
    sections = data.get("sections")
    if not isinstance(sections, list):
        sections = []
    clean_sections = []
    for section in sections[:16]:
        if not isinstance(section, dict):
            continue
        item: dict[str, Any] = {
            "heading": str(section.get("heading") or "Research detail")[:240],
        }
        if section.get("body"):
            item["body"] = str(section["body"])[:12000]
        if isinstance(section.get("bullets"), list):
            item["bullets"] = [str(x)[:2500] for x in section["bullets"][:20]]
        if isinstance(section.get("findings"), list):
            item["findings"] = section["findings"][:20]
        clean_sections.append(item)

    findings = []
    raw_findings = data.get("findings", [])
    if not isinstance(raw_findings, list):
        raw_findings = []
    for index, finding in enumerate(raw_findings[:30]):
        if not isinstance(finding, dict):
            continue
        claim = str(finding.get("claim") or "").strip()
        if not claim:
            continue
        findings.append(
            {
                "id": str(finding.get("id") or f"F{index + 1}"),
                "claim": claim[:1200],
                "detail": str(finding.get("detail") or "")[:3000],
                "category": str(finding.get("category") or "Finding")[:120],
            }
        )

    refs = [
        {
            "id": source["id"],
            "title": source["title"],
            "url": source["url"],
            "publisher": source["publisher"],
            "publishedAt": source["publishedAt"],
        }
        for source in sources
    ]
    raw_limitations = data.get("limitations", [])
    if not isinstance(raw_limitations, list):
        raw_limitations = []
    return {
        "title": str(data.get("title") or question)[:500],
        "status": "LIVE RESEARCH · AI SYNTHESIS · NOT INDEPENDENTLY VERIFIED",
        "executiveSummary": str(data.get("executiveSummary") or "")[:10000],
        "sections": clean_sections,
        "findings": findings,
        "references": refs,
        "demoMaterials": [],
        "evidenceCount": len(findings),
        "verificationSummary": str(
            data.get("verificationSummary")
            or "Gemini compared the retrieved material, but this is not an independent fact-check."
        )[:3000],
        "limitations": [
            str(item)[:1000]
            for item in raw_limitations[:12]
            if str(item).strip()
        ] or [
            "AI synthesis can contain errors; inspect the linked sources.",
            "Search retrieval does not establish source quality or factual correctness.",
            "No independent human or specialist fact-check has been performed.",
        ],
        "provenance": "Live web search via Tavily; synthesis via Google Gemini",
    }


def build_report_prompt(question: str, sources: list[dict[str, Any]]) -> str:
    context = []
    for source in sources:
        context.append(
            f"[{source['id']}] {source['title']}\n"
            f"URL: {source['url']}\n"
            f"Publisher: {source['publisher']}\n"
            f"Published: {source['publishedAt'] or 'not supplied'}\n"
            f"Retrieved content: {source['excerpt'][:5000]}"
        )
    schema = {
        "title": "string",
        "executiveSummary": "string",
        "sections": [
            {"heading": "string", "body": "optional string", "bullets": ["optional string"]}
        ],
        "findings": [
            {"id": "F1", "claim": "string with inline source citations such as [S1]", "detail": "string", "category": "string"}
        ],
        "verificationSummary": "string describing comparisons and what remains unverified",
        "limitations": ["string"],
    }
    return (
        "You are ResearchX, an evidence-focused research synthesis agent. "
        "Write a useful, balanced Markdown-free JSON research report answering the question. "
        "Use ONLY the supplied source content; do not invent facts, statistics, quotes, dates, "
        "or references. Cite factual statements with source IDs exactly like [S1] or [S2]. "
        "Distinguish agreement, disagreement and uncertainty. Prefer primary sources where "
        "available. If sources do not support a claim, state that clearly. The report must "
        "include an executive summary, 3-6 substantive sections, key findings, and limitations. "
        "Do not claim independent verification: describe cross-source comparison honestly. "
        f"Return valid JSON matching this shape: {json.dumps(schema)}\n\n"
        f"Research question: {question}\n\n"
        "Retrieved sources:\n" + "\n\n".join(context)
    )


@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "ResearchX Research API",
        "search_provider": "tavily",
        "synthesis_provider": "gemini",
        "providers": {
            "tavily_configured": bool(TAVILY_API_KEY),
            "gemini_configured": bool(GEMINI_API_KEY),
            "gemini_model": GEMINI_MODEL,
        },
    }


@app.post("/api/research")
async def research(request: ResearchRequest) -> dict[str, Any]:
    question = request.query.strip()
    if len(question) < 3:
        raise HTTPException(status_code=422, detail="Enter a longer research question.")
    if not TAVILY_API_KEY:
        raise HTTPException(status_code=503, detail="TAVILY_API_KEY is missing from backend/.env.")

    timeout = httpx.Timeout(75.0, connect=15.0)
    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
        try:
            queries = await plan_searches(client, question)
            batches = await asyncio.gather(*(tavily_search(client, query) for query in queries))
        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code
            if status in (401, 403):
                detail = "Tavily rejected the API key or permissions. Check TAVILY_API_KEY."
            elif status == 429:
                detail = "Tavily rate limit or usage quota reached."
            else:
                detail = f"Tavily search failed with HTTP {status}."
            raise HTTPException(status_code=502, detail=detail) from exc
        except (httpx.HTTPError, RuntimeError) as exc:
            raise HTTPException(status_code=502, detail=f"Search request failed: {exc}") from exc

        sources = collect_sources(batches)
        if not sources:
            raise HTTPException(status_code=404, detail="Tavily returned no usable sources. Try a more specific query.")

        # Feed retrieved Tavily material through the repository's existing
        # specialist-agent modules instead of bypassing the established pipeline.
        agent_documents = [
            {
                "id": source["id"],
                "title": source["title"],
                "content": source["excerpt"],
                "origin": "tavily",
                "url": source["url"],
            }
            for source in sources
        ]
        research_agent = ResearcherAgent().run(question, agent_documents)
        analysis_agent = AnalystAgent().run(question, research_agent["documents"])
        verification_agent = FactCheckerAgent().run(
            analysis_agent["findings"], research_agent["documents"]
        )
        draft_agent = ReportWriterAgent().run(
            question, analysis_agent, verification_agent, research_agent["documents"]
        )

        report = fallback_report(question, sources)
        synthesis_used = False
        synthesis_error = None
        if GEMINI_API_KEY:
            try:
                raw = await gemini_generate(
                    client,
                    build_report_prompt(question, sources),
                    json_mode=True,
                )
                report = _normalise_report(_parse_json(raw), sources, question)
                synthesis_used = True
            except (httpx.HTTPError, RuntimeError, ValueError, TypeError) as exc:
                synthesis_error = str(exc)

    stages = [
        {
            "id": "researcher",
            "name": "Researcher",
            "status": "complete",
            "summary": f"Tavily searched {len(queries)} focused queries and collected {len(sources)} unique sources.",
            "output": {**research_agent, "queries": queries, "sources": sources},
        },
        {
            "id": "analyst",
            "name": "Analyst",
            "status": "complete" if synthesis_used else "partial",
            "summary": "Gemini synthesised findings and compared source perspectives." if synthesis_used else "Source summaries are available; Gemini synthesis did not complete.",
            "output": {
                "executiveSummary": report["executiveSummary"],
                "sections": report["sections"],
                "findings": report["findings"],
                "sourceExcerptAnalysis": analysis_agent,
            },
        },
        {
            "id": "fact-checker",
            "name": "Fact-checker",
            "status": "partial",
            "summary": f"Checked traceability for {len(verification_agent['checks'])} source observations; factual verification remains outstanding.",
            "output": verification_agent,
        },
        {
            "id": "report-writer",
            "name": "Report writer",
            "status": "complete" if synthesis_used else "partial",
            "summary": "Prepared the research report with linked source references.",
            "output": {"report": report, "traceabilityDraft": draft_agent},
        },
    ]
    if synthesis_error:
        report["limitations"] = list(report["limitations"]) + [f"Gemini synthesis error: {synthesis_error[:300]}"]

    return {
        "id": f"live-{asyncio.get_running_loop().time():.6f}",
        "mode": "live",
        "question": question,
        "createdAt": None,
        "options": {
            "mode": request.preference,
            "tool": request.tool,
            "taskMode": request.mode,
        },
        "stages": stages,
        "report": report,
        "sources": sources,
        "limitations": report["limitations"],
        "documents": [
            {
                "name": str(item.get("name") or "PDF document"),
                "size": item.get("size"),
                "status": "attached-not-analysed",
                "note": "PDF preview is available in the frontend; PDF text extraction is not connected yet.",
            }
            for item in request.documents
        ],
        "ai_synthesis": synthesis_used,
    }


def _safe_paragraph(value: Any) -> str:
    text = html.escape(str(value or ""), quote=False)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    return text


def _report_story(report: dict[str, Any], styles: Any) -> list[Any]:
    story: list[Any] = []
    summary = report.get("executiveSummary")
    if summary:
        story.extend([Paragraph("Executive summary", styles["Heading2"]), Paragraph(_safe_paragraph(summary), styles["BodyText"]), Spacer(1, 8)])
    for section in report.get("sections", []):
        if not isinstance(section, dict):
            continue
        story.append(Paragraph(_safe_paragraph(section.get("heading") or "Research detail"), styles["Heading2"]))
        if section.get("body"):
            story.append(Paragraph(_safe_paragraph(section["body"]), styles["BodyText"]))
        bullets = section.get("bullets")
        if isinstance(bullets, list) and bullets:
            items = [ListItem(Paragraph(_safe_paragraph(item), styles["BodyText"])) for item in bullets]
            story.append(ListFlowable(items, bulletType="bullet", leftIndent=18))
        for finding in section.get("findings", []) if isinstance(section.get("findings"), list) else []:
            if isinstance(finding, dict):
                story.append(Paragraph(f"<b>{_safe_paragraph(finding.get('claim'))}</b>", styles["BodyText"]))
                if finding.get("detail"):
                    story.append(Paragraph(_safe_paragraph(finding["detail"]), styles["BodyText"]))
        story.append(Spacer(1, 6))
    findings = report.get("findings", [])
    if findings:
        story.append(Paragraph("Key findings", styles["Heading2"]))
        for finding in findings:
            if isinstance(finding, dict):
                story.append(Paragraph(f"<b>{_safe_paragraph(finding.get('claim'))}</b>", styles["BodyText"]))
                if finding.get("detail"):
                    story.append(Paragraph(_safe_paragraph(finding["detail"]), styles["BodyText"]))
    if report.get("verificationSummary"):
        story.append(Paragraph("Verification and limitations", styles["Heading2"]))
        story.append(Paragraph(_safe_paragraph(report["verificationSummary"]), styles["BodyText"]))
    for limitation in report.get("limitations", []):
        story.append(Paragraph("• " + _safe_paragraph(limitation), styles["BodyText"]))
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
    styles["Heading1"].textColor = colors.HexColor("#172033")
    styles["Heading2"].textColor = colors.HexColor("#2457A6")
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
        Paragraph(_safe_paragraph(request.query), styles["Normal"]),
        HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#dbe2ea")),
        Spacer(1, 12),
    ]
    story.extend(_report_story(request.report, styles))
    sources = request.sources or request.report.get("references", [])
    if sources:
        story.append(Paragraph("Sources", styles["Heading1"]))
        for index, source in enumerate(sources[:30], start=1):
            if not isinstance(source, dict):
                continue
            title = _safe_paragraph(source.get("title") or "Source")
            url = _clean_url(source.get("url"))
            if url:
                safe_url = html.escape(url, quote=True)
                story.append(Paragraph(f"[{index}] <link href='{safe_url}' color='#2457A6'>{title}</link>", styles["BodyText"]))
            else:
                story.append(Paragraph(f"[{index}] {title}", styles["BodyText"]))

    document.build(story)
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="researchx-report.pdf"'},
    )
