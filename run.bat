@echo off
setlocal

REM Start Django backend
start "PillPall Backend" cmd /k "backend\django\.venv\Scripts\python backend\django\manage.py runserver 0.0.0.0:8000"

REM Start Frontend
start "PillPall Frontend" cmd /k "cd frontend && npm run dev"

echo Started backend (http://localhost:8000) and frontend (http://localhost:8080 or next port).
endlocal
