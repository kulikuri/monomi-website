@echo off
echo ================================================
echo  Download AI Model to D: Drive
echo ================================================
echo.

REM Set environment variable for this session
set OLLAMA_MODELS=D:\Ollama\models

echo Model storage: %OLLAMA_MODELS%
echo.

REM Check if directory exists
if not exist "D:\Ollama\models" (
    echo Creating directory: D:\Ollama\models
    mkdir "D:\Ollama\models"
)

echo.
echo Downloading llama3 model (~4GB)...
echo This will take 5-10 minutes depending on your internet speed.
echo.
echo Models will be saved to: D:\Ollama\models
echo.

ollama pull llama3

echo.
echo ================================================
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Model downloaded to D:\Ollama\models
    echo.
    echo Next steps:
    echo 1. Run: start-ollama-d-drive.bat
    echo 2. Open new terminal and run: npm start
    echo 3. Test at: http://localhost:3000/widget
) else (
    echo ERROR: Failed to download model
    echo.
    echo Troubleshooting:
    echo 1. Make sure Ollama is installed
    echo 2. Check your internet connection
    echo 3. Try running: ollama pull tinyllama
)
echo.
pause
