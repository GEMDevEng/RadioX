#!/bin/bash

# Script to update dependencies for RadioX project
# This script checks for outdated dependencies and updates them

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting dependency update check...${NC}"

# Check if we're in the project root
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
  exit 1
fi

# Function to update dependencies
update_dependencies() {
  local dir=$1
  local type=$2
  
  echo -e "${GREEN}Checking ${type} dependencies in ${dir}...${NC}"
  
  # Change to the directory
  cd $dir
  
  # Check for outdated dependencies
  echo -e "${YELLOW}Checking for outdated dependencies...${NC}"
  npm outdated
  
  # Update dependencies
  echo -e "${YELLOW}Updating dependencies...${NC}"
  if [ "$type" == "production" ]; then
    npm update --save
  else
    npm update --save-dev
  fi
  
  # Return to the project root
  cd - > /dev/null
}

# Update backend dependencies
echo -e "${GREEN}Updating backend dependencies...${NC}"
update_dependencies "." "production"
update_dependencies "." "development"

# Update frontend dependencies
echo -e "${GREEN}Updating frontend dependencies...${NC}"
update_dependencies "frontend" "production"
update_dependencies "frontend" "development"

# Check for security vulnerabilities
echo -e "${GREEN}Checking for security vulnerabilities...${NC}"
npm audit
cd frontend && npm audit && cd - > /dev/null

echo -e "${GREEN}Dependency update check completed.${NC}"
echo -e "${YELLOW}Please review the changes and test the application before committing.${NC}"

# Create a new branch for the updates
current_date=$(date +"%Y%m%d")
branch_name="dependency-updates-${current_date}"

echo -e "${GREEN}Creating a new branch for the updates: ${branch_name}${NC}"
git checkout -b $branch_name

# Add changes to git
git add package.json package-lock.json frontend/package.json frontend/package-lock.json

echo -e "${GREEN}Changes have been staged. Please review them with 'git diff --cached' and commit if satisfied.${NC}"
echo -e "${YELLOW}Suggested commit message: 'chore: update dependencies ${current_date}'${NC}"
