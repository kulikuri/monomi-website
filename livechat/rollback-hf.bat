@echo off
echo ================================================
echo  Rollback Hugging Face Deployment
echo ================================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo ERROR: Git repository not initialized!
    pause
    exit /b 1
)

echo WARNING: This will rollback to the previous deployment!
echo.
set /p CONFIRM="Are you sure? (yes/no): "

if /i not "%CONFIRM%"=="yes" (
    echo Rollback cancelled.
    pause
    exit /b 0
)

echo.
echo [1/3] Showing recent deployments...
git log --oneline -n 5
echo.

set /p COMMIT="Enter commit hash to rollback to (or press Enter for previous): "

if "%COMMIT%"=="" (
    echo [2/3] Reverting last commit...
    git revert HEAD --no-edit
) else (
    echo [2/3] Resetting to commit: %COMMIT%
    git reset --hard %COMMIT%
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [3/3] Pushing rollback to Hugging Face...
    git push hf main --force

    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ================================================
        echo  ROLLBACK SUCCESSFUL!
        echo ================================================
        echo.
        echo Previous version is deploying (1-2 minutes)
        echo Check your Hugging Face Space to verify
        echo.
    ) else (
        echo.
        echo ERROR: Failed to push rollback
        echo.
    )
) else (
    echo.
    echo ERROR: Rollback failed
    echo.
)

pause
