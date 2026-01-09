@echo off
echo 🚀 Vue Dashboard with Express, MongoDB - Docker
echo ================================================
echo.
echo Setting up environment...
echo.

REM Create backend .env if it doesn't exist
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo ✅ Created backend/.env from .env.example
)

echo.
echo 📦 Installing dependencies...
echo.

REM Install backend dependencies
echo Backend dependencies...
cd backend
call npm install
cd ..

REM Install frontend dependencies
echo Frontend dependencies...
call npm install

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Update backend/.env with your configuration
echo 2. Run: docker-compose up --build
echo.
echo Or for local development:
echo 1. Start MongoDB: docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:7.0
echo 2. Backend: cd backend ^&^& npm run dev
echo 3. Frontend: npm run dev
echo.
