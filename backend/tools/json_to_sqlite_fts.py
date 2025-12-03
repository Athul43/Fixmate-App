# backend/tools/json_to_sqlite_fts.py
import sqlite3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "brands.json"
DB_FILE = ROOT / "data" / "fixmate.db"

def migrate():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    # main table
    c.execute("""
    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY,
      brand TEXT,
      appliance TEXT,
      issue_title TEXT,
      solution TEXT,
      brand_page TEXT
    )
    """)
    # FTS5 virtual table for search
    c.execute("CREATE VIRTUAL TABLE IF NOT EXISTS issues_fts USING fts5(issue_title, solution, brand, appliance, content='')")
    c.execute("DELETE FROM issues")
    c.execute("DELETE FROM issues_fts")

    rows = []
    fts_rows = []
    for brand, apps in data.items():
        for app, obj in apps.items():
            brand_page = obj.get("brand_page","")
            for issue_title, sol in obj.get("common_issues", {}).items():
                rows.append((brand, app, issue_title, sol, brand_page))
                fts_rows.append((issue_title, sol, brand, app))
    c.executemany("INSERT INTO issues (brand, appliance, issue_title, solution, brand_page) VALUES (?,?,?,?,?)", rows)
    # Insert into FTS table
    c.executemany("INSERT INTO issues_fts (issue_title, solution, brand, appliance) VALUES (?,?,?,?)", fts_rows)
    conn.commit()
    conn.close()
    print("Migrated", len(rows), "rows into", DB_FILE)

if __name__ == "__main__":
    migrate()
