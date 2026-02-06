#!/bin/bash
# Deploy vector-sphere backend to EC2
# Usage: ./deploy.sh

set -e

echo "Deploying vector-sphere backend..."

ssh claw << 'COMMANDS'
set -e

cd ~/vector-market/backend

echo "Pulling latest code..."
git pull origin main

echo "Rebuilding and restarting services..."
docker compose -f docker-compose.prod.yml up -d --build

echo "Waiting for services..."
sleep 5

echo "Health check..."
curl -s http://vectorsphere-api:3001/health 2>/dev/null || curl -s https://vector.jamiesteiner.com/health || echo "Warning: health check failed, services may still be starting"

echo "Done!"
docker compose -f docker-compose.prod.yml ps
COMMANDS
