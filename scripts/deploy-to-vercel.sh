#!/bin/bash

# Script to deploy the RadioX frontend to Vercel
# This script should be run from the project root

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

# Navigate to frontend directory
cd frontend

# Login to Vercel if not already logged in
echo -e "${YELLOW}Checking Vercel login status...${NC}"
if ! vercel whoami &> /dev/null; then
  echo -e "${YELLOW}Please login to Vercel:${NC}"
  vercel login
fi

# Deploy to Vercel
echo -e "${GREEN}Deploying to Vercel...${NC}"

# Ask if this is a production deployment
read -p "Is this a production deployment? (y/n): " is_production
if [[ $is_production == "y" || $is_production == "Y" ]]; then
  echo -e "${GREEN}Deploying to production...${NC}"
  vercel --prod
else
  echo -e "${GREEN}Deploying to preview environment...${NC}"
  vercel
fi

# Get the deployment URL
DEPLOYMENT_URL=$(vercel --no-color | grep -o 'https://.*\.vercel\.app' | head -n 1)

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${YELLOW}Your frontend is now deployed at: ${DEPLOYMENT_URL}${NC}"

# Return to project root
cd ..

echo -e "${GREEN}Next steps:${NC}"
echo -e "1. Deploy the backend to Heroku (use scripts/deploy-to-heroku.sh)"
echo -e "2. Update the environment variables in Vercel:"
echo -e "   - REACT_APP_API_URL: https://your-heroku-app.herokuapp.com/api"
echo -e "   - REACT_APP_SOCKET_URL: https://your-heroku-app.herokuapp.com"
echo -e "   - REACT_APP_ENV: production"
