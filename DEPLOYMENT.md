# Al Huda Maintenance System - Deployment Guide

## 🚀 MongoDB Atlas + Vercel Deployment

This guide will walk you through deploying the Al Huda Maintenance System using MongoDB Atlas (database) and Vercel (hosting).

---

## Prerequisites

- GitHub account
- MongoDB Atlas account (free tier)
- Vercel account (free tier)

---

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project (e.g., "Al Huda Maintenance")

### 1.2 Create a Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select a cloud provider and region (choose one closest to your users)
4. Click "Create Cluster" (takes 3-5 minutes)

### 1.3 Configure Database Access
1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set privileges to **"Read and write to any database"**
6. Click "Add User"

### 1.4 Configure Network Access
1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - For production, you should limit this to specific IPs
4. Click "Confirm"

### 1.5 Get Connection String
1. Go back to **"Database"** in the sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual database user password
6. Replace `username` if needed

---

## Step 2: Seed Your Database (Local Setup)

### 2.1 Clone Repository (if you haven't)
```bash
git clone https://github.com/Arsal-Temuri/Al-Huda-Maintenance-Website.git
cd Al-Huda-Maintenance-Website
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/?retryWrites=true&w=majority
   PORT=3000
   ```

### 2.4 Seed the Database
Run the seed script to populate your MongoDB with initial data:
```bash
npm run seed
```

You should see:
```
✅ Connected successfully!
✅ Admins seeded
✅ Workers seeded
✅ Requests seeded
🎉 Database seeded successfully!
```

### 2.5 Test Locally (Optional)
```bash
npm start
```
Visit `http://localhost:3000` to test the application.

---

## Step 3: Deploy to Vercel

### 3.1 Push to GitHub
Make sure all your code is pushed to GitHub (already done!):
```bash
git add .
git commit -m "MongoDB integration complete"
git push origin main
```

### 3.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with your GitHub account
3. Click **"Add New..."** → **"Project"**
4. Import your repository: `Al-Huda-Maintenance-Website`
5. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

### 3.3 Add Environment Variables on Vercel
**This is critical!**

1. Before deploying, click **"Environment Variables"**
2. Add the following variable:
   - **Name**: `MONGODB_URI`
   - **Value**: Your MongoDB connection string from Step 1.5
   - Select all environments (Production, Preview, Development)
3. Click "Add"

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment
3. You'll get a URL like: `https://your-project.vercel.app`

---

## Step 4: Test Your Deployment

### 4.1 Visit Your Site
Go to your Vercel URL: `https://your-project.vercel.app`

### 4.2 Test Public Request Form
- Fill out the maintenance request form
- Submit with/without photo

### 4.3 Test Admin Portal
Visit: `https://your-project.vercel.app/login.html`

**Default credentials:**
- **Female Admin**: 
  - Username: `female_admin`
  - Password: `admin123`
- **Male Admin**:
  - Username: `male_admin`
  - Password: `admin123`

---

## ⚠️ Important Limitations on Vercel

### File Uploads
- **Issue**: Uploaded files (photos) are stored temporarily and will be deleted when the serverless function spins down
- **Solution for stable deployment**:
  - Use cloud storage like Cloudinary, AWS S3, or Vercel Blob
  - For this prototype, photos may not persist long-term

### Session Storage
- Sessions work but may not persist across different serverless regions
- For production, use Redis or MongoDB session store

---

## 📝 Next Steps for Production

### 1. Secure Your Application
- Change default admin passwords in MongoDB
- Use strong session secrets (update in `server.js`)
- Implement HTTPS-only cookies
- Add rate limiting

### 2. Use Cloud Storage for Files
- Integrate Cloudinary for image uploads
- Or use Vercel Blob for file storage

### 3. Monitor Your Application
- Set up MongoDB Atlas alerts
- Use Vercel Analytics
- Monitor error logs

### 4. Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

---

## 🔧 Troubleshooting

### "Failed to connect to MongoDB"
- Check your connection string is correct
- Verify IP whitelist (0.0.0.0/0) is set in MongoDB Atlas
- Ensure database user has correct permissions

### "Unauthorized" errors
- Re-run the seed script: `npm run seed`
- Check that admins collection has data in MongoDB Atlas

### Deployment fails on Vercel
- Check build logs in Vercel dashboard
- Verify `MONGODB_URI` environment variable is set correctly
- Make sure `vercel.json` exists in your repository

### Photos not loading
- This is expected on Vercel (serverless limitation)
- Consider implementing Cloudinary integration for persistent photo storage

---

## 📚 Documentation

- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Vercel**: https://vercel.com/docs
- **Express.js**: https://expressjs.com/

---

## 🆘 Support

For issues or questions about this deployment:
1. Check MongoDB Atlas connection in the dashboard
2. Review Vercel deployment logs
3. Ensure environment variables are set correctly

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string obtained
- [ ] Local .env file configured
- [ ] Database seeded with `npm run seed`
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added on Vercel
- [ ] Application deployed successfully
- [ ] Public form tested
- [ ] Admin login tested

---

**Good luck with your deployment! 🎉**
