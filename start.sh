#!/bin/bash
echo "======================================"
echo " DSS-MIP - Decision Support System"
echo "======================================"
echo ""

# Start backend
echo "[1/2] Starting Python Backend (FastAPI)..."
cd "$(dirname "$0")/backend"
pip install -r requirements.txt -q
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 3

# Start frontend
echo "[2/2] Starting React Frontend (Vite)..."
cd "$(dirname "$0")/frontend"
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
