# Quick Deployment Guide for RadioX

This guide provides step-by-step instructions for deploying RadioX using the provided deployment scripts.

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

## Step 2: Deploy the Frontend to Vercel

We've provided a script to simplify the Vercel deployment process:

```bash
# Make the script executable (if not already)
chmod +x scripts/deploy-to-vercel.sh

# Run the deployment script
./scripts/deploy-to-vercel.sh
```

The script will:
1. Check if Vercel CLI is installed and install it if needed
2. Log you into Vercel if you're not already logged in
3. Deploy the frontend to Vercel
4. Provide you with the deployment URL

**Note:** Remember the deployment URL, as you'll need it when deploying the backend.

## Step 3: Set Up MongoDB Atlas

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

## Step 4: Deploy the Backend to Heroku

We've provided a script to simplify the Heroku deployment process:

```bash
# Make the script executable (if not already)
chmod +x scripts/deploy-to-heroku.sh

# Run the deployment script
./scripts/deploy-to-heroku.sh
```

The script will:
1. Check if Heroku CLI is installed and install it if needed
2. Log you into Heroku if you're not already logged in
3. Create a new Heroku app
4. Set up the necessary environment variables
5. Add the Redis add-on
6. Deploy the backend to Heroku
7. Provide you with the backend URL

During the script execution, you'll be asked to provide:
- A name for your Heroku app
- A JWT secret (or one will be generated for you)
- Your MongoDB URI (from Step 3)
- Your frontend URL (from Step 2)

## Step 5: Connect Frontend to Backend

After deploying both the frontend and backend, you need to update the environment variables in your Vercel project:

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

## Step 6: Test Your Deployment

1. **Visit your frontend URL** to ensure the frontend is working
2. **Test authentication** by registering a new user
3. **Test API endpoints** to ensure the backend is connected properly

## Troubleshooting

### CORS Issues
If you're experiencing CORS errors:
- Ensure the `FRONTEND_URL` in your backend environment variables exactly matches your Vercel URL
- Check that your backend CORS configuration is correct

### Database Connection Issues
If you can't connect to MongoDB:
- Verify your MongoDB Atlas connection string
- Check that your database user has the correct permissions
- Ensure your IP whitelist includes your Heroku app

### Deployment Failures
If your deployment fails:
- Check the build logs for specific errors
- Ensure all dependencies are correctly listed in package.json
- Verify that all environment variables are set correctly

## Next Steps

After successful deployment, consider:

1. **Setting up a custom domain**
2. **Configuring monitoring and analytics**
3. **Setting up CI/CD for automated deployments**

For more detailed information, refer to the full [DEPLOYMENT.md](DEPLOYMENT.md) guide.
