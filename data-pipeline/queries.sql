-- ============================================================
--  Focus Lab — Analytical Queries
--  Runs on the star schema (student_facts + 3 dimensions).
--
--  Each query demonstrates a specific SQL skill and answers a
--  real question about what drives student productivity.
--  Run these in the Neon SQL Editor, one at a time.
-- ============================================================


-- ------------------------------------------------------------
-- Q1. GROUP BY + JOIN — Average productivity by sleep category
--     Skill: aggregation + joining fact to dimension
--     Insight: is there a sleep "sweet spot"?
-- ------------------------------------------------------------
SELECT
    d.sleep_cat_name              AS sleep_category,
    COUNT(*)                      AS students,
    ROUND(AVG(f.productivity_score), 2) AS avg_productivity,
    ROUND(AVG(f.focus_score), 2)  AS avg_focus
FROM student_facts f
JOIN dim_sleep_category d ON f.sleep_cat_id = d.sleep_cat_id
GROUP BY d.sleep_cat_name
ORDER BY avg_productivity DESC;


-- ------------------------------------------------------------
-- Q2. GROUP BY + HAVING — Productivity bands and their habits
--     Skill: aggregation with a post-group filter
--     Insight: how do high vs low performers differ in behavior?
-- ------------------------------------------------------------
SELECT
    b.band_name                          AS productivity_band,
    COUNT(*)                             AS students,
    ROUND(AVG(f.study_hours_per_day), 2) AS avg_study_hours,
    ROUND(AVG(f.total_screen_time), 2)   AS avg_screen_time,
    ROUND(AVG(f.sleep_hours), 2)         AS avg_sleep,
    ROUND(AVG(f.stress_level), 2)        AS avg_stress
FROM student_facts f
JOIN dim_productivity_band b ON f.band_id = b.band_id
GROUP BY b.band_name
HAVING COUNT(*) > 100          -- ignore tiny groups
ORDER BY avg_study_hours DESC;


-- ------------------------------------------------------------
-- Q3. WINDOW FUNCTION (RANK) — Rank occupations... here, rank
--     genders by avg productivity, plus each row's rank.
--     Skill: RANK() OVER (ORDER BY ...)
--     Note: window functions keep every group row AND add a rank.
-- ------------------------------------------------------------
SELECT
    g.gender_name,
    ROUND(AVG(f.productivity_score), 2) AS avg_productivity,
    RANK() OVER (ORDER BY AVG(f.productivity_score) DESC) AS productivity_rank
FROM student_facts f
JOIN dim_gender g ON f.gender_id = g.gender_id
GROUP BY g.gender_name;


-- ------------------------------------------------------------
-- Q4. WINDOW FUNCTION (NTILE) — Split students into 4 quartiles
--     by screen time, then see productivity per quartile.
--     Skill: NTILE() bucketing + subquery/CTE
--     Insight: does more screen time drag productivity down?
-- ------------------------------------------------------------
WITH screen_quartiles AS (
    SELECT
        productivity_score,
        total_screen_time,
        NTILE(4) OVER (ORDER BY total_screen_time) AS screen_quartile
    FROM student_facts
)
SELECT
    screen_quartile,
    ROUND(MIN(total_screen_time), 2) AS min_screen,
    ROUND(MAX(total_screen_time), 2) AS max_screen,
    ROUND(AVG(productivity_score), 2) AS avg_productivity
FROM screen_quartiles
GROUP BY screen_quartile
ORDER BY screen_quartile;


-- ------------------------------------------------------------
-- Q5. CTE — High performers profile
--     Skill: WITH clause for readability
--     Insight: what does the top productivity band look like on
--     average across all key habits, in one clean query?
-- ------------------------------------------------------------
WITH high_performers AS (
    SELECT f.*
    FROM student_facts f
    JOIN dim_productivity_band b ON f.band_id = b.band_id
    WHERE b.band_name = 'High'
)
SELECT
    COUNT(*)                             AS high_performers,
    ROUND(AVG(study_hours_per_day), 2)   AS avg_study,
    ROUND(AVG(sleep_hours), 2)           AS avg_sleep,
    ROUND(AVG(total_screen_time), 2)     AS avg_screen,
    ROUND(AVG(exercise_minutes), 2)      AS avg_exercise,
    ROUND(AVG(distraction_ratio), 2)     AS avg_distraction_ratio
FROM high_performers;


-- ------------------------------------------------------------
-- Q6. CASE + conditional aggregation — distraction level pivot
--     Skill: bucket with CASE, count each bucket in one pass
--     Insight: how many students fall into each distraction level?
-- ------------------------------------------------------------
SELECT
    SUM(CASE WHEN distraction_ratio < 2 THEN 1 ELSE 0 END)  AS focused,
    SUM(CASE WHEN distraction_ratio >= 2
             AND distraction_ratio < 5 THEN 1 ELSE 0 END)   AS moderate,
    SUM(CASE WHEN distraction_ratio >= 5 THEN 1 ELSE 0 END) AS highly_distracted
FROM student_facts;


-- ------------------------------------------------------------
-- Q7. STORED PROCEDURE (function) — profile summary for a band
--     Skill: reusable server-side logic (JD: "stored procedures")
--     Postgres uses functions for value-returning logic.
--     Call it with:  SELECT * FROM band_profile('High');
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION band_profile(target_band VARCHAR)
RETURNS TABLE (
    students        BIGINT,
    avg_study       NUMERIC,
    avg_sleep       NUMERIC,
    avg_screen      NUMERIC,
    avg_stress      NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT,
        ROUND(AVG(f.study_hours_per_day), 2),
        ROUND(AVG(f.sleep_hours), 2),
        ROUND(AVG(f.total_screen_time), 2),
        ROUND(AVG(f.stress_level), 2)
    FROM student_facts f
    JOIN dim_productivity_band b ON f.band_id = b.band_id
    WHERE b.band_name = target_band;
END;
$$;

-- Example calls (run after creating the function):
-- SELECT * FROM band_profile('High');
-- SELECT * FROM band_profile('Low');


-- ------------------------------------------------------------
-- Q8. The "headline" query for the dashboard — overall KPIs
--     Skill: simple aggregation, single-row summary
--     Used to populate the top KPI cards on the Focus Lab page.
-- ------------------------------------------------------------
SELECT
    COUNT(*)                             AS total_students,
    ROUND(AVG(productivity_score), 2)    AS avg_productivity,
    ROUND(AVG(study_hours_per_day), 2)   AS avg_study_hours,
    ROUND(AVG(sleep_hours), 2)           AS avg_sleep,
    ROUND(AVG(total_screen_time), 2)     AS avg_screen_time
FROM student_facts;