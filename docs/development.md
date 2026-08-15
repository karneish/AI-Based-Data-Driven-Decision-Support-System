# Development Guide

## Prerequisites

- **Python 3.10+** (backend)
- **Node.js 18+** and **npm 9+** (frontend)

## Quick start

Run both services from the project root using the provided scripts:

```bash
# Windows
scripts\start-dev.bat

# Unix/macOS
./scripts/start-dev.sh
```

### Manual backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows
source .venv/bin/activate         # Linux/macOS

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

### Manual frontend setup

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

- App: http://localhost:5173 (dev proxy forwards `/api` to `:8000`)

## Environment configuration

Copy the relevant template to `.env` and adjust values if needed:

| File | Purpose |
|---|---|
| `backend/.env.example` | Backend settings (CORS origins, app metadata) |
| `frontend/.env.example` | `VITE_API_BASE_URL` for direct API calls |
| `.env.example` | Root-level compose ports |

## Testing

### Backend

```bash
cd backend
pip install -r requirements-dev.txt
pytest tests -v
```

### Frontend

```bash
cd frontend
npm run typecheck
npm run build
```

## Production build

The FastAPI backend serves both the API (`/api/*`) and the built React SPA (`/`). In Docker, the multi-stage `Dockerfile` builds the frontend automatically:

```bash
docker compose up --build
```

- App + API docs: http://localhost:8000

To build the frontend manually (e.g. to test static serving without Docker):

```bash
cd frontend
npm run build          # outputs to frontend/dist
# copy frontend/dist/* into backend/app/static/
cd ../backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main`/`develop`:

1. **Backend job** — installs `requirements-dev.txt`, runs `pytest backend/tests`.
2. **Frontend job** — installs with `npm ci --legacy-peer-deps`, runs `npm run typecheck` and `npm run build`.

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
