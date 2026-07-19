-- ============================================================
-- Focus Lab - Star Schema (PostgreSQL / Neon)
-- Tables used for analytics and dashboard reporting.
-- Run once in the Neon SQL Editor.
-- ============================================================

-- Drop existing tables before recreating them
DROP TABLE IF EXISTS student_facts CASCADE;
DROP TABLE IF EXISTS dim_gender CASCADE;
DROP TABLE IF EXISTS dim_productivity_band CASCADE;
DROP TABLE IF EXISTS dim_sleep_category CASCADE;

-- ----------------------------
-- Dimension Tables
-- ----------------------------

-- Stores gender values
CREATE TABLE dim_gender (
    gender_id SERIAL PRIMARY KEY,
    gender_name VARCHAR(20) NOT NULL UNIQUE
);

-- Groups students into productivity ranges
CREATE TABLE dim_productivity_band (
    band_id SERIAL PRIMARY KEY,
    band_name VARCHAR(20) NOT NULL UNIQUE,
    min_score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL
);

-- Categorizes sleep duration
CREATE TABLE dim_sleep_category (
    sleep_cat_id SERIAL PRIMARY KEY,
    sleep_cat_name VARCHAR(20) NOT NULL UNIQUE
);

-- ----------------------------
-- Fact Table
-- ----------------------------

-- Stores one record per student along with all numeric metrics
CREATE TABLE student_facts (
    student_id INT PRIMARY KEY,

    -- Links to dimension tables
    gender_id INT REFERENCES dim_gender(gender_id),
    band_id INT REFERENCES dim_productivity_band(band_id),
    sleep_cat_id INT REFERENCES dim_sleep_category(sleep_cat_id),

    -- Student data from the dataset
    age INT,
    study_hours_per_day NUMERIC(5,2),
    sleep_hours NUMERIC(5,2),
    phone_usage_hours NUMERIC(5,2),
    social_media_hours NUMERIC(5,2),
    youtube_hours NUMERIC(5,2),
    gaming_hours NUMERIC(5,2),
    breaks_per_day INT,
    coffee_intake_mg INT,
    exercise_minutes INT,
    assignments_completed INT,
    attendance_percentage NUMERIC(5,2),
    stress_level INT,
    focus_score NUMERIC(5,2),
    final_grade NUMERIC(5,2),
    productivity_score NUMERIC(5,2),

    -- Calculated during ETL
    total_screen_time NUMERIC(5,2),
    distraction_ratio NUMERIC(6,2)
);

-- ----------------------------
-- Seed Data
-- ----------------------------

INSERT INTO dim_gender (gender_name) VALUES
    ('Female'),
    ('Male'),
    ('Other');

INSERT INTO dim_productivity_band (band_name, min_score, max_score) VALUES
    ('Low', 0, 40),
    ('Medium', 40.01, 70),
    ('High', 70.01, 100);

INSERT INTO dim_sleep_category (sleep_cat_name) VALUES
    ('Under'),
    ('Optimal'),
    ('Over');

-- Verify the lookup tables
-- SELECT * FROM dim_gender;
-- SELECT * FROM dim_productivity_band;
-- SELECT * FROM dim_sleep_category;