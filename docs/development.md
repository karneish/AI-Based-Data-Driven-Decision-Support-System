# Development Guide

## Prerequisites

- **Python 3.10+** — runs the FastAPI backend.
- **Node.js 18+ / npm** — runs the Next.js frontend.

## Quick start

Launch both servers from the project root using the provided scripts:

```bash
# Windows
scripts\start-dev.bat

# Unix/macOS
./scripts/start-dev.sh
```

The script starts the backend on `:8000` and the frontend on `:3000`.

### Manual setup — backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows
source .venv/bin/activate         # Linux/macOS

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Swagger docs: http://localhost:8000/docs

Models are trained once at startup; you'll see the trained-model log before the server accepts requests.

### Manual setup — frontend

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:3000

In dev mode the frontend defaults to `http://localhost:8000`. To point it elsewhere, create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Environment configuration

| File | Purpose |
|---|---|
| `backend/.env.example` | Backend settings (CORS origins, app metadata, frontend URL) |
| `frontend/.env.example` | Frontend API base URL (`NEXT_PUBLIC_API_BASE_URL`) |
| `.env.example` | Root-level compose ports + pointers |

## Testing

```bash
# Backend (API tests)
cd backend
pip install -r requirements-dev.txt
pytest tests -v

# Frontend (type-check + lint + production build)
cd frontend
npm run build          # runs ESLint + tsc + next build
npm run lint           # ESLint only
```

## Production build

### Backend (Docker)

```bash
docker compose up --build
```

- API docs: http://localhost:8000/docs

> Use a **single worker** — the models are trained in memory at startup and shared within the process.

### Frontend

```bash
cd frontend
npm run build          # produces .next/ (statically prerendered + SSR)
```

## Deployment

- **Vercel** — hosts the Next.js frontend. The root `vercel.json` points the service at `frontend/` (framework `nextjs`). Set `NEXT_PUBLIC_API_BASE_URL` in the Vercel project if your Render URL differs from the default `https://dss-mip.onrender.com`.
- **Render** — hosts the FastAPI backend as a web service from the repo root using the `Dockerfile`. Set `FRONTEND_URL` to your Vercel URL so `GET /` on the API redirects visitors there.

CORS: the backend defaults to `CORS_ORIGINS=*` (no cookies are sent, so a wildcard is safe). Tighten it to your Vercel domain in `backend/.env` if desired.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main`/`develop`:

1. **Backend job** — installs `requirements-dev.txt`, runs `pytest backend/tests`.
2. **Frontend job** — `npm ci`, `npm run lint`, `npm run build` (working directory `frontend/`).

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
