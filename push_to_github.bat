@echo off
echo ==========================================
echo    Mood Real Estate - GitHub Uploader
echo ==========================================

REM Check if git is available
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git command not found!
    echo Please RESTART VS Code or your computer to refresh your installation.
    pause
    exit /b
)

echo [1/6] Initializing Git...
git init

echo [2/6] Adding files...
git add .

echo [3/6] Committing...
git commit -m "Initial commit of Mood Real Estate"

echo [4/6] Renaming branch to main...
git branch -M main

echo [5/6] Adding remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/MohamadThehonoredone/FresheStatev2.git

echo [6/6] Pushing to GitHub...
echo.
echo [IMPORTANT] You may be asked to sign in to GitHub in a browser window.
echo.
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push failed. 
    echo If the remote repository is not empty, you might need to force push.
    echo.
    set /p FORCE="Do you want to FORCE push? This will overwrite the remote repo (y/n): "
    if /i "%FORCE%"=="y" (
        git push -u origin main --force
    )
)

echo.
echo Done!
pause
