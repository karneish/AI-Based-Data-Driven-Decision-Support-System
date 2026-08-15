@echo off
echo ======================================
echo  DSS-MIP - Decision Support System
echo ======================================
echo.

echo [1/1] Starting Python Backend (FastAPI)...
start "DSS-MIP Backend" cmd /k "cd /d %~dp0..\backend && python -m venv .venv && call .venv\Scripts\activate.bat && pip install -r requirements.txt && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo ======================================
echo  App       -> http://localhost:8000
echo  API Docs  -> http://localhost:8000/docs
echo ======================================
echo.
pause
