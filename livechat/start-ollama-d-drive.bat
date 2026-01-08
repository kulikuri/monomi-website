@echo off
echo ================================================
echo  Starting Ollama (Models on D: Drive)
echo ================================================
echo.

REM Set environment variable for this session
set OLLAMA_MODELS=D:\Ollama\models

echo Model storage: %OLLAMA_MODELS%
echo.

REM Check if Ollama is installed
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Ollama is not installed!
    echo Please run: setup-ollama-d-drive.bat
    echo.
    pause
    exit /b 1
)

echo Starting Ollama server...
echo Models will be stored in: D:\Ollama\models
echo.
echo Press Ctrl+C to stop the server
echo.

ollama serve
