
import sqlite3
import json
from pathlib import Path
from datetime import datetime, timezone

# Database location: backend/researchx.db
BASE_DIR = Path(__file__).resolve().parents[2]
DATABASE_PATH = BASE_DIR / "researchx.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_connection()

    try:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS research_projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT NOT NULL,
                status TEXT NOT NULL,
                total_papers INTEGER DEFAULT 0,
                agents_completed TEXT,
                papers TEXT,
                analysis TEXT,
                fact_check TEXT,
                report TEXT,
                created_at TEXT NOT NULL
            )
        """)

        connection.commit()
        print("ResearchX database initialized successfully!")

    finally:
        connection.close()


def save_research(data):
    connection = get_connection()

    try:
        cursor = connection.execute("""
            INSERT INTO research_projects (
                query,
                status,
                total_papers,
                agents_completed,
                papers,
                analysis,
                fact_check,
                report,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get("query", ""),
            data.get("status", "completed"),
            data.get("total_papers", 0),
            json.dumps(data.get("agents_completed", [])),
            json.dumps(data.get("papers", [])),
            json.dumps(data.get("analysis", {})),
            json.dumps(data.get("fact_check", {})),
            json.dumps(data.get("report", {})),
            datetime.now(timezone.utc).isoformat()
        ))

        connection.commit()
        return cursor.lastrowid

    finally:
        connection.close()


def get_research_history():
    connection = get_connection()

    try:
        rows = connection.execute("""
            SELECT
                id,
                query,
                status,
                total_papers,
                created_at
            FROM research_projects
            ORDER BY id DESC
        """).fetchall()

        return [dict(row) for row in rows]

    finally:
        connection.close()


def get_research_by_id(project_id):
    connection = get_connection()

    try:
        row = connection.execute("""
            SELECT *
            FROM research_projects
            WHERE id = ?
        """, (project_id,)).fetchone()

        if row is None:
            return None

        result = dict(row)

        # Convert saved JSON strings back into Python data
        for field in [
            "agents_completed",
            "papers",
            "analysis",
            "fact_check",
            "report"
        ]:
            result[field] = json.loads(result[field] or "null")

        return result

    finally:
        connection.close()
