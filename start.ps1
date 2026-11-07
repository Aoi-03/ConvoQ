# ConvoQ One-Click Start Script
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting ConvoQ (FastAPI Backend + Vite Frontend)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Start Backend on 8001
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload"

Start-Sleep -Seconds 2

# Start Frontend on 5173
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm run dev"

Write-Host ""
Write-Host "ConvoQ servers launched!" -ForegroundColor Green
Write-Host "Frontend:    http://localhost:5173" -ForegroundColor Green
Write-Host "Backend API: http://127.0.0.1:8001" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
