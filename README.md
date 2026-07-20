# Productivity App & Focus Lab

A full-stack productivity platform for tracking tasks and habits, paired with **Focus Lab** — a data analytics pipeline that studies 20,000 student records to surface what lifestyle habits drive productivity.

The project has two parts:

1. **Productivity App** — a MERN application (React, Node.js, Express, MongoDB) with authentication, task/habit tracking, and a real-time analytics dashboard.
2. **Focus Lab** — a separate data pipeline (Python ETL → PostgreSQL → SQL → React page) that analyzes a productivity dataset and presents the insights inside the app.

## Features

### Productivity App
* JWT-based authentication and protected routes
* Task management with priority levels, due dates, and overdue detection
* Habit tracking with streak calculation and progress toward targets
* Productivity analytics dashboard with charts (completion rates, streaks, weekly trends)
* RESTful API architecture

### Focus Lab (Data Pipeline)
* Python **ETL pipeline**: extracts a 20,000-record CSV, cleans and validates it, and engineers features (total screen time, distraction ratio, productivity/sleep buckets)
* **PostgreSQL star schema** (fact + dimension tables) modeling the data for analytics
* Analytical **SQL** using window functions, common table expressions, and a stored procedure to surface behavioral insights
* Insights served to the React app via a generated JSON layer and displayed on the Focus Lab page
* **Power BI dashboard** visualizing the key findings

## Key Insights (from Focus Lab)

* Productivity declines steadily as daily screen time rises
* There is a clear sleep "sweet spot" — under-sleepers score lowest on productivity
* Study hours show the strongest positive relationship with productivity

## Tech Stack

### Frontend
* React (Hooks), React Router
* Tailwind CSS
* Recharts
* Axios

### Backend
* Node.js, Express.js
* MongoDB, Mongoose
* JWT authentication

### Data Pipeline (Focus Lab)
* Python (pandas)
* PostgreSQL (hosted on Neon)
* SQL (window functions, CTEs, stored procedures)
* Power BI

### Deployment
* Frontend: Vercel
* Backend: Render
* App Database: MongoDB Atlas
* Analytics Database: Neon (PostgreSQL)

## Project Structure

```
root/
 ├── backend/                 # Express + MongoDB API
 ├── frontend/                # React app (includes the Focus Lab page)
 │    └── src/data/           # insights.json produced by the pipeline
 └── data-pipeline/           # Focus Lab: ETL, schema, queries, Power BI
      ├── data/               # source CSV
      ├── schema.sql          # PostgreSQL star schema
      ├── etl.py              # extract, transform, load
      ├── queries.sql         # analytical SQL queries
      ├── generate_insights.py# runs queries -> writes insights.json
      └── powerbi/            # dashboard (.pbix) + screenshots
```

## Installation

### Backend
```
cd backend
npm install
npm start
```

### Frontend
```
cd frontend
npm install
npm start
```

### Data Pipeline (Focus Lab)
```
cd data-pipeline
pip install pandas psycopg2-binary python-dotenv
python etl.py                # load data into PostgreSQL
python generate_insights.py  # generate insights.json for the app
```

## Environment Variables

Backend — create `backend/.env`:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
```

Data pipeline — create `data-pipeline/.env`:
```
DATABASE_URL=your_neon_postgres_connection_string
```

## Power BI Dashboard

The Power BI dashboard (`data-pipeline/powerbi/`) visualizes the Focus Lab findings —
KPI cards, productivity by sleep hours, productivity by study hours, and productivity
by phone usage, with a gender slicer for interactivity.
![Focus Lab Dashboard](data-pipeline/powerbi/focuslab_dashboard.png)


## Author

Ashish Kumar Sant