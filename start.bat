@echo off
echo ========================================================
echo Starting ConvoQ (FastAPI Backend + Vite Frontend)
echo ========================================================

:: Start Backend
start "ConvoQ Backend (Port 8001)" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload"

:: Wait 2 seconds
timeout /t 2 /nobreak >nul

:: Start Frontend
cd frontend
start "ConvoQ Frontend (Port 5173)" cmd /k "npm run dev"

echo.
echo ConvoQ servers started!
echo Frontend: http://localhost:5173
echo Backend API: http://127.0.0.1:8001
echo ========================================================
