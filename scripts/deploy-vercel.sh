#!/bin/bash

# Script to deploy the RadioX frontend to Vercel

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Vercel deployment process...${NC}"

# Check if we're in the project root
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
  exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
  npm install -g vercel
fi

# Build the frontend
echo -e "${GREEN}Building frontend...${NC}"
cd frontend
npm install
npm run build

# Deploy to Vercel
echo -e "${GREEN}Deploying to Vercel...${NC}"
echo -e "${YELLOW}You may be prompted to log in if you haven't already.${NC}"

# Check if this is a production deployment
read -p "Is this a production deployment? (y/n): " is_production
if [[ $is_production == "y" || $is_production == "Y" ]]; then
  echo -e "${GREEN}Deploying to production...${NC}"
  vercel --prod
else
  echo -e "${GREEN}Deploying to preview environment...${NC}"
  vercel
fi

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${YELLOW}Don't forget to set up your environment variables in the Vercel dashboard:${NC}"
echo -e "  - REACT_APP_API_URL: URL of your backend API"
echo -e "  - REACT_APP_SOCKET_URL: URL for WebSocket connections"
echo -e "  - REACT_APP_ENV: Set to 'production'"

# Return to project root
cd ..

echo -e "${GREEN}Next steps:${NC}"
echo -e "1. Deploy the backend to Heroku (see DEPLOYMENT.md)"
echo -e "2. Configure MongoDB Atlas and AWS S3"
echo -e "3. Update environment variables in both Vercel and Heroku"
