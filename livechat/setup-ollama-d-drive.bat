@echo off
echo ================================================
echo  Ollama D: Drive Setup
echo ================================================
echo.

REM Create model storage on D: drive
echo [1/5] Creating model storage directory on D: drive...
if not exist "D:\Ollama" mkdir "D:\Ollama"
if not exist "D:\Ollama\models" mkdir "D:\Ollama\models"
echo     Created: D:\Ollama\models

echo.
echo [2/5] Setting environment variable for model storage...
setx OLLAMA_MODELS "D:\Ollama\models"
echo     Set OLLAMA_MODELS=D:\Ollama\models

echo.
echo [3/5] Downloading Ollama installer...
echo     Opening download page...
powershell -Command "Start-Process 'https://ollama.ai/download/windows'"

echo.
echo ================================================
echo  NEXT STEPS:
echo ================================================
echo.
echo 1. Install Ollama (program will be ~50MB on C: drive)
echo 2. Models will be stored on D:\Ollama\models (4GB+)
echo 3. After installation, close this window
echo 4. Open NEW Command Prompt and run:
echo      ollama pull llama3
echo 5. Then run:
echo      start-ollama-d-drive.bat
echo.
echo NOTE: You MUST open a NEW terminal after installation
echo       for environment variables to take effect!
echo.
pause
