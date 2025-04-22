# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Create volume for logs
VOLUME [ "/app/backend/logs" ]

# Expose port
EXPOSE 4000

# Start the app
CMD ["node", "backend/server.js"]
