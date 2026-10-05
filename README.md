# Habit Tracker — Frontend

React frontend for a full-stack habit tracking application.

The frontend provides the user interface for managing and tracking habits and communicates with a Django REST API backend.

## Overview

Habit Tracker is a full-stack web application built with React and Vite on the frontend and Django REST Framework on the backend.

The frontend is deployed on Netlify and is connected to the backend through a REST API.

## Features

- Habit tracking interface
- Daily habit management
- Habit history
- Streak visualization
- User-oriented dashboard and application views
- REST API integration
- Responsive web interface
- Production deployment on Netlify

## Tech Stack

- **Frontend:** React
- **Build Tool:** Vite
- **Language:** JavaScript
- **Backend Integration:** Django REST Framework
- **Deployment:** Netlify
- **Version Control:** Git, GitHub
- **Containerization:** Docker

## Project Structure

```text
HabitTracker-frontend/
├── public/
├── src/
├── .gitignore
├── Dockerfile
├── Dockerfile.dev
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
└── vite.config.js
```

## Architecture

The frontend is part of a separated frontend/backend architecture:

```text
React + Vite
     │
     │ REST API
     ▼
Django REST Framework
     │
     ▼
PostgreSQL
     │
     ▼
  Supabase
```

## Deployment

The frontend is deployed on **Netlify**.

The project uses GitHub as the source repository and supports continuous deployment from the repository.

The frontend communicates with the Django REST API deployed on Render.

## Running Locally

### Prerequisites

- Node.js
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/Ricardoge25/HabitTracker-frontend.git
cd HabitTracker-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at the local address provided by Vite.

## Production Build

Create a production build with:

```bash
npm run build
```

Preview the production build locally with:

```bash
npm run preview
```

## Docker

The repository includes Docker configuration for development and production environments:

- `Dockerfile`
- `Dockerfile.dev`

## Project Status

The frontend is actively deployed as part of the Habit Tracker application.

## Author

**Ricardo González**

Software Engineer | Backend & Full Stack Developer

GitHub: https://github.com/Ricardoge25
