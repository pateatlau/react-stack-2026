#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")"

echo "🛑 Stopping all Vite servers..."
pkill -f "vite.*517" || true

echo "🔨 Rebuilding remote MFEs..."
npm run build:remotes

echo "🚀 Starting all servers..."
npm run dev:mf

echo "✅ Done! Open http://localhost:5173"
