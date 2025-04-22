#!/bin/bash

# RadioX Production Rollback Script
# This script rolls back the RadioX application to a previous version

# Exit on error
set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d%H%M%S)
LOG_FILE="./logs/rollback-$TIMESTAMP.log"
ENV_FILE=".env.production"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

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

# Get the previous tag to roll back to
if [ -z "$1" ]; then
  log "ERROR: No rollback tag specified. Usage: $0 <tag>"
  log "Available tags:"
  docker images --format "{{.Repository}}:{{.Tag}}" | grep "${DOCKER_REGISTRY:-radiox}/radiox-"
  exit 1
fi

ROLLBACK_TAG=$1
log "Rolling back to tag: $ROLLBACK_TAG"

# Update the TAG in the environment file
sed -i.bak "s/TAG=.*/TAG=$ROLLBACK_TAG/" $ENV_FILE
log "Updated TAG in $ENV_FILE to $ROLLBACK_TAG"

# Stop the current containers
log "Stopping current containers"
docker-compose -f $DOCKER_COMPOSE_FILE down

# Start the containers with the previous tag
log "Starting containers with tag $ROLLBACK_TAG"
docker-compose -f $DOCKER_COMPOSE_FILE up -d

# Wait for services to be ready
log "Waiting for services to be ready"
sleep 30

# Check if services are healthy
log "Checking service health"
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${API_PORT:-5000}/health)
if [ "$BACKEND_HEALTH" != "200" ]; then
  log "ERROR: Backend service is not healthy after rollback. HTTP status: $BACKEND_HEALTH"
  log "Check the logs with: docker-compose -f $DOCKER_COMPOSE_FILE logs backend"
  exit 1
fi

FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${FRONTEND_PORT:-80}/health)
if [ "$FRONTEND_HEALTH" != "200" ]; then
  log "ERROR: Frontend service is not healthy after rollback. HTTP status: $FRONTEND_HEALTH"
  log "Check the logs with: docker-compose -f $DOCKER_COMPOSE_FILE logs frontend"
  exit 1
fi

# Restart monitoring and logging
log "Restarting monitoring and logging services"
docker-compose -f docker-compose.monitoring.yml restart
docker-compose -f docker-compose.logging.yml restart

log "Rollback to $ROLLBACK_TAG completed successfully"
log "RadioX is now running at: https://${FRONTEND_URL:-radiox.com}"
log "API is available at: https://${API_URL:-api.radiox.com}"

# Print container status
log "Container status:"
docker-compose -f $DOCKER_COMPOSE_FILE ps
