@echo off
echo ================================================
echo  Installing Ollama Locally (No Docker Required)
echo ================================================
echo.

echo Downloading Ollama installer...
echo.

echo Please:
echo 1. Download Ollama from: https://ollama.ai/download/windows
echo 2. Run the installer (OllamaSetup.exe)
echo 3. After installation, open a NEW terminal and run:
echo      ollama pull llama3
echo 4. Then start Ollama with:
echo      ollama serve
echo.
echo Or download directly:
powershell -Command "Start-Process 'https://ollama.ai/download/windows'"

echo.
echo After installing, run:
echo   ollama pull llama3
echo   ollama serve
echo.
echo Then you can start the chat server with:
echo   npm start
echo.
pause
