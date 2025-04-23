#!/bin/bash

# Script to deploy the RadioX backend to Heroku
# This script should be run from the project root

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Heroku deployment process...${NC}"

# Check if we're in the project root
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
  exit 1
fi

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
  echo -e "${YELLOW}Heroku CLI not found. Installing...${NC}"
  
  # Check the operating system
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    brew tap heroku/brew && brew install heroku
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    curl https://cli-assets.heroku.com/install.sh | sh
  else
    # Windows or other
    echo -e "${RED}Please install Heroku CLI manually: https://devcenter.heroku.com/articles/heroku-cli${NC}"
    exit 1
  fi
fi

# Login to Heroku if not already logged in
echo -e "${YELLOW}Checking Heroku login status...${NC}"
if ! heroku whoami &> /dev/null; then
  echo -e "${YELLOW}Please login to Heroku:${NC}"
  heroku login
fi

# Ask for app name
read -p "Enter a name for your Heroku app (e.g., radiox-api): " app_name

# Check if app exists
if heroku apps:info --app $app_name &> /dev/null; then
  echo -e "${YELLOW}App '$app_name' already exists. Using existing app.${NC}"
else
  # Create a new Heroku app
  echo -e "${GREEN}Creating Heroku app '$app_name'...${NC}"
  heroku create $app_name
fi

# Set environment variables
echo -e "${GREEN}Setting environment variables...${NC}"

# JWT Secret
read -p "Enter a JWT secret (leave blank to generate one): " jwt_secret
if [ -z "$jwt_secret" ]; then
  jwt_secret=$(openssl rand -hex 32)
  echo -e "${YELLOW}Generated JWT secret: $jwt_secret${NC}"
fi
heroku config:set JWT_SECRET=$jwt_secret --app $app_name

# MongoDB URI
read -p "Enter your MongoDB URI: " mongodb_uri
if [ -z "$mongodb_uri" ]; then
  echo -e "${RED}MongoDB URI is required. Please create a MongoDB Atlas account if you don't have one.${NC}"
  exit 1
fi
heroku config:set MONGODB_URI=$mongodb_uri --app $app_name

# Frontend URL
read -p "Enter your frontend URL (e.g., https://radiox.vercel.app): " frontend_url
if [ -z "$frontend_url" ]; then
  echo -e "${RED}Frontend URL is required.${NC}"
  exit 1
fi
heroku config:set FRONTEND_URL=$frontend_url --app $app_name

# Other environment variables
heroku config:set NODE_ENV=production --app $app_name
heroku config:set PORT=4000 --app $app_name
heroku config:set JWT_EXPIRES_IN=30d --app $app_name

# Add Redis add-on
echo -e "${GREEN}Adding Redis add-on...${NC}"
heroku addons:create heroku-redis:hobby-dev --app $app_name

# Deploy to Heroku
echo -e "${GREEN}Deploying to Heroku...${NC}"
git push https://git.heroku.com/$app_name.git main

# Scale dynos
echo -e "${GREEN}Scaling dynos...${NC}"
heroku ps:scale web=1 --app $app_name

# Get the app URL
app_url=$(heroku info --app $app_name | grep "Web URL" | awk '{print $3}')

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${YELLOW}Your backend is now deployed at: $app_url${NC}"

echo -e "${GREEN}Next steps:${NC}"
echo -e "1. Update the environment variables in your Vercel project:"
echo -e "   - REACT_APP_API_URL: ${app_url}api"
echo -e "   - REACT_APP_SOCKET_URL: ${app_url}"
echo -e "2. Test your application by visiting your frontend URL"
