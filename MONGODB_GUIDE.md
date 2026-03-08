# MongoDB Atlas Monitoring Guide

## 🔍 How to View Your Data

### Method 1: Data Explorer (Recommended)

1. **Go to MongoDB Atlas Dashboard**
   - Visit: https://cloud.mongodb.com

2. **Click "Browse Collections"**
   - You'll see your database: `alhuda-maintenance`
   
3. **Explore Collections**
   ```
   alhuda-maintenance/
   ├── admins (2 documents)
   ├── workers (4 documents)
   └── requests (changing as you use the app)
   ```

4. **View Individual Documents**
   - Click on a collection (e.g., "requests")
   - See all documents in a nice table format
   - Click any document to see full details

---

## 📊 Real-Time Database Activity Test

### Test 1: Submit a Request & Watch It Appear

**In Your App:**
1. Go to http://localhost:3000
2. Submit a maintenance request
3. Note the Request ID (e.g., REQ-2603-9876)

**In MongoDB Atlas:**
1. Go to Data Explorer → `alhuda-maintenance` → `requests`
2. Click the **refresh icon** (circular arrow)
3. **You'll see your new request appear!**
4. Click on it to see all the fields

**What You'll See:**
```json
{
  "_id": ObjectId("..."),
  "id": "REQ-2603-9876",
  "department": "Your Department",
  "requestType": "Your Type",
  "description": "Your description",
  "priority": "Not Set",
  "status": "Pending",
  "submittedAt": "2026-03-08T... (current time)",
  "photo": null,
  "assignedWorker": null
}
```

### Test 2: Verify Request & See Update

**In Your App:**
1. Login as female_admin
2. Click "Verify" on the request
3. Set priority to "High"

**In MongoDB Atlas:**
1. Refresh the `requests` collection
2. Click on your request
3. **You'll see:**
   - `status`: Changed to "Verified"
   - `priority`: Changed to "High"
   - `verifiedAt`: New timestamp added
   - `verifiedBy`: "Female Admin"

### Test 3: Assign Worker & Watch Changes

**In Your App:**
1. Login as male_admin
2. Assign a worker (e.g., Ahmed - Plumber)

**In MongoDB Atlas:**
1. Refresh the collection
2. **You'll see:**
   - `status`: "Assigned"
   - `assignedWorker`: Full worker object added
   - `assignedAt`: Timestamp
   - `assignedBy`: "Male Admin"

---

## 📈 Monitoring Tools in MongoDB Atlas

### 1. **Metrics** (Performance Monitoring)

**Location:** Cluster → Metrics tab

**What You See:**
- **Operations**: 
  - Queries per second
  - Inserts per second
  - Updates per second
- **Connections**: How many apps connected
- **Network**: Data transfer in/out
- **Storage**: Database size growth

**When to Check:**
- After deploying to Vercel
- If app feels slow
- To understand usage patterns

### 2. **Performance Advisor**

**Location:** Left sidebar → Performance Advisor

**What It Does:**
- Suggests indexes to speed up queries
- Identifies slow queries
- Recommends optimizations

### 3. **Real-Time Performance Panel**

**Location:** Cluster → Real-Time tab

**What You See:**
- Live query execution
- Current connections
- Active operations
- Slow queries (if any)

### 4. **Charts & Visualizations**

**Location:** Left sidebar → Charts

**What You Can Create:**
- Graphs of requests over time
- Priority distribution (High/Medium/Low)
- Department-wise statistics
- Worker assignment patterns
- Status breakdown (Pending/Verified/Assigned/Completed)

**Example Chart Ideas:**
```
1. Line Chart: Requests submitted per day
2. Pie Chart: Request status distribution
3. Bar Chart: Requests by department
4. Time Series: Peak submission hours
```

---

## 💾 Where is Your Data Stored?

### Physical Storage

**Your Current Setup:**
- **Region**: AWS Mumbai (ap-south-1)
- **Cluster Type**: M0 (Free tier)
- **Replicas**: 3 nodes (automatic backup)
- **Storage**: Cloud-based, distributed across AWS servers

**What This Means:**
- Your data is in AWS data centers in Mumbai
- Automatically replicated 3 times (high availability)
- If one server fails, others keep working
- MongoDB handles all backup automatically

### Data Structure

```
MongoDB Atlas Cloud (Mumbai)
│
└── Your Organization: "Arsal's Org"
    └── Project: "Project 0"
        └── Cluster: "Cluster0"
            └── Database: "alhuda-maintenance"
                ├── Collection: admins
                │   ├── Document 1 (female_admin)
                │   └── Document 2 (male_admin)
                ├── Collection: workers
                │   ├── Document 1 (Ahmed)
                │   ├── Document 2 (Ali)
                │   ├── Document 3 (Bilal)
                │   └── Document 4 (Hassan)
                └── Collection: requests
                    ├── Document 1 (REQ-2603-3157)
                    ├── Document 2 (REQ-2603-4298)
                    └── ... (grows as you add requests)
```

---

## 🚀 How It Works When Deployed on Vercel

### Architecture Overview

```
User's Browser
    ↓
Vercel Server (USA/Europe/wherever)
    ↓
[Your Node.js App runs as serverless function]
    ↓
MongoDB Atlas (Mumbai, India)
    ↓
[Data stored and retrieved]
```

### What Happens:

1. **User Submits Request**
   ```
   Browser → Vercel → Node.js Function → MongoDB
   ```
   - Request goes to Vercel URL (e.g., your-app.vercel.app)
   - Vercel runs your server.js as a function
   - Function connects to MongoDB using MONGODB_URI
   - Data saved to MongoDB Atlas in Mumbai

2. **Admin Views Dashboard**
   ```
   Browser → Vercel → Node.js → MongoDB (read requests)
   ```
   - Vercel function connects to MongoDB
   - Fetches all requests from `requests` collection
   - Returns JSON to browser
   - Dashboard displays data

3. **Data Flow:**
   - **All data lives in MongoDB** (not on Vercel)
   - Vercel only runs code (temporary)
   - MongoDB stores everything permanently
   - Each request creates a new connection

### Key Differences from Local:

| Aspect | Local (localhost:3000) | Deployed (Vercel) |
|--------|----------------------|-------------------|
| **Server** | Your computer | Vercel's cloud |
| **Database** | MongoDB Atlas | Same MongoDB Atlas |
| **URL** | localhost:3000 | your-app.vercel.app |
| **Data Storage** | MongoDB (India) | Same MongoDB (India) |
| **Sessions** | In-memory | In-memory (may reset) |
| **File Uploads** | Local disk | Temporary (gets deleted) |

---

## 🔔 Setting Up Alerts

### Get Notified When Things Happen

**Location:** Project → Integrations → Alerts

**Useful Alerts:**
1. **Connection Spike**: Too many connections
2. **High CPU**: Database overloaded
3. **Storage Limit**: Running out of space
4. **Query Performance**: Slow queries detected

**How to Set Up:**
1. Click "Alerts" in left sidebar
2. Click "New Alert"
3. Choose alert type
4. Enter your email
5. Set threshold (e.g., notify if CPU > 80%)

---

## 📱 Mobile App (Optional)

**MongoDB Atlas Mobile App:**
- iOS & Android available
- Monitor database on-the-go
- View metrics and alerts
- Check cluster health

---

## 🛠️ Useful MongoDB Atlas Features

### 1. **Search Indexes** (Advanced Search)
Create powerful search across all requests:
```javascript
// Search for "plumbing" across all fields
db.requests.find({ $text: { $search: "plumbing" } })
```

### 2. **Triggers** (Automation)
Run code when data changes:
- Send email when new request submitted
- Update statistics automatically
- Sync data to other services

### 3. **Data API** (REST API)
Access database directly via HTTP:
```
https://data.mongodb-api.com/app/your-app/endpoint/requests
```

### 4. **Backup/Restore**
- Automatic daily backups (on paid tiers)
- Point-in-time recovery
- Download backup snapshots

---

## 🎯 Quick Reference: Where to Find What

| What You Want | Where to Go |
|--------------|-------------|
| View actual data | Browse Collections |
| See live queries | Real-Time Performance |
| Check app performance | Metrics tab |
| Find slow queries | Performance Advisor |
| Get alerts | Integrations → Alerts |
| Create visualizations | Charts |
| Download data | Collections → Export |
| Edit a document | Collections → Edit icon |
| Delete data | Collections → Delete icon |
| Check connection string | Database Access → Connect |

---

## 📊 Example: Viewing Statistics

### How Many Total Requests?

**In MongoDB Atlas:**
1. Go to Data Explorer
2. Click `requests` collection
3. See count at top: "6 documents" (or however many)

### How Many Pending Requests?

**Using Filters:**
1. In Data Explorer → `requests`
2. Click "Filter"
3. Enter: `{ "status": "Pending" }`
4. Click "Find"
5. See filtered count

### All Requests from Boys Hostel:

**Filter:**
```json
{ "department": "Boys Hostel" }
```

### Requests Assigned to Ahmed:

**Filter:**
```json
{ "assignedWorker.name": "Ahmed" }
```

---

## 🚨 Troubleshooting

### Data Not Appearing?

1. **Check Connection:**
   - Terminal should show "Successfully connected to MongoDB Atlas"
   
2. **Refresh MongoDB Atlas:**
   - Click the refresh icon in Data Explorer
   
3. **Check Collection Name:**
   - Make sure you're looking at `alhuda-maintenance` database
   - Not a different database

### Can't See New Requests?

1. **Refresh the page** in MongoDB Atlas
2. Check if request was submitted successfully in your app
3. Look for error messages in browser console (F12)

### Connection Issues?

1. **Check IP Whitelist:**
   - Network Access → should have "0.0.0.0/0"
   
2. **Check Password:**
   - Make sure .env has correct password (no < >)

---

## 🎉 Pro Tips

1. **Bookmark Data Explorer**
   - Quick access to view data
   
2. **Use Filters Often**
   - Filter by status, department, date
   
3. **Export Data**
   - Collections → Export → JSON or CSV
   - Great for reports
   
4. **Create Charts**
   - Visualize trends in Google Sheets style
   
5. **Set Up Alerts**
   - Get notified of important events

---

## 📖 What to Look at After Vercel Deployment

**24 Hours After Deploy:**

1. **Metrics → Operations**
   - See query patterns
   - Peak usage times
   
2. **Metrics → Connections**
   - How many users connected
   
3. **Collections → requests**
   - See real requests from users
   
4. **Performance Advisor**
   - Check for optimization suggestions

---

**Remember:** Your data in MongoDB Atlas is the **single source of truth**. Both your local app and Vercel deployment connect to the **same database**. Any changes made locally will be visible on Vercel and vice versa!
