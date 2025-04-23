# One-Click Deployment Guide for RadioX

This guide provides instructions for deploying RadioX using our one-click deployment script.

## Prerequisites

Before you begin, make sure you have:

1. **Git** installed and configured
2. **Node.js** (v16 or later) installed
3. A **Vercel** account for frontend deployment
4. A **Heroku** account for backend deployment
5. A **MongoDB Atlas** account for the database

## Step 1: Clone the Repository

If you haven't already, clone the repository to your local machine:

```bash
git clone https://github.com/GEMDevEng/RadioX.git
cd RadioX
```

## Step 2: Set Up MongoDB Atlas

Before running the deployment script, you'll need a MongoDB connection string:

1. **Create a MongoDB Atlas account** if you don't have one: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a new cluster**:
   - Select the free tier
   - Choose a cloud provider and region
   - Click "Create Cluster"

3. **Set up database access**:
   - Go to "Database Access" and create a new user
   - Give the user read/write permissions
   - Remember the username and password

4. **Set up network access**:
   - Go to "Network Access"
   - Add `0.0.0.0/0` to allow access from anywhere (for development)

5. **Get your connection string**:
   - Go to "Clusters"
   - Click "Connect"
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password

## Step 3: Run the One-Click Deployment Script

We've provided a script to automate the entire deployment process:

```bash
# Make the script executable (if not already)
chmod +x scripts/deploy.sh

# Run the deployment script
./scripts/deploy.sh
```

The script will:

1. Install all dependencies
2. Build the frontend
3. Deploy the frontend to Vercel
4. Create a new Heroku app
5. Set up the necessary environment variables
6. Add the Redis add-on
7. Deploy the backend to Heroku
8. Provide you with the deployment URLs

During the script execution, you'll be asked to provide:
- Your Vercel account credentials (if not already logged in)
- Your Heroku account credentials (if not already logged in)
- A name for your Heroku app
- Your MongoDB URI (from Step 2)
- Your Vercel frontend URL (after it's deployed)

## Step 4: Update Frontend Environment Variables

After the deployment is complete, you need to update the environment variables in your Vercel project:

1. **Go to the Vercel Dashboard**:
   - Select your RadioX project
   - Go to "Settings" > "Environment Variables"

2. **Add the following environment variables**:
   - `REACT_APP_API_URL`: `https://your-heroku-app.herokuapp.com/api`
   - `REACT_APP_SOCKET_URL`: `https://your-heroku-app.herokuapp.com`
   - `REACT_APP_ENV`: `production`

3. **Redeploy the frontend**:
   - Go to the "Deployments" tab
   - Find your latest deployment
   - Click the three dots menu and select "Redeploy"

## Step 5: Test Your Deployment

1. **Visit your frontend URL** to ensure the frontend is working
2. **Test authentication** by registering a new user
3. **Test API endpoints** to ensure the backend is connected properly

## Troubleshooting

If you encounter any issues during deployment, refer to the [DEPLOYMENT.md](DEPLOYMENT.md) guide for more detailed troubleshooting information.

## Next Steps

After successful deployment, consider:

1. **Setting up a custom domain**
2. **Configuring monitoring and analytics**
3. **Setting up CI/CD for automated deployments**

For more detailed information, refer to the full [DEPLOYMENT.md](DEPLOYMENT.md) guide.
