#!/bin/bash

echo "===================================="
echo "Starting HRIS Vue Dashboard"
echo "===================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

echo ""
echo "Stopping any existing containers..."
docker-compose down 2>/dev/null

echo ""
echo "Building and starting all services..."
docker-compose up -d --build

echo ""
echo "Waiting for services to be ready..."
sleep 10

echo ""
echo "Checking database status..."
GEO_COUNT=$(curl -s http://localhost:5001/api/geography/status 2>/dev/null | grep -o '"total_records":[0-9]*' | grep -o '[0-9]*')

if [ -z "$GEO_COUNT" ] || [ "$GEO_COUNT" -lt 14000 ]; then
    echo "Initializing database with sample data and geography..."
    docker exec vue-dashboard-backend npm run seed
else
    echo "Database already initialized ($GEO_COUNT geography records found)"
fi

echo ""
echo "===================================="
echo "✓ All services started successfully!"
echo "===================================="
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "⚙️  Backend:  http://localhost:5001"
echo "📍 Geography: $GEO_COUNT records (25 provinces)"
echo ""
echo "🔐 Login credentials:"
echo "  Email:    admin@example.com"
echo "  Password: password123"
echo ""
echo "📚 Features:"
echo "  • 728 Position titles"
echo "  • Cambodia geography selector (25 provinces)"
echo "  • Document management"
echo "  • Employee management"
echo ""
echo "To stop: docker-compose down"
echo "To view logs: docker-compose logs -f"
echo ""
