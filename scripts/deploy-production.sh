#!/bin/bash

# RadioX Production Deployment Script
# This script deploys the RadioX application to production

# Exit on error
set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d%H%M%S)
LOG_FILE="./logs/deploy-$TIMESTAMP.log"
ENV_FILE=".env.production"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"

# Create log directory if it doesn't exist
mkdir -p ./logs

# Function to log messages
log() {
  echo "[$(date +%Y-%m-%d\ %H:%M:%S)] $1" | tee -a $LOG_FILE
}

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
  log "ERROR: $ENV_FILE file not found. Please create it from .env.production.template"
  exit 1
fi

# Load environment variables
log "Loading environment variables from $ENV_FILE"
export $(grep -v '^#' $ENV_FILE | xargs)

# Check required environment variables
REQUIRED_VARS=(
  "DOCKER_REGISTRY"
  "TAG"
  "MONGO_USERNAME"
  "MONGO_PASSWORD"
  "JWT_SECRET"
  "COOKIE_SECRET"
  "AWS_ACCESS_KEY_ID"
  "AWS_SECRET_ACCESS_KEY"
)

for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    log "ERROR: Required environment variable $VAR is not set in $ENV_FILE"
    exit 1
  fi
done

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup the database before deployment
log "Creating database backup before deployment"
if [ -f "./scripts/backup-database.sh" ]; then
  ./scripts/backup-database.sh
else
  log "WARNING: Database backup script not found. Skipping backup."
fi

# Pull the latest images
log "Pulling the latest Docker images"
docker-compose -f $DOCKER_COMPOSE_FILE pull

# Check if containers are already running
if docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "Up"; then
  log "Stopping existing containers"
  docker-compose -f $DOCKER_COMPOSE_FILE down
fi

# Start the new containers
log "Starting new containers"
docker-compose -f $DOCKER_COMPOSE_FILE up -d

# Wait for services to be ready
log "Waiting for services to be ready"
sleep 30

# Check if services are healthy
log "Checking service health"
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${API_PORT:-5000}/health)
if [ "$BACKEND_HEALTH" != "200" ]; then
  log "ERROR: Backend service is not healthy. HTTP status: $BACKEND_HEALTH"
  log "Check the logs with: docker-compose -f $DOCKER_COMPOSE_FILE logs backend"
  exit 1
fi

FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${FRONTEND_PORT:-80}/health)
if [ "$FRONTEND_HEALTH" != "200" ]; then
  log "ERROR: Frontend service is not healthy. HTTP status: $FRONTEND_HEALTH"
  log "Check the logs with: docker-compose -f $DOCKER_COMPOSE_FILE logs frontend"
  exit 1
fi

# Start monitoring and logging
log "Starting monitoring and logging services"
docker-compose -f docker-compose.monitoring.yml up -d
docker-compose -f docker-compose.logging.yml up -d

# Clean up old images
log "Cleaning up old Docker images"
docker image prune -af --filter "until=24h"

log "Deployment completed successfully"
log "RadioX is now running at: https://${FRONTEND_URL:-radiox.com}"
log "API is available at: https://${API_URL:-api.radiox.com}"
log "Monitoring is available at: http://localhost:3001"

# Print container status
log "Container status:"
docker-compose -f $DOCKER_COMPOSE_FILE ps
