#!/bin/bash
# Deploy vector-sphere backend to EC2
# Usage: ./deploy.sh

set -e

HOST="claw"
REPO="https://github.com/jvsteiner/vector-market.git"
APP_DIR="/home/ubuntu/vector-market/backend"

echo "Deploying to $HOST..."

ssh $HOST << 'COMMANDS'
set -e

cd ~/vector-market/backend

echo "Pulling latest code..."
git pull origin main

echo "Rebuilding and restarting services..."
docker compose -f docker-compose.prod.yml up -d --build

echo "Waiting for services..."
sleep 5

echo "Health check..."
curl -s http://localhost:3001/health || echo "Warning: health check failed, services may still be starting"

echo "Done!"
docker compose -f docker-compose.prod.yml ps
COMMANDS
