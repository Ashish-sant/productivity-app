"""
============================================================
 Focus Lab — ETL Pipeline
 Extract -> Transform -> Load  for the student productivity data.

 EXTRACT : read the raw CSV with pandas
 TRANSFORM: validate, engineer new features, map to dimension keys
 LOAD    : insert 20,000 rows into the Neon Postgres star schema

 Run locally:  python etl.py
============================================================
"""

import os
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# ------------------------------------------------------------
# 0. CONFIG — load the Neon connection string from a .env file
# ------------------------------------------------------------
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")  # set this in data-pipeline/.env

CSV_PATH = "data/student_productivity_distraction_dataset_20000.csv"


# ------------------------------------------------------------
# 1. EXTRACT — read the raw data
# ------------------------------------------------------------
def extract(path):
    print("Extract: reading CSV...")
    df = pd.read_csv(path)
    print(f"  -> {len(df)} rows, {len(df.columns)} columns")
    return df


# ------------------------------------------------------------
# 2. TRANSFORM — clean, validate, and engineer features
# ------------------------------------------------------------
def transform(df):
    print("Transform: cleaning and engineering features...")

    # --- 2a. Basic validation / cleaning ---
    # Drop any rows missing critical fields (this data is clean, but a
    # real pipeline always guards against it).
    df = df.dropna(subset=["student_id", "productivity_score"]).copy()

    # Clamp scores into their valid 0-100 range in case of bad data.
    for col in ["productivity_score", "attendance_percentage", "final_grade"]:
        df[col] = df[col].clip(lower=0, upper=100)

    # --- 2b. Engineered feature: total screen time ---
    # The insight from analysis: individual apps barely correlate with
    # productivity, but AGGREGATE screen time does. So we build it.
    df["total_screen_time"] = (
        df["phone_usage_hours"]
        + df["social_media_hours"]
        + df["youtube_hours"]
        + df["gaming_hours"]
    ).round(2)

    # --- 2c. Engineered feature: distraction ratio ---
    # Screen time relative to study time. Higher = more distracted.
    # Guard against divide-by-zero (study hours is always >= 0.5 here,
    # but we protect anyway).
    df["distraction_ratio"] = (
        df["total_screen_time"] / df["study_hours_per_day"].replace(0, 0.5)
    ).round(2)

    # --- 2d. Dimension bucket: productivity band ---
    def productivity_band(score):
        if score <= 40:
            return "Low"
        elif score <= 70:
            return "Medium"
        return "High"

    df["band_name"] = df["productivity_score"].apply(productivity_band)

    # --- 2e. Dimension bucket: sleep category (the "sweet spot") ---
    def sleep_category(hours):
        if hours < 7:
            return "Under"
        elif hours <= 9:
            return "Optimal"
        return "Over"

    df["sleep_cat_name"] = df["sleep_hours"].apply(sleep_category)

    print("  -> added total_screen_time, distraction_ratio, band, sleep category")
    return df


# ------------------------------------------------------------
# 3. LOAD — insert into the Neon Postgres star schema
# ------------------------------------------------------------
def load(df):
    print("Load: connecting to Postgres...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # --- 3a. Read the dimension lookup tables into {name: id} maps ---
    # The schema already seeded these; we map names -> ids so each
    # student row gets the correct foreign keys.
    cur.execute("SELECT gender_id, gender_name FROM dim_gender;")
    gender_map = {name: gid for gid, name in cur.fetchall()}

    cur.execute("SELECT band_id, band_name FROM dim_productivity_band;")
    band_map = {name: bid for bid, name in cur.fetchall()}

    cur.execute("SELECT sleep_cat_id, sleep_cat_name FROM dim_sleep_category;")
    sleep_map = {name: sid for sid, name in cur.fetchall()}

    # --- 3b. Clear any previous load (makes the script safe to re-run) ---
    cur.execute("TRUNCATE TABLE student_facts;")

    # --- 3c. Build the rows to insert ---
    rows = []
    for _, r in df.iterrows():
        rows.append((
            int(r["student_id"]),
            gender_map.get(r["gender"]),
            band_map.get(r["band_name"]),
            sleep_map.get(r["sleep_cat_name"]),
            int(r["age"]),
            float(r["study_hours_per_day"]),
            float(r["sleep_hours"]),
            float(r["phone_usage_hours"]),
            float(r["social_media_hours"]),
            float(r["youtube_hours"]),
            float(r["gaming_hours"]),
            int(r["breaks_per_day"]),
            int(r["coffee_intake_mg"]),
            int(r["exercise_minutes"]),
            int(r["assignments_completed"]),
            float(r["attendance_percentage"]),
            int(r["stress_level"]),
            float(r["focus_score"]),
            float(r["final_grade"]),
            float(r["productivity_score"]),
            float(r["total_screen_time"]),
            float(r["distraction_ratio"]),
        ))

    # --- 3d. Bulk insert (fast: one round trip instead of 20,000) ---
    insert_sql = """
        INSERT INTO student_facts (
            student_id, gender_id, band_id, sleep_cat_id,
            age, study_hours_per_day, sleep_hours, phone_usage_hours,
            social_media_hours, youtube_hours, gaming_hours, breaks_per_day,
            coffee_intake_mg, exercise_minutes, assignments_completed,
            attendance_percentage, stress_level, focus_score, final_grade,
            productivity_score, total_screen_time, distraction_ratio
        ) VALUES %s;
    """
    execute_values(cur, insert_sql, rows, page_size=1000)

    conn.commit()
    cur.execute("SELECT COUNT(*) FROM student_facts;")
    count = cur.fetchone()[0]
    cur.close()
    conn.close()
    print(f"  -> loaded {count} rows into student_facts")


# ------------------------------------------------------------
# main
# ------------------------------------------------------------
if __name__ == "__main__":
    if not DATABASE_URL:
        raise SystemExit(
            "ERROR: DATABASE_URL not set. Create data-pipeline/.env with:\n"
            "DATABASE_URL=your_neon_connection_string"
        )

    df = extract(CSV_PATH)
    df = transform(df)
    load(df)
    print("ETL complete.")