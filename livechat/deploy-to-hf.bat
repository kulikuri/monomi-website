@echo off
echo ================================================
echo  Deploy to Hugging Face Spaces
echo ================================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo [1/5] Initializing Git repository...
    git init
    echo.
) else (
    echo [1/5] Git repository already initialized
    echo.
)

REM Get Hugging Face username
set /p HF_USERNAME="Enter your Hugging Face username: "
if "%HF_USERNAME%"=="" (
    echo ERROR: Username is required!
    pause
    exit /b 1
)

REM Get Space name
set /p HF_SPACE="Enter Space name (default: digimax-livechat): "
if "%HF_SPACE%"=="" set HF_SPACE=digimax-livechat

echo.
echo [2/5] Setting up Hugging Face remote...
set HF_REPO=https://huggingface.co/spaces/%HF_USERNAME%/%HF_SPACE%

REM Remove existing remote if it exists
git remote remove hf 2>nul

REM Add Hugging Face remote
git remote add hf %HF_REPO%
echo     Remote added: %HF_REPO%

echo.
echo [3/5] Staging all files...
git add .

echo.
echo [4/5] Creating commit...
git commit -m "Initial deployment to Hugging Face"

echo.
echo [5/5] Pushing to Hugging Face...
echo.
echo You may be prompted for your Hugging Face credentials:
echo   Username: %HF_USERNAME%
echo   Password: Your HF Access Token (starts with hf_...)
echo.
echo Get token from: https://huggingface.co/settings/tokens
echo.

git push hf main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo  SUCCESS! Deployed to Hugging Face
    echo ================================================
    echo.
    echo Your Space is deploying at:
    echo   https://huggingface.co/spaces/%HF_USERNAME%/%HF_SPACE%
    echo.
    echo Live URL will be:
    echo   https://%HF_USERNAME%-%HF_SPACE%.hf.space
    echo.
    echo Deployment takes 2-5 minutes. Check build logs at:
    echo   https://huggingface.co/spaces/%HF_USERNAME%/%HF_SPACE%/logs
    echo.
) else (
    echo.
    echo ================================================
    echo  DEPLOYMENT FAILED
    echo ================================================
    echo.
    echo Common issues:
    echo 1. Invalid credentials
    echo 2. Space doesn't exist yet - create it at https://huggingface.co/new-space
    echo 3. Wrong access token permissions
    echo.
    echo To fix:
    echo 1. Create Space at: https://huggingface.co/new-space
    echo    - Name: %HF_SPACE%
    echo    - SDK: Docker
    echo 2. Get write token: https://huggingface.co/settings/tokens
    echo 3. Run this script again
    echo.
)

pause
