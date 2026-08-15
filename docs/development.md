# Development Guide

## Prerequisites

- **Python 3.10+** — the app runs entirely on a single FastAPI process (API + server-rendered UI).

## Quick start

Run the single server from the project root using the provided scripts:

```bash
# Windows
scripts\start-dev.bat

# Unix/macOS
./scripts/start-dev.sh
```

### Manual setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows
source .venv/bin/activate         # Linux/macOS

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- App: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

Models are trained once at startup (a few seconds); you'll see the trained-model log before the server accepts requests.

## Environment configuration

Copy the relevant template to `.env` and adjust values if needed:

| File | Purpose |
|---|---|
| `backend/.env.example` | Backend settings (CORS origins, app metadata, `SESSION_SECRET`) |
| `.env.example` | Root-level compose ports |

> Set a strong `SESSION_SECRET` for production — it signs the login cookie.

## Testing

```bash
cd backend
pip install -r requirements-dev.txt
pytest tests -v
```

## Production build

The FastAPI backend serves both the API (`/api/*`) and the server-rendered web UI (`/`). The `Dockerfile` is a single Python stage:

```bash
docker compose up --build
```

- App + API docs: http://localhost:8000

To run it locally without Docker:

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

> Use a **single worker** — the models are trained in memory at startup and shared within the process.

## Deployment

- **Render** — single web service from the repo root; uses the `Dockerfile`.
- **Vercel** — single FastAPI service configured in the root `vercel.json` (`root: "backend"`, `entrypoint: "app/main.py"`).

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main`/`develop`:

1. **Backend job** — installs `requirements-dev.txt`, runs `pytest backend/tests`.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit changes: `git commit -m 'Add amazing feature'`.
4. Push and open a Pull Request.

## Demo credentials

| Username | Password | Display Name | Role |
|---|---|---|---|
| `karneish` | `pass123` | Karneish | Student |
| `admin` | `admin123` | Dr. Admin | Advisor |
| `student1` | `pass123` | Arjun Sharma | Student |
| `student2` | `pass123` | Priya Menon | Student |
