@echo off
title Fixmate - Fullstack Starter

echo Starting Backend...
start cmd /k "cd backend && .\venv\Scripts\activate && python app.py"

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo Opening Fixmate in Chrome...
start chrome http://localhost:5173/

echo Fixmate started successfully!
exit
