@echo off
echo ================================================
echo  Update Hugging Face Deployment
echo ================================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo ERROR: Git repository not initialized!
    echo Run deploy-to-hf.bat first.
    pause
    exit /b 1
)

REM Check if hf remote exists
git remote get-url hf >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Hugging Face remote not configured!
    echo Run deploy-to-hf.bat first.
    pause
    exit /b 1
)

REM Get commit message from argument or prompt
if "%~1"=="" (
    set /p COMMIT_MSG="Enter update description: "
) else (
    set COMMIT_MSG=%~1
)

if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Update deployment
)

echo.
echo [1/3] Staging changes...
git add .

echo.
echo [2/3] Creating commit: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [3/3] Pushing to Hugging Face...
    git push hf main

    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ================================================
        echo  SUCCESS! Update deployed
        echo ================================================
        echo.
        echo Changes are deploying (2-5 minutes)
        echo Check logs at your Hugging Face Space
        echo.
    ) else (
        echo.
        echo ERROR: Push failed! Check your credentials.
        echo.
    )
) else (
    echo.
    echo No changes to deploy (everything up to date)
    echo.
)

pause
