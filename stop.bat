@echo off
echo ====================================
echo Stopping HRIS Vue Dashboard
echo ====================================
echo.

echo Stopping Docker containers...
docker-compose down

echo.
echo ====================================
echo All services stopped successfully!
echo ====================================
echo.
echo Containers removed:
echo   - vue-dashboard-frontend
echo   - vue-dashboard-backend
echo   - vue-dashboard-mongodb
echo.
echo To start again: start.bat
echo.
pause
