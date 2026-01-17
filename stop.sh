#!/bin/bash

echo "===================================="
echo "🛑 Stopping HRIS Vue Dashboard"
echo "===================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker is not running"
    echo ""
    exit 1
fi

echo "📋 Current running containers:"
docker-compose ps
echo ""

echo "🛑 Stopping all containers..."
docker-compose down

echo ""
echo "===================================="
echo "✅ All services stopped successfully!"
echo "===================================="
echo ""
echo "Stopped containers:"
echo "  • vue-dashboard-frontend"
echo "  • vue-dashboard-backend"
echo "  • vue-dashboard-mongodb"
echo ""
echo "💡 Tips:"
echo "  • To remove all data: docker-compose down -v"
echo "  • To start again: ./start.sh"
echo "  • To view logs: docker-compose logs"
echo ""
