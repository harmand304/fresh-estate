@echo off
echo ==========================================
echo    FORCE PUSH to GitHub
echo ==========================================

echo [INFO] This will OVERWRITE the remote repository.
echo.

git push -u origin main --force

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Force push failed.
    echo 1. Check your internet connection.
    echo 2. Check if you are signed in to GitHub (a browser might have opened).
    echo.
) else (
    echo.
    echo [SUCCESS] Code uploaded successfully!
)

pause
