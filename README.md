# Simple Project Tracker

A simple full-stack task tracker for creating, viewing, updating, and deleting tasks.

## Features

- View all tasks
- Create new tasks without reloading the page
- Change a task's status (`Todo`, `In Progress`, `Done`)
- Delete tasks
- Input validation (title required, status must be a valid option)
- Database tables created automatically on startup

## Tech Stack

| Layer    | Technology                                       |
| -------- | ------------------------------------------------ |
| Backend  | Python 3.12, Django 5.2, Django REST Framework   |
| Database | PostgreSQL 16                                    |
| Frontend | React 19, Vite, Tailwind CSS 4 (dark theme)      |
| Tooling  | Docker Compose, Django test runner, Vitest + React Testing Library |

## Quick Start

If you already have Git and Docker installed and running:

```bash
git clone https://github.com/xixxydev/simple-project-tracker.git
cd simple-project-tracker
cp .env.example .env
docker compose up --build
```

Then open **http://localhost:5173**.

---

## Setup Guide

These steps work on macOS, Windows, and Linux. Everything (database, backend, frontend) runs in Docker, so you don't need to install Python, Node.js, or PostgreSQL.

### 1. Install the prerequisites

| Tool | Install | Check it works |
| ---- | ------- | -------------- |
| Git | https://git-scm.com/downloads | `git --version` |
| Docker Desktop (macOS / Windows) | https://docs.docker.com/get-docker/ | `docker --version` and `docker compose version` |
| Docker Engine + Compose plugin (Linux) | https://docs.docker.com/engine/install/ | `docker --version` and `docker compose version` |

Make sure Docker is **running** before continuing (on macOS/Windows, open Docker Desktop and wait until it says it's running). Check with:

```bash
docker info
```

If this prints an error such as "Cannot connect to the Docker daemon", Docker isn't running yet.

### 2. Get the code

```bash
git clone https://github.com/xixxydev/simple-project-tracker.git
cd simple-project-tracker
```

### 3. Create your `.env` file

All configuration, including database credentials, is read from a `.env` file in the project root. Create it from the template:

macOS / Linux:

```bash
cp .env.example .env
```

Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

The defaults work as-is for local development. See [Configuration](#configuration) if you need to change ports or credentials. `.env` is git-ignored, so your values are never committed.

### 4. Start the app

```bash
docker compose up --build
```

The first run downloads images and installs dependencies, which takes a few minutes. Later runs start in seconds. Startup order:

1. **db** starts PostgreSQL and waits until it's healthy
2. **backend** runs database migrations (creates the tables), then starts the API
3. **frontend** starts the Vite dev server

You're ready when the logs show both of these lines:

```
backend-1   | Starting development server at http://0.0.0.0:8000/
frontend-1  |   ➜  Local:   http://localhost:5173/
```

Tip: use `docker compose up --build -d` to run in the background, and `docker compose logs -f` to follow the logs.

### 5. Open the app

| What | URL |
| ---- | --- |
| Web app | http://localhost:5173 |
| API (also browsable in a browser) | http://localhost:8000/api/tasks |
| PostgreSQL (for a DB client) | `localhost:5432`, credentials from `.env` |

Try it out: add a task, change its status with the dropdown, delete it, then reload the page. Your tasks are stored in PostgreSQL and persist.

### 6. Stop, restart, and reset

```bash
# Stop (press Ctrl+C if running in the foreground), or:
docker compose down

# Start again (data is kept)
docker compose up

# Stop and delete all data (fresh database next time)
docker compose down -v
```

### 7. Run the tests (optional)

With the app running:

```bash
docker compose exec backend python manage.py test   # backend API tests
docker compose exec frontend npm test               # frontend tests
```

---

## Configuration

All settings live in `.env` (copied from `.env.example`):

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `POSTGRES_DB` | `project_tracker` | Database name |
| `POSTGRES_USER` | `tracker` | Database user |
| `POSTGRES_PASSWORD` | `change-me` | Database password |
| `DB_HOST` | `localhost` | DB host when running Django **without** Docker (Docker sets it to `db` automatically) |
| `DB_PORT` | `5432` | DB port when running Django without Docker |
| `DJANGO_SECRET_KEY` | placeholder | Django secret key; set a long random value for anything beyond local dev |
| `DJANGO_DEBUG` | `True` | Django debug mode |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Hosts Django will serve |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Frontend URL(s) allowed to call the API |
| `VITE_API_URL` | `http://localhost:8000/api` | API URL the frontend calls from the browser |
| `FRONTEND_PORT` | `5173` | Port for the web app on your machine |
| `BACKEND_PORT` | `8000` | Port for the API on your machine |
| `POSTGRES_PORT` | `5432` | Port for PostgreSQL on your machine |

**Changing ports:** if a port is already in use on your machine, change it in `.env` and keep the related values in sync:

- Changed `FRONTEND_PORT`? Update `CORS_ALLOWED_ORIGINS` (e.g. `http://localhost:3000`).
- Changed `BACKEND_PORT`? Update `VITE_API_URL` (e.g. `http://localhost:8080/api`).

Then restart with `docker compose up --build`.

To generate a secret key:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

If you change `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` after the database was first created, run `docker compose down -v` so PostgreSQL is re-initialised with the new values (this deletes existing data).

---

## Running Without Docker (optional)

Useful if you want to run the backend or frontend directly on your machine. PostgreSQL still runs in Docker.

### Backend

Requires **Python 3.10 or newer**.

```bash
cp .env.example .env            # Windows: Copy-Item .env.example .env (keep DB_HOST=localhost)
docker compose up -d db         # start only PostgreSQL
cd backend
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver      # http://localhost:8000/api/tasks
python manage.py test           # run tests
```

### Frontend

Requires **Node.js 20.19+ or 22.12+**. In a second terminal:

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
npm test        # run tests
```

The frontend reads `VITE_API_URL` from the project-root `.env`.

---

## API Reference

Base URL: `http://localhost:8000/api`

| Method | Endpoint      | Description         | Success |
| ------ | ------------- | ------------------- | ------- |
| GET    | `/tasks`      | List all tasks      | `200`   |
| POST   | `/tasks`      | Create a new task   | `201`   |
| PUT    | `/tasks/<id>` | Update a task       | `200`   |
| DELETE | `/tasks/<id>` | Delete a task by ID | `204`   |

A trailing slash is optional (`/api/tasks` and `/api/tasks/` both work). Unknown IDs return `404`.

**Task payload** (POST / PUT):

```json
{ "title": "String", "description": "String", "status": "Todo" }
```

- `title`: required, cannot be empty (max 200 characters)
- `description`: optional
- `status`: one of `Todo`, `In Progress`, `Done` (defaults to `Todo`)
- `PUT` accepts partial updates, e.g. `{ "status": "Done" }`

**Task response:**

```json
{
  "id": 1,
  "title": "Write docs",
  "description": "README",
  "status": "Todo",
  "created_at": "2026-11-18T14:29:56.783275Z",
  "updated_at": "2026-11-18T14:29:56.783285Z"
}
```

**Validation errors** return `400` with messages per field, for example:

```json
{ "title": ["Title must not be empty."] }
```

```json
{ "status": ["Status must be one of: Todo, In Progress, Done."] }
```

**Examples:**

```bash
# Create
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write docs", "description": "README", "status": "Todo"}'

# List
curl http://localhost:8000/api/tasks

# Update status
curl -X PUT http://localhost:8000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "Done"}'

# Delete
curl -X DELETE http://localhost:8000/api/tasks/1
```

---

## Troubleshooting

**"Cannot connect to the Docker daemon"**
Docker isn't running. Start Docker Desktop (macOS/Windows) or `sudo systemctl start docker` (Linux), then retry.

**"port is already allocated" / "address already in use"**
Another program is using `5173`, `8000` or `5432` (often a locally installed PostgreSQL on `5432`). Change `FRONTEND_PORT`, `BACKEND_PORT` or `POSTGRES_PORT` in `.env` (see [Configuration](#configuration)) and run `docker compose up --build` again.

**The web app shows "Could not reach the server"**
The API isn't reachable. Check `docker compose ps` shows the backend running, and `docker compose logs backend` for errors. If you changed `BACKEND_PORT`, make sure `VITE_API_URL` matches, then restart.

**Browser console shows a CORS error**
`CORS_ALLOWED_ORIGINS` doesn't match the URL you opened the app on. Set it to exactly that origin (e.g. `http://localhost:5173`) and restart. Note `localhost` and `127.0.0.1` count as different origins.

**Frontend fails with a missing package after pulling new changes**
The container keeps its own `node_modules`. Rebuild and refresh it with:

```bash
docker compose up --build -V
```

**Backend container exits with `/bin/sh^M: not found` or `exec ./entrypoint.sh: no such file or directory` (Windows)**
The script was checked out with Windows line endings. The repo's `.gitattributes` prevents this, so delete your copy, clone the repository again, and run `docker compose up --build`.

**Start completely fresh**

```bash
docker compose down -v --rmi local
docker compose up --build
```

---

## Project Structure

```
backend/                Django REST Framework API
  config/               Django settings (read from env vars) and URLs
  tasks/                Task model, serializer (validation), views, URLs, tests
  Dockerfile
  entrypoint.sh         Runs migrations, then starts the server
  requirements.txt      Pinned Python dependencies
frontend/               React + Tailwind app (Vite)
  src/api.js            HTTP calls to the backend (fetch)
  src/hooks/useTasks.js Task state, updated after each successful API call
  src/components/       TaskForm, TaskList, TaskItem
  src/App.test.jsx      Frontend tests
  Dockerfile
docker-compose.yml      PostgreSQL + backend + frontend services
.env.example            Template for environment variables
.gitattributes          Keeps shell scripts LF so they run on Windows checkouts
```
