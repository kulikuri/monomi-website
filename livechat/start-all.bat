@echo off
echo ================================================
echo  Starting DigiMax AI Chat (D: Drive Setup)
echo ================================================
echo.

REM Set environment variable
set OLLAMA_MODELS=D:\Ollama\models

echo [1/2] Starting Ollama server (D:\Ollama\models)...
start "Ollama Server" cmd /k "set OLLAMA_MODELS=D:\Ollama\models && ollama serve"

echo Waiting for Ollama to start...
timeout /t 5 /nobreak > nul

echo.
echo [2/2] Starting Live Chat server...
start "Live Chat Server" cmd /k "cd /d D:\porto\livechat && npm start"

echo.
echo ================================================
echo  Both servers starting in separate windows!
echo ================================================
echo.
echo Ollama: http://localhost:11434
echo Chat: http://localhost:3000/widget
echo Admin: http://localhost:3000/admin
echo.
echo Close this window. The servers are running in other windows.
echo.
timeout /t 5
