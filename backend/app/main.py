from __future__ import annotations

import asyncio
import json
import os
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()

app = FastAPI(
    title="ResearchX API",
    description="Multi-stage web research API for the ResearchX workspace.",
    version="1.0.0",
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
                "published_date": str(item.get("published_date") or ""),
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
        "Add a Gemini API key to enable AI analysis and synthesis.",
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


@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "ResearchX API",
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
            detail="Tavily is not configured. Add TAVILY_API_KEY to backend/.env.",
        )

    timeout = httpx.Timeout(45.0, connect=15.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            queries = await plan_searches(client, question)
            search_batches = await asyncio.gather(
                *(tavily_search(client, query) for query in queries)
            )
        except httpx.HTTPStatusError as exc:
            detail = "A research provider rejected the request."
            if exc.response.status_code == 401:
                detail = "An API key was rejected. Check your Tavily and Gemini keys."
            elif exc.response.status_code == 429:
                detail = "The research provider rate limit was reached. Try again shortly."
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
                # Search results remain available even if the synthesis provider fails.
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
            {"name": "Web researcher", "status": "complete", "detail": f"Collected {len(sources)} unique sources."},
            {"name": "Evidence analyst", "status": "complete" if synthesis_used else "partial", "detail": "Compared source evidence and uncertainty." if synthesis_used else "AI analysis is unavailable; showing source summaries."},
            {"name": "Report writer", "status": "complete" if synthesis_used else "partial", "detail": "Generated a cited research report." if synthesis_used else "Showing search results without AI synthesis."},
        ],
        "ai_synthesis": synthesis_used,
    }
