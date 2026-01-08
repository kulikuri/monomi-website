@echo off
echo Starting Ollama in Docker...
docker-compose up -d ollama
echo.
echo Ollama is running on http://localhost:11434
echo.
echo To check status: docker logs digimax-ollama
echo To pull a model: docker exec digimax-ollama ollama pull llama3
echo.
