@echo off
echo ====================================
echo Stopping HRIS Vue Dashboard
echo ====================================
echo.

docker-compose down

echo.
echo ✓ All services stopped
echo.
pause
