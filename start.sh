#!/bin/bash

# Smart Appointment System - Startup Guide

echo "🚀 Starting Smart Appointment System..."
echo ""

# Check if backend is running
echo "📡 Checking backend..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
  echo "✅ Backend already running on http://localhost:5000"
else
  echo "❌ Backend not running. Starting backend..."
  cd backend
  npm run dev &
  BACKEND_PID=$!
  echo "Backend PID: $BACKEND_PID"
  sleep 3
  cd ..
fi

# Check if frontend is running
echo ""
echo "🎨 Checking frontend..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo "✅ Frontend already running on http://localhost:5173"
else
  echo "❌ Frontend not running. Starting frontend..."
  cd frontend
  npm run dev &
  FRONTEND_PID=$!
  echo "Frontend PID: $FRONTEND_PID"
  sleep 3
  cd ..
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ SYSTEM READY!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🌐 Frontend:  http://localhost:5173"
echo "📡 Backend:   http://localhost:5000"
echo ""
echo "🔐 Demo Credentials:"
echo "   Patient: patient1@smartdoc.com / password123"
echo "   Doctor:  mantra@smartdoc.com / password123"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait
