@echo off
setlocal

REM Start Django backend
start "PillPall Backend" cmd /k "backend\django\.venv\Scripts\python backend\django\manage.py runserver 0.0.0.0:8790"

REM Start Frontend
start "PillPall Frontend" cmd /k "npm run dev"

echo Started backend (http://localhost:8790) and frontend (http://localhost:8080 or next port).
endlocal
