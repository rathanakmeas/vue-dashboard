#!/bin/bash

echo "===================================="
echo "Starting HRIS Vue Dashboard (Dev)"
echo "===================================="
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check if MongoDB is running
if ! pgrep -x mongod > /dev/null; then
    echo "Starting MongoDB..."
    brew services start mongodb-community
    sleep 3
fi

# Start backend server in background
echo "Starting backend server (Node 18)..."
cd backend
nvm use 18
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend server in background
echo "Starting frontend server (Node 25)..."
nvm use 25
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Save PIDs to file for stop script
mkdir -p .pids
echo $BACKEND_PID > .pids/backend.pid
echo $FRONTEND_PID > .pids/frontend.pid

echo ""
echo "===================================="
echo "✓ All services started successfully!"
echo "===================================="
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001"
echo "Network:  http://192.168.1.180:5173"
echo ""
echo "Login credentials:"
echo "  Email:    admin@example.com"
echo "  Password: password123"
echo ""
echo "To view logs:"
echo "  Backend:  tail -f logs/backend.log"
echo "  Frontend: tail -f logs/frontend.log"
echo ""
echo "To stop all services, run: ./stop-dev.sh"
echo ""
