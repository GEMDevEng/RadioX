#!/bin/bash

# Database backup script for RadioX
# This script creates a backup of the MongoDB database and uploads it to S3

# Configuration
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="/opt/radiox/backups"
S3_BUCKET="radiox-backups"
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017"}
DATABASE_NAME=${DATABASE_NAME:-"radiox"}
RETENTION_DAYS=${RETENTION_DAYS:-7}

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Log file
LOG_FILE="$BACKUP_DIR/backup-$TIMESTAMP.log"

# Function to log messages
log() {
  echo "[$(date +%Y-%m-%d\ %H:%M:%S)] $1" | tee -a $LOG_FILE
}

# Start backup process
log "Starting database backup process"

# Create backup filename
BACKUP_FILENAME="$DATABASE_NAME-$TIMESTAMP.gz"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILENAME"

# Perform MongoDB backup
log "Creating MongoDB backup: $BACKUP_PATH"
mongodump --uri="$MONGODB_URI" --db="$DATABASE_NAME" --gzip --archive="$BACKUP_PATH" 2>> $LOG_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
  log "MongoDB backup completed successfully"
  
  # Upload to S3
  log "Uploading backup to S3: s3://$S3_BUCKET/mongodb/$BACKUP_FILENAME"
  aws s3 cp "$BACKUP_PATH" "s3://$S3_BUCKET/mongodb/$BACKUP_FILENAME" 2>> $LOG_FILE
  
  if [ $? -eq 0 ]; then
    log "Backup uploaded to S3 successfully"
  else
    log "ERROR: Failed to upload backup to S3"
    exit 1
  fi
  
  # Clean up local backup files older than retention period
  log "Cleaning up local backup files older than $RETENTION_DAYS days"
  find "$BACKUP_DIR" -name "*.gz" -type f -mtime +$RETENTION_DAYS -delete
  
  # Clean up S3 backup files older than retention period
  log "Cleaning up S3 backup files older than $RETENTION_DAYS days"
  aws s3 ls "s3://$S3_BUCKET/mongodb/" | grep -v "PRE" | awk '{print $4}' | while read -r file; do
    file_date=$(echo "$file" | grep -oP '\d{14}' | head -1)
    if [ ! -z "$file_date" ]; then
      file_timestamp=$(date -d "${file_date:0:4}-${file_date:4:2}-${file_date:6:2} ${file_date:8:2}:${file_date:10:2}:${file_date:12:2}" +%s)
      current_timestamp=$(date +%s)
      age_seconds=$((current_timestamp - file_timestamp))
      age_days=$((age_seconds / 86400))
      
      if [ $age_days -gt $RETENTION_DAYS ]; then
        log "Deleting old S3 backup: $file (${age_days} days old)"
        aws s3 rm "s3://$S3_BUCKET/mongodb/$file" 2>> $LOG_FILE
      fi
    fi
  done
  
  log "Backup process completed successfully"
else
  log "ERROR: MongoDB backup failed"
  exit 1
fi
