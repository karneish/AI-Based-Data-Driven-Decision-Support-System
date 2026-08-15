@echo off
echo ======================================
echo  DSS-MIP - Decision Support System
echo ======================================
echo.

echo [1/2] Starting Python Backend (FastAPI) on :8000...
start "DSS-MIP Backend" cmd /k "cd /d %~dp0..\backend && python -m venv .venv && call .venv\Scripts\activate.bat && pip install -r requirements.txt && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Starting Next.js Frontend on :3000...
start "DSS-MIP Frontend" cmd /k "cd /d %~dp0..\frontend && npm install && npm run dev"

echo.
echo ======================================
echo  App       -> http://localhost:3000
echo  API       -> http://localhost:8000
echo  API Docs  -> http://localhost:8000/docs
echo ======================================
echo.
echo Note: the frontend calls http://localhost:8000 in dev mode.
echo To override, create frontend\.env.local with:
echo   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
echo.
pause
