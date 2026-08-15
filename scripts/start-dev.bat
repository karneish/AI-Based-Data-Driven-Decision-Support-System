@echo off
echo ======================================
echo  DSS-MIP - Decision Support System
echo ======================================
echo.

echo [1/2] Starting Python Backend (FastAPI)...
start "DSS-MIP Backend" cmd /k "cd /d %~dp0..\backend && python -m venv .venv && call .venv\Scripts\activate.bat && pip install -r requirements.txt && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 4 /nobreak >nul

echo [2/2] Starting React Frontend (Vite)...
start "DSS-MIP Frontend" cmd /k "cd /d %~dp0..\frontend && npm install --legacy-peer-deps && npm run dev"

echo.
echo ======================================
echo  Backend  -> http://localhost:8000
echo  Frontend -> http://localhost:5173
echo  API Docs -> http://localhost:8000/docs
echo ======================================
echo.
pause
