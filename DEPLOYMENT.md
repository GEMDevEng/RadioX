# RadioX Deployment Guide

This guide provides instructions for deploying the RadioX application to production environments.

## Architecture Overview

RadioX consists of two main components:

1. **Frontend**: React application deployed on Vercel
2. **Backend**: Node.js/Express API deployed on Heroku

## Prerequisites

Before deploying, ensure you have:

- Vercel account (for frontend)
- Heroku account (for backend)
- MongoDB Atlas account (for database)
- AWS account (for S3 storage)
- Redis Cloud account (for caching and queues)

## Frontend Deployment (Vercel)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Configure Environment Variables

Create the following environment variables in the Vercel project settings:

- `REACT_APP_API_URL`: URL of your backend API (e.g., https://radiox-api.herokuapp.com/api)
- `REACT_APP_SOCKET_URL`: URL for WebSocket connections (e.g., https://radiox-api.herokuapp.com)
- `REACT_APP_ENV`: Set to "production"

### 4. Deploy to Vercel

Navigate to the frontend directory and run:

```bash
cd frontend
vercel
```

For production deployment:

```bash
vercel --prod
```

### 5. Configure Custom Domain (Optional)

In the Vercel dashboard:
1. Go to your project
2. Navigate to "Settings" > "Domains"
3. Add your custom domain and follow the instructions

## Backend Deployment (Heroku)

### 1. Install Heroku CLI

```bash
npm install -g heroku
```

### 2. Login to Heroku

```bash
heroku login
```

### 3. Create a Heroku App

```bash
heroku create radiox-api
```

### 4. Configure Environment Variables

Set the following environment variables in Heroku:

```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=4000
heroku config:set MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/radiox
heroku config:set JWT_SECRET=your_jwt_secret_here
heroku config:set JWT_EXPIRES_IN=30d
heroku config:set FRONTEND_URL=https://radiox.vercel.app
heroku config:set AWS_ACCESS_KEY_ID=your_aws_access_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_aws_secret_key
heroku config:set S3_BUCKET=radiox-audio-files
```

### 5. Add Redis Add-on

```bash
heroku addons:create heroku-redis:hobby-dev
```

### 6. Deploy to Heroku

From the project root:

```bash
git push heroku main
```

### 7. Scale Dynos (Optional)

```bash
heroku ps:scale web=1 worker=1
```

### 8. Configure Custom Domain (Optional)

```bash
heroku domains:add api.yourdomain.com
```

Follow Heroku's instructions to configure DNS settings.

## Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Whitelist IP addresses (0.0.0.0/0 for public access)
4. Get the connection string and update the `MONGODB_URI` environment variable

## Storage Setup (AWS S3)

1. Create an S3 bucket for audio files
2. Configure CORS for the bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://radiox.vercel.app"],
    "ExposeHeaders": []
  }
]
```

3. Create an IAM user with S3 access
4. Generate access keys and update environment variables

## Monitoring and Maintenance

### Logging

- Backend logs: `heroku logs --tail`
- Frontend logs: Vercel dashboard

### Monitoring

- Set up Prometheus and Grafana using the provided Kubernetes configurations
- Configure alerts for critical metrics

### Backup

- Set up automated MongoDB backups in Atlas
- Configure S3 bucket versioning

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure FRONTEND_URL is correctly set in backend environment variables
2. **Connection Issues**: Check MongoDB and Redis connection strings
3. **Authentication Failures**: Verify JWT_SECRET is consistent

### Support

For additional support, contact the RadioX development team.

## Security Considerations

- Regularly rotate access keys and secrets
- Enable MFA for all service accounts
- Regularly update dependencies using the provided scripts
- Run security scans on the codebase

## Scaling

As user traffic grows:

1. Upgrade Heroku dynos
2. Scale MongoDB Atlas cluster
3. Consider moving to Kubernetes using the provided configuration files
