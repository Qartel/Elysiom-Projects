#!/bin/bash

# SocialFlow Stop Script

echo "🛑 Stopping SocialFlow..."

# Stop Frontend
echo "Stopping Frontend (port 7001)..."
kill $(lsof -t -i:7001) 2>/dev/null || echo "Frontend not running"

# Stop Backend
echo "Stopping Backend (port 7002)..."
kill $(lsof -t -i:7002) 2>/dev/null || echo "Backend not running"

# Stop MongoDB (optional - comment out if using shared MongoDB)
# echo "Stopping MongoDB..."
# kill $(lsof -t -i:27019) 2>/dev/null || echo "MongoDB not running"

echo "✅ SocialFlow stopped"