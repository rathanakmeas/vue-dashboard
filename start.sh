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
echo "Seeding database with sample data..."
docker exec vue-dashboard-backend node seeder.js

echo ""
echo "===================================="
echo "✓ All services started successfully!"
echo "===================================="
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo ""
echo "Login credentials:"
echo "  Email:    admin@example.com"
echo "  Password: password123"
echo ""
echo "To stop all services, run: docker-compose down"
echo ""
