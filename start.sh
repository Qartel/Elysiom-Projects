#!/bin/bash

# SocialFlow Startup Script

echo "🚀 Starting SocialFlow..."

# Start MongoDB on port 27019
echo "📦 Starting MongoDB on port 27019..."
mongod --port 27019 --dbpath /data/socialflow --logpath /var/log/socialflow-mongo.log --fork 2>/dev/null || echo "MongoDB already running or using existing instance"

# Start Backend
echo "🔧 Starting Backend API on port 7002..."
cd backend
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
uvicorn main:app --reload --host 0.0.0.0 --port 7002 > /var/log/socialflow-backend.log 2>&1 &
echo "✅ Backend running on http://localhost:7002"

# Start Frontend
echo "🎨 Starting Frontend on port 7001..."
cd ../frontend
yarn install > /dev/null 2>&1
yarn start > /var/log/socialflow-frontend.log 2>&1 &
echo "✅ Frontend running on http://localhost:7001"

echo ""
echo "✨ SocialFlow is ready!"
echo "📱 Frontend: http://localhost:7001"
echo "🔌 Backend API: http://localhost:7002"
echo "📚 API Docs: http://localhost:7002/docs"
echo ""
echo "Press Ctrl+C to stop all services"