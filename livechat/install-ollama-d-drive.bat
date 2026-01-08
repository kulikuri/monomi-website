@echo off
echo ================================================
echo  Installing Ollama on D: Drive
echo ================================================
echo.

echo This will:
echo 1. Download Ollama installer
echo 2. Install to: D:\Ollama
echo 3. Store models in: D:\Ollama\models
echo.

REM Create directories
echo Creating directories on D: drive...
if not exist "D:\Ollama" mkdir "D:\Ollama"
if not exist "D:\Ollama\models" mkdir "D:\Ollama\models"

echo.
echo ================================================
echo  IMPORTANT: Manual Steps Required
echo ================================================
echo.
echo 1. Download Ollama from: https://ollama.ai/download/windows
echo 2. When installer opens, click "Options" or "Browse"
echo 3. Change install location to: D:\Ollama
echo.
echo Opening download page...
powershell -Command "Start-Process 'https://ollama.ai/download/windows'"

echo.
echo After installation, run:
echo   setup-ollama-d-drive.bat
echo.
pause
