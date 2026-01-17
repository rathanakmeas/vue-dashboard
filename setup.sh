#!/bin/bash

echo "🚀 Vue Dashboard with Express, MongoDB & Docker"
echo "=================================================="
echo ""
echo "Setting up environment..."

# Create backend .env if it doesn't exist
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from .env.example"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "Backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Frontend dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your configuration"
echo "2. Run: docker-compose up --build"
echo ""
echo "Or for local development:"
echo "1. Start MongoDB: docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:7.0"
echo "2. Backend: cd backend && npm run dev"
echo "3. Frontend: npm run dev"
echo ""
