# Simple Project Tracker

A simple full-stack task tracker for creating, viewing, updating, and deleting tasks.

## Tech Stack

- **Backend:** Django REST Framework
- **Database:** PostgreSQL
- **Frontend:** React + Tailwind CSS

## Features

- View all tasks
- Create new tasks without reloading the page
- Change a task's status (`Todo` → `In Progress` → `Done`)
- Delete tasks

## API Endpoints

| Method | Endpoint      | Description         |
| ------ | ------------- | ------------------- |
| GET    | `/tasks`      | List all tasks      |
| POST   | `/tasks`      | Create a new task   |
| PUT    | `/tasks/<id>` | Update a task       |
| DELETE | `/tasks/<id>` | Delete a task by ID |

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Docker Compose

### Run with Docker (recommended)

```bash
git clone https://github.com/xixxydev/simple-project-tracker.git
cd simple-project-tracker
cp .env.example .env
docker compose up --build
```

- API: http://localhost:8000
- PostgreSQL: `localhost:5432`

Database tables are created automatically on startup (Django migrations run before the server starts). Code changes in `backend/` reload automatically.

Useful commands:

```bash
docker compose down        # stop
docker compose down -v     # stop and delete the database volume
docker compose exec backend python manage.py <command>
```

### Configuration

All settings, including database credentials, come from environment variables in `.env` (see `.env.example`). `.env` is git-ignored and never committed. If port `8000` or `5432` is already in use, change `BACKEND_PORT` or `POSTGRES_PORT` in `.env`.

### Run the backend without Docker (optional)

Requires Python 3.10+. PostgreSQL still runs in Docker:

```bash
cp .env.example .env       # DB_HOST=localhost
docker compose up -d db
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Project Structure

```
backend/             Django REST Framework API
  config/            Django settings and URLs
  Dockerfile
  entrypoint.sh      Runs migrations, then starts the server
  requirements.txt
docker-compose.yml   PostgreSQL + backend services
.env.example         Template for environment variables
```
