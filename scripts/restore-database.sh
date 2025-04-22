#!/bin/bash

# Database restore script for RadioX
# This script restores a MongoDB backup from S3

# Configuration
BACKUP_DIR="/opt/radiox/backups"
S3_BUCKET="radiox-backups"
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017"}
DATABASE_NAME=${DATABASE_NAME:-"radiox"}

# Log file
TIMESTAMP=$(date +%Y%m%d%H%M%S)
LOG_FILE="$BACKUP_DIR/restore-$TIMESTAMP.log"

# Function to log messages
log() {
  echo "[$(date +%Y-%m-%d\ %H:%M:%S)] $1" | tee -a $LOG_FILE
}

# Function to display usage
usage() {
  echo "Usage: $0 [OPTIONS]"
  echo "Options:"
  echo "  -f, --file FILENAME    Specify backup filename to restore"
  echo "  -l, --latest           Restore the latest backup"
  echo "  -h, --help             Display this help message"
  exit 1
}

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Parse command line arguments
LATEST=false
BACKUP_FILENAME=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--file)
      BACKUP_FILENAME="$2"
      shift 2
      ;;
    -l|--latest)
      LATEST=true
      shift
      ;;
    -h|--help)
      usage
      ;;
    *)
      echo "Unknown option: $1"
      usage
      ;;
  esac
done

# Start restore process
log "Starting database restore process"

# If latest flag is set, find the latest backup
if [ "$LATEST" = true ]; then
  log "Finding latest backup in S3"
  BACKUP_FILENAME=$(aws s3 ls "s3://$S3_BUCKET/mongodb/" | grep -v "PRE" | sort -r | head -1 | awk '{print $4}')
  
  if [ -z "$BACKUP_FILENAME" ]; then
    log "ERROR: No backups found in S3"
    exit 1
  fi
  
  log "Latest backup found: $BACKUP_FILENAME"
fi

# Check if backup filename is provided
if [ -z "$BACKUP_FILENAME" ]; then
  log "ERROR: No backup filename specified"
  usage
fi

# Download backup from S3 if it doesn't exist locally
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILENAME"
if [ ! -f "$BACKUP_PATH" ]; then
  log "Downloading backup from S3: s3://$S3_BUCKET/mongodb/$BACKUP_FILENAME"
  aws s3 cp "s3://$S3_BUCKET/mongodb/$BACKUP_FILENAME" "$BACKUP_PATH" 2>> $LOG_FILE
  
  if [ $? -ne 0 ]; then
    log "ERROR: Failed to download backup from S3"
    exit 1
  fi
fi

# Confirm restore
read -p "Are you sure you want to restore the database from $BACKUP_FILENAME? This will overwrite the current database. (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  log "Restore cancelled by user"
  exit 0
fi

# Perform MongoDB restore
log "Restoring MongoDB from backup: $BACKUP_PATH"
mongorestore --uri="$MONGODB_URI" --gzip --archive="$BACKUP_PATH" --nsFrom="$DATABASE_NAME.*" --nsTo="$DATABASE_NAME.*" --drop 2>> $LOG_FILE

# Check if restore was successful
if [ $? -eq 0 ]; then
  log "MongoDB restore completed successfully"
else
  log "ERROR: MongoDB restore failed"
  exit 1
fi

log "Restore process completed successfully"
