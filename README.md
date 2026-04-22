# Productivity App

## Overview

A full-stack productivity management application designed to help users track tasks, build habits, and analyze productivity patterns. The system provides real-time analytics, personalized habit tracking, and an interactive dashboard.

## Features

* User authentication and authorization (JWT-based)
* Task management (create, update, delete, status tracking)
* Habit tracking with streak calculation
* Productivity analytics and visualization
* Interactive dashboard with charts
* RESTful API architecture

## Tech Stack

### Frontend

* React
* Axios
* Recharts

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

## Project Structure

```
root/
 ├── backend/
 ├── frontend/
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

## Environment Variables

Create a `.env` file in the backend:

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
```

## Future Improvements

* AI-based productivity insights
* Advanced analytics
* Mobile optimization

## Author

Ashish Kumar
