@echo off
echo ================================================
echo  DigiMax AI Chat - Ollama Setup (Docker)
echo ================================================
echo.

echo [1/4] Starting Ollama container...
docker-compose up -d ollama

echo.
echo [2/4] Waiting for Ollama to be ready (30 seconds)...
timeout /t 30 /nobreak > nul

echo.
echo [3/4] Pulling llama3 model (this may take 5-10 minutes)...
echo This downloads ~4GB, please be patient...
docker exec digimax-ollama ollama pull llama3

echo.
echo [4/4] Verifying installation...
docker exec digimax-ollama ollama list

echo.
echo ================================================
echo  Setup Complete!
echo ================================================
echo.
echo Ollama is now running with llama3 model.
echo You can now start the live chat service with:
echo   docker-compose up -d
echo.
echo Or run locally with:
echo   npm start
echo.
pause
