@echo off
echo ==========================================
echo    SECURITY FIX: Remove .env from GitHub
echo ==========================================

echo [1/3] Removing .env from Git tracking (keeping local file)...
git rm --cached .env

echo [2/3] Committing change...
git commit -m "Security: Remove sensitive .env file"

echo [3/3] Pushing to GitHub...
git push

echo.
echo [SUCCESS] .env removed from GitHub.
echo.
pause
