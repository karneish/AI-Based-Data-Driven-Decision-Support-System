#!/bin/bash
echo "======================================"
echo " DSS-MIP - Decision Support System"
echo "======================================"
echo ""

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[1/2] Starting Python Backend (FastAPI)..."
cd "$ROOT_DIR/backend"
python -m venv .venv 2>/dev/null
source .venv/bin/activate
pip install -r requirements.txt -q
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 3

echo "[2/2] Starting React Frontend (Vite)..."
cd "$ROOT_DIR/frontend"
npm install --legacy-peer-deps --silent
npm run dev &
FRONTEND_PID=$!

echo ""
echo "======================================"
echo " Backend  -> http://localhost:8000"
echo " Frontend -> http://localhost:5173"
echo " API Docs -> http://localhost:8000/docs"
echo "======================================"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped.'" EXIT
wait
