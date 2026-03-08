# 🚀 Quick Start Guide

## Al Huda Maintenance System - Get Running in 5 Minutes!

### Prerequisites
- Node.js installed
- MongoDB Atlas account (free) - [Sign up here](https://www.mongodb.com/cloud/atlas)

---

## Step 1: Install Dependencies (First Time Only)
Open PowerShell or Command Prompt in this folder and run:
```powershell
npm install
```

## Step 2: Configure MongoDB
1. Create MongoDB Atlas cluster (see [DEPLOYMENT.md](DEPLOYMENT.md))
2. Get your connection string
3. Copy `.env.example` to `.env`
4. Update `MONGODB_URI` in `.env` with your connection string

## Step 3: Seed Database
```powershell
npm run seed
```

## Step 4: Start the Server
```powershell
npm start
```

## Step 5: Open in Browser
- **Request Form**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/login.html

---

## 🔑 Login Credentials

**Female Admin**
- Username: `female_admin`
- Password: `admin123`

**Male Admin**
- Username: `male_admin`
- Password: `admin123`

---

## 🎯 Test the Complete Workflow

### 1️⃣ Submit a Request (No Login Needed)
1. Go to http://localhost:3000
2. Fill the form:
   - Department: `Boys Hostel`
   - Type: `Plumbing`
   - Description: `Water leakage in bathroom`
   - Priority: `High`
3. Click **Submit Request**
4. Save the Request ID shown

### 2️⃣ Verify Request (Female Admin)
1. Go to http://localhost:3000/login.html
2. Login: `female_admin` / `admin123`
3. Find your request in the dashboard
4. Click **✓ Verify**

### 3️⃣ Assign Worker (Male Admin)
1. Logout and login as `male_admin` / `admin123`
2. Click **Assign Worker** on the verified request
3. Select **Ahmed (Plumber)**
4. Click **Assign Worker**
5. Copy the WhatsApp message shown

### 4️⃣ Complete Task (Male Admin)
1. Click **✓ Complete** button
2. Request marked as completed

### 5️⃣ View History
1. Click **View History** button
2. See all completed tasks with analytics

---

## 📱 System URLs

| Page | URL |
|------|-----|
| Request Form | http://localhost:3000 |
| Admin Login | http://localhost:3000/login.html |
| Dashboard | http://localhost:3000/dashboard.html |
| History | http://localhost:3000/history.html |

---

## ⚠️ Troubleshooting

**Server won't start?**
- Make sure Node.js is installed: `node --version`
- Try: `npm install` again

**Can't login?**
- Use exact credentials (case-sensitive)
- Clear browser cache
- Try incognito mode

**Port 3000 in use?**
- Change port in `server.js`: `const PORT = 3001;`
- Or kill the process using port 3000

---

## 🎬 That's It!

Your maintenance system is now running. Check README.md for detailed documentation.

**Need help?** Review the full README.md file for complete instructions.
