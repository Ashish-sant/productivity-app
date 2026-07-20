"""
============================================================
 Focus Lab — Insights Generator
 Runs the key analytical queries against Neon Postgres and
 writes the results to insights.json, which the app serves
 to the Focus Lab page.

 Run locally (after etl.py has loaded the data):
     python generate_insights.py
============================================================
"""

import os
import json
import psycopg2
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# Where to write the output. We write it into the frontend so the
# React app can import/serve it. Adjust the path if your structure differs.
OUTPUT_PATH = "../frontend/src/data/insights.json"


def fetch_all(cur, sql):
    cur.execute(sql)
    return cur.fetchall()


def main():
    if not DATABASE_URL:
        raise SystemExit("ERROR: DATABASE_URL not set in .env")

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    insights = {}

    # --- KPIs (headline numbers) ---
    row = fetch_all(cur, """
        SELECT COUNT(*),
               ROUND(AVG(productivity_score), 1),
               ROUND(AVG(study_hours_per_day), 1),
               ROUND(AVG(sleep_hours), 1),
               ROUND(AVG(total_screen_time), 1)
        FROM student_facts;
    """)[0]
    insights["kpis"] = {
        "total_students": row[0],
        "avg_productivity": float(row[1]),
        "avg_study_hours": float(row[2]),
        "avg_sleep_hours": float(row[3]),
        "avg_screen_time": float(row[4]),
    }

    # --- Productivity by sleep category ---
    rows = fetch_all(cur, """
        SELECT d.sleep_cat_name, COUNT(*), ROUND(AVG(f.productivity_score), 1) AS p
        FROM student_facts f
        JOIN dim_sleep_category d ON f.sleep_cat_id = d.sleep_cat_id
        GROUP BY d.sleep_cat_name
        ORDER BY p DESC;
    """)
    insights["by_sleep"] = [
        {"category": r[0], "students": r[1], "avg_productivity": float(r[2])}
        for r in rows
    ]

    # --- Productivity by screen-time quartile (the headline insight) ---
    rows = fetch_all(cur, """
        WITH sq AS (
            SELECT productivity_score,
                   NTILE(4) OVER (ORDER BY total_screen_time) AS qt
            FROM student_facts
        )
        SELECT qt, ROUND(AVG(productivity_score), 1)
        FROM sq GROUP BY qt ORDER BY qt;
    """)
    insights["by_screen_quartile"] = [
        {"quartile": r[0], "avg_productivity": float(r[1])} for r in rows
    ]

    # --- Productivity bands and their habits ---
    rows = fetch_all(cur, """
        SELECT b.band_name, COUNT(*),
               ROUND(AVG(f.study_hours_per_day), 1),
               ROUND(AVG(f.total_screen_time), 1)
        FROM student_facts f
        JOIN dim_productivity_band b ON f.band_id = b.band_id
        GROUP BY b.band_name;
    """)
    insights["by_band"] = [
        {"band": r[0], "students": r[1],
         "avg_study": float(r[2]), "avg_screen": float(r[3])}
        for r in rows
    ]

    cur.close()
    conn.close()

    # --- Write the JSON file ---
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w") as fp:
        json.dump(insights, fp, indent=2)

    print(f"insights.json written to {OUTPUT_PATH}")
    print(json.dumps(insights, indent=2))


if __name__ == "__main__":
    main()