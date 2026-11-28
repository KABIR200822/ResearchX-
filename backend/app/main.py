
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.agents.research_agent import search_research_papers
from app.agents.paper_agent import process_papers
from app.agents.analysis_agent import analyze_papers
from app.agents.fact_checker import check_evidence
from app.agents.report_agent import generate_report

from app.database.db import (
    initialize_database,
    save_research,
    get_research_history,
    get_research_by_id
)


load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# Frontend origins allowed to call this API (comma separated in .env)
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="ResearchX API",
    description="Multi-Agent AI Research Assistant",
    version="2.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class ResearchRequest(BaseModel):
    query: str = Field(..., max_length=300)


@app.get("/")
def root():
    return {
        "message": "ResearchX Backend is Running!",
        "status": "Active",
        "version": "2.0.0"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "project": "ResearchX"
    }


@app.post("/api/research")
def start_research(request: ResearchRequest):

    query = request.query.strip()

    if not query:
        raise HTTPException(
            status_code=400,
            detail="Research query cannot be empty."
        )

    try:
        # Agent 1: Research
        retrieved_papers = search_research_papers(query)

        # Agent 2: Paper Processing
        processed_papers = process_papers(retrieved_papers)

        if not processed_papers:
            result = {
                "status": "no_results",
                "query": query,
                "total_papers": 0,
                "agents_completed": [
                    "Research Agent",
                    "Paper Agent"
                ],
                "papers": [],
                "analysis": [],
                "fact_check": {
                    "total_evidence_checked": 0,
                    "verified_evidence": [],
                    "unverified_evidence": [],
                    "potential_conflicts": [],
                    "conflicts_found": 0
                },
                "report": None
            }

            project_id = save_research(result)
            result["project_id"] = project_id

            return result

        # Agent 3: Gemini Analysis
        analyzed_papers = analyze_papers(processed_papers)

        # Agent 4: Gemini-assisted Fact Checking
        fact_check_results = check_evidence(
            processed_papers,
            analyzed_papers
        )

        # Agent 5: Gemini Report Generation
        report = generate_report(
            query,
            processed_papers,
            analyzed_papers,
            fact_check_results
        )

        result = {
            "status": "completed",
            "query": query,
            "total_papers": len(processed_papers),

            "agents_completed": [
                "Research Agent",
                "Paper Agent",
                "Analysis Agent",
                "Fact Checker",
                "Report Agent"
            ],

            "papers": processed_papers,
            "analysis": analyzed_papers,
            "fact_check": fact_check_results,
            "report": report
        }

        # Save complete research result
        project_id = save_research(result)

        result["project_id"] = project_id

        return result

    except HTTPException:
        raise

    except Exception as error:
        print("Research pipeline error:", repr(error))

        raise HTTPException(
            status_code=502,
            detail=f"Research pipeline failed: {str(error)}"
        )


@app.get("/api/research/history")
def research_history():

    try:
        history = get_research_history()

        return {
            "total_projects": len(history),
            "projects": history
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@app.get("/api/research/{project_id}")
def research_details(project_id: int):

    try:
        project = get_research_by_id(project_id)

        if project is None:
            raise HTTPException(
                status_code=404,
                detail="Research project not found."
            )

        return project

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
