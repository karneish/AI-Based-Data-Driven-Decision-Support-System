#!/bin/bash
echo "======================================"
echo " DSS-MIP - Decision Support System"
echo "======================================"
echo ""

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[1/1] Starting Python Backend (FastAPI)..."
cd "$ROOT_DIR/backend"
python -m venv .venv 2>/dev/null
source .venv/bin/activate
pip install -r requirements.txt -q
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo ""
echo "======================================"
echo " App       -> http://localhost:8000"
echo " API Docs  -> http://localhost:8000/docs"
echo "======================================"
echo ""
echo "Press Ctrl+C to stop the server."

trap "kill $BACKEND_PID 2>/dev/null; echo 'Server stopped.'" EXIT
wait
