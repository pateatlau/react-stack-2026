#!/bin/bash
cd "$(dirname "$0")"

echo "🛑 Stopping all Vite servers..."
pkill -f "vite.*517" 2>/dev/null || true
sleep 2

echo "🔨 Building remote MFEs..."
npm run build:remotes

echo "🚀 Starting all servers..."
echo "   - Auth MFE: http://localhost:5174"
echo "   - Todos MFE: http://localhost:5175"
echo "   - Chatbot MFE: http://localhost:5176"
echo "   - Shell: http://localhost:5173"
echo ""

npx concurrently \
  "npm run preview --workspace=apps/auth-mfe" \
  "npm run preview --workspace=apps/todos-mfe" \
  "npm run preview --workspace=apps/chatbot-mfe" \
  "npm run dev --workspace=apps/shell"
