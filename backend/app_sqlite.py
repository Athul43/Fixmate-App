# backend/app_sqlite.py
# add at top with other imports
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
import sqlite3, os, math
from pathlib import Path

app = Flask(__name__)
CORS(app)

DB_PATH = Path(__file__).parent / "data" / "fixmate.db"

def get_conn():
    return sqlite3.connect(DB_PATH, check_same_thread=False)

@app.route("/api/brands", methods=["GET"])
def get_brands():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT brand FROM issues ORDER BY brand COLLATE NOCASE")
    brands = [r[0] for r in cur.fetchall()]
    conn.close()
    return jsonify(brands)

@app.route("/api/appliances", methods=["GET"])
def get_appliances():
    brand = request.args.get("brand", "")
    if not brand:
        return jsonify({"error": "Missing 'brand' query parameter"}), 400
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT appliance FROM issues WHERE brand=? ORDER BY appliance COLLATE NOCASE", (brand,))
    apps = [r[0] for r in cur.fetchall()]
    conn.close()
    return jsonify(apps)

@app.route("/api/issues", methods=["GET"])
def get_issues():
    brand = request.args.get("brand", "")
    appliance = request.args.get("appliance", "")
    if not brand or not appliance:
        return jsonify({"error": "Missing 'brand' or 'appliance' query parameter"}), 400
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT issue_title FROM issues WHERE brand=? AND appliance=? ORDER BY issue_title COLLATE NOCASE", (brand, appliance))
    issues = [r[0] for r in cur.fetchall()]
    conn.close()
    return jsonify(issues)

@app.route("/api/solution", methods=["POST"])
def get_solution():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "Invalid or missing JSON body"}), 400
    brand = body.get("brand")
    appliance = body.get("appliance")
    issue = body.get("issue")
    if not brand or not appliance or not issue:
        return jsonify({"error": "Missing 'brand', 'appliance', or 'issue' in body"}), 400
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT solution, brand_page FROM issues WHERE brand=? AND appliance=? AND issue_title=? LIMIT 1", (brand, appliance, issue))
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Data not found"}), 404
    return jsonify({"solution": row[0], "brand_page": row[1]})

# FTS search: q matched against issue_title and solution (FTS5)
@app.route("/api/search", methods=["GET"])
def search():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"error": "Missing query parameter 'q'"}), 400
    limit = int(request.args.get("limit", 20))
    page = int(request.args.get("page", 1))

    conn = get_conn()
    cur = conn.cursor()
    # Use simple MATCH query. For multi-term AND, replace spaces with ' AND '
    safe_q = q.replace('"', ' ')
    # Using snippet for quick preview (first 300 chars)
    offset = (page - 1) * limit
    cur.execute("""
      SELECT issue_title, solution, brand, appliance
      FROM issues_fts
      WHERE issues_fts MATCH ?
      LIMIT ? OFFSET ?
    """, (safe_q, limit, offset))
    items = []
    for issue_title, solution, brand, appliance in cur.fetchall():
        items.append({
            "brand": brand,
            "appliance": appliance,
            "issue": issue_title,
            "solution_snippet": solution[:400]
        })
    # count total (approx) — not exact for FTS, but okay
    cur.execute("SELECT count(*) FROM issues_fts WHERE issues_fts MATCH ?", (safe_q,))
    total = cur.fetchone()[0]
    conn.close()
    return jsonify({
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit) if total else 0,
        "items": items
    })

@app.route("/")
def index():
    return redirect(url_for("get_brands"))

# --- Authentication endpoints (simple) ---

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    body = request.get_json(silent=True) or {}
    name = body.get("name", "").strip()
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "Missing name, email or password"}), 400

    conn = get_conn()
    cur = conn.cursor()
    try:
        pw_hash = generate_password_hash(password)
        cur.execute("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                    (name, email, pw_hash))
        conn.commit()
        user_id = cur.lastrowid
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Email already registered"}), 400

    cur.execute("SELECT id, name, email, created_at FROM users WHERE id=?", (user_id,))
    row = cur.fetchone()
    conn.close()
    user = {"id": row[0], "name": row[1], "email": row[2], "created_at": row[3]}
    return jsonify({"ok": True, "user": user})

@app.route("/api/auth/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, password_hash, created_at FROM users WHERE email=?", (email,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Invalid credentials"}), 401

    user_id, name, email_db, pw_hash, created_at = row
    if not check_password_hash(pw_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    user = {"id": user_id, "name": name, "email": email_db, "created_at": created_at}
    return jsonify({"ok": True, "user": user})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

