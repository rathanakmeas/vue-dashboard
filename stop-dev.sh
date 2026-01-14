#!/bin/bash

echo "===================================="
echo "Stopping HRIS Vue Dashboard (Dev)"
echo "===================================="
echo ""

# Stop processes using PIDs
if [ -f .pids/backend.pid ]; then
    BACKEND_PID=$(cat .pids/backend.pid)
    echo "Stopping backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    rm .pids/backend.pid
fi

if [ -f .pids/frontend.pid ]; then
    FRONTEND_PID=$(cat .pids/frontend.pid)
    echo "Stopping frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    rm .pids/frontend.pid
fi

# Fallback: kill by process name
echo "Stopping any remaining processes..."
pkill -f "vite" 2>/dev/null
pkill -f "nodemon" 2>/dev/null

# Clean up PID directory if empty
if [ -d .pids ] && [ -z "$(ls -A .pids)" ]; then
    rmdir .pids
fi

echo ""
echo "✓ All services stopped"
echo ""
