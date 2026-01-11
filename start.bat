@echo off
echo ====================================
echo Starting HRIS Vue Dashboard
echo ====================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Waiting for Docker to start...
    timeout /t 15 /nobreak >nul
)

echo.
echo Stopping any existing containers...
docker-compose down 2>nulទីកន្លែងកំណើត (រាជធានី/ខេត្ត, ស្រុក/ខណ្ឌ, ឃុំ/សង្កាត់, ភូមិ)

echo.
echo Building and starting all services...
docker-compose up -d --build

echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo Seeding database with sample data...
docker exec vue-dashboard-backend node seeder.js

echo.
echo ====================================
echo ✓ All services started successfully!
echo ====================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo Login credentials:
echo   Email:    admin@example.com
echo   Password: password123
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:5173

echo.
echo To stop all services, run: docker-compose down
echo.
