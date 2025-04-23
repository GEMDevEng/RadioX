# Deploying RadioX Frontend to Vercel

This guide provides step-by-step instructions for deploying the RadioX frontend to Vercel.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/cli) (optional, but recommended)

## Option 1: Deploy with Vercel CLI (Recommended)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Navigate to the Frontend Directory

```bash
cd frontend
```

### 4. Deploy to Vercel

For a preview deployment:

```bash
vercel
```

For a production deployment:

```bash
vercel --prod
```

Follow the prompts to configure your project. When asked about the build settings, use the following:

- Build Command: `npm run build`
- Output Directory: `build`
- Development Command: `npm start`

## Option 2: Deploy with Vercel Dashboard

### 1. Push Your Code to GitHub

Ensure your project is pushed to a GitHub repository.

### 2. Import Project in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

### 3. Configure Environment Variables

In the project settings, add the following environment variables:

- `REACT_APP_API_URL`: URL of your backend API (e.g., https://radiox-api.herokuapp.com/api)
- `REACT_APP_SOCKET_URL`: URL for WebSocket connections (e.g., https://radiox-api.herokuapp.com)
- `REACT_APP_ENV`: Set to "production"

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Option 3: Use the Deployment Script

We've provided a deployment script to simplify the process:

```bash
# Make the script executable
chmod +x scripts/deploy-vercel.sh

# Run the script
./scripts/deploy-vercel.sh
```

Follow the prompts to complete the deployment.

## Post-Deployment Steps

### 1. Configure Custom Domain (Optional)

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Domains"
3. Add your custom domain and follow the instructions

### 2. Set Up Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository. Every push to the main branch will trigger a new deployment.

To change this behavior:
1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Git"
3. Configure the production branch and other Git settings

### 3. Monitor Your Deployment

1. Go to your project in the Vercel dashboard
2. Navigate to "Analytics" to view performance metrics
3. Check "Logs" for any deployment or runtime issues

## Troubleshooting

### Build Failures

If your build fails, check the following:

1. Ensure all dependencies are correctly listed in `package.json`
2. Check for any environment variables that might be missing
3. Review the build logs for specific errors

### Runtime Errors

If your application has runtime errors:

1. Check browser console for JavaScript errors
2. Verify that environment variables are correctly set
3. Ensure the backend API is accessible from the frontend

### CORS Issues

If you're experiencing CORS issues:

1. Ensure the backend has the correct CORS configuration
2. Verify that `REACT_APP_API_URL` points to the correct backend URL
3. Check that the backend's `FRONTEND_URL` environment variable matches your Vercel deployment URL

## Need Help?

If you encounter any issues with your Vercel deployment, refer to:

- [Vercel Documentation](https://vercel.com/docs)
- [Create React App Deployment Guide](https://create-react-app.dev/docs/deployment/)
- The RadioX development team
