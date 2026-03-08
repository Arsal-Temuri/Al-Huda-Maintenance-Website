# Al Huda Maintenance Request Management System

## 🎯 Project Overview

This is a **minimal working prototype** of a digital request management system designed for Al Huda International Foundation's maintenance operations. The system digitizes the workflow from request submission to task completion while maintaining compatibility with existing WhatsApp-based worker communication.

### Current Manual Process
1. Departments fill paper demand slips
2. Slips go to female admin for verification
3. Slips go to male admin office
4. Admin assigns workers via WhatsApp
5. Workers collect physical slips
6. Work completed
7. Admin records in physical registers

### Digital Workflow (Prototype)
1. **Departments** → Submit requests via web form
2. **Female Admin** → Verify requests digitally
3. **Male Admin** → Assign workers and update status
4. **Workers** → Still use WhatsApp (outside system)
5. **Admins** → Track completion and view history

---

## 🚀 Features

### 1. Public Request Submission
- Departments submit maintenance requests via a simple form
- Fields: Department, Type, Description, Priority, Optional Photo
- Auto-generated Request ID for tracking
- No login required for departments

### 2. Admin Authentication
- Secure login for admin users
- Role-based access (Female Admin, Male Admin)
- Session management

### 3. Admin Dashboard
- View all maintenance requests in real-time
- Filter by status (Pending, Verified, Assigned)
- Statistics overview (Total, Pending, In Progress, Completed)
- Verify requests (Female Admin)
- Assign workers (Male Admin)
- Mark tasks as completed (Male Admin)

### 4. Worker Assignment
- Select from predefined worker list
- Automatic status update to "Assigned"
- Generated WhatsApp message template for admin to send
- Worker contact information displayed

### 5. Task History
- View all completed tasks
- Analytics (Today, This Week, This Month)
- Detailed task information
- Duration tracking
- Full audit trail

---

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **express-session** - Session management
- **multer** - File upload handling
- **MongoDB** - Cloud database (MongoDB Atlas)
- **dotenv** - Environment variable management

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (Custom responsive design)
- **JavaScript (ES6+)** - Client-side logic

### Database
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- Scalable and production-ready
- Three collections: admins, workers, requests

---

## 📁 Project Structure

```
al-huda-maintenance-system/
├── server.js                 # Backend server
├── package.json              # Dependencies
├── database.json             # Data storage
├── public/                   # Frontend files
│   ├── index.html           # Request submission page
│   ├── login.html           # Admin login page
│   ├── dashboard.html       # Admin dashboard
│   ├── history.html         # Task history page
│   ├── css/
│   │   └── styles.css       # All styles
│   └── js/
│       ├── request.js       # Request form logic
│       ├── login.js         # Login logic
│       ├── dashboard.js     # Dashboard logic
│       └── history.js       # History page logic
└── uploads/                  # Photo uploads (auto-created)
```

---

## 🔧 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **MongoDB Atlas account** (free tier) - [Sign up here](https://www.mongodb.com/cloud/atlas)

### Step 1: Clone Repository
```bash
git clone https://github.com/Arsal-Temuri/Al-Huda-Maintenance-Website.git
cd Al-Huda-Maintenance-Website
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure MongoDB
1. Create a MongoDB Atlas account and cluster (see [DEPLOYMENT.md](DEPLOYMENT.md) for detailed steps)
2. Get your MongoDB connection string
3. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
4. Edit `.env` and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   PORT=3000
   ```

### Step 4: Seed Database
Populate MongoDB with initial data:
```bash
npm run seed
```

### Step 5: Start the Server
```bash
npm start
```

You should see:
```
============================================================
  Al Huda Maintenance System - Server Started
============================================================
  Server running at: http://localhost:3000
  Request Form: http://localhost:3000
  Admin Login: http://localhost:3000/login.html
============================================================
  Default Admin Credentials:
  Female Admin: female_admin / admin123
  Male Admin: male_admin / admin123
============================================================
```

### Step 3: Access the System
Open your web browser and go to:
- **Request Form**: http://localhost:3000
- **Admin Login**: http://localhost:3000/login.html

---

## 👥 User Roles & Credentials

### Department Staff (No Login Required)
- **Access**: Request submission form only
- **Actions**: Submit maintenance requests
- **URL**: http://localhost:3000

### Female Admin
- **Username**: `female_admin`
- **Password**: `admin123`
- **Actions**: 
  - View all requests
  - Verify pending requests
  - View history

### Male Admin
- **Username**: `male_admin`
- **Password**: `admin123`
- **Actions**:
  - View all requests
  - Assign workers to verified requests
  - Mark assigned tasks as completed
  - View history

---

## 📊 System Workflow Demonstration

### Step-by-Step Demo

#### 1. Submit a Request (Department)
1. Go to http://localhost:3000
2. Fill in the form:
   - **Department**: Boys Hostel
   - **Type**: Plumbing
   - **Description**: Water leakage in bathroom
   - **Priority**: High
   - **Photo**: (optional)
3. Click "Submit Request"
4. Note the Request ID (e.g., REQ-2603-1234)

#### 2. Verify Request (Female Admin)
1. Login at http://localhost:3000/login.html
   - Username: `female_admin`
   - Password: `admin123`
2. View the request in dashboard
3. Click "✓ Verify" button
4. Status changes to "Verified"

#### 3. Assign Worker (Male Admin)
1. Logout and login as male admin
   - Username: `male_admin`
   - Password: `admin123`
2. Click "Assign Worker" on the verified request
3. Select "Ahmed (Plumber)" from dropdown
4. Click "Assign Worker"
5. A WhatsApp message template appears
6. Copy the message and send to worker via WhatsApp
7. Status changes to "Assigned"

#### 4. Complete Task (Male Admin)
1. When worker reports completion
2. Click "✓ Complete" button
3. Status changes to "Completed"
4. Task moves to history

#### 5. View History
1. Click "View History" button
2. See all completed tasks
3. View statistics (Today, This Week, This Month)
4. Click "View" to see detailed information

---

## 🎨 User Interface

### Request Submission Page
- Clean, modern form design
- Purple gradient background
- Mobile responsive
- Success modal with Request ID
- No authentication required

### Admin Dashboard
- Statistics cards at top
- Filterable table (All, Pending, Verified, Assigned)
- Action buttons based on status and role
- Real-time updates
- Role-based button visibility

### Task History
- Completed tasks table
- Analytics overview
- Duration tracking
- Detailed view modal
- Full audit trail

---

## 🔐 Security Features (Prototype Level)

1. **Session-based authentication**
   - Admins must login to access dashboard
   - Sessions expire after 24 hours

2. **Role-based access control**
   - Female admin can only verify
   - Male admin can assign and complete

3. **Public endpoint protection**
   - Dashboard and history are protected
   - Request submission is public (as required)

4. **No direct database access**
   - All data access through API endpoints
   - Server-side validation

---

## 📱 Workers & WhatsApp Integration

### Predefined Workers
The system includes 4 workers:
1. **Ahmed** - Plumber - +92-300-1234567
2. **Ali** - Electrician - +92-300-7654321
3. **Bilal** - Maintenance - +92-300-1112233
4. **Hassan** - Cleaner - +92-300-9998877

### WhatsApp Communication
When a worker is assigned:
1. Admin sees a formatted message
2. Message includes:
   - Worker name
   - Request ID
   - Department
   - Task type
   - Priority
   - Description
3. Admin manually copies and sends via WhatsApp
4. Worker collects physical slip (if needed)

**Note**: No WhatsApp API integration in this prototype. Admin manually sends messages.

---

## 💾 Database Structure

The MongoDB database (`alhuda-maintenance`) contains three collections:

### Collections:
- **admins** - Admin user accounts
- **workers** - Maintenance workers
- **requests** - Maintenance requests

### Sample Document Structure:

```json
// admins collection
{
  "id": 1,
  "username": "female_admin",
  "password": "admin123",
  "role": "female_admin",
  "name": "Female Admin"
}

// workers collection
{
  "id": 1,
  "name": "Ahmed",
  "role": "Plumber",
  "phone": "+92-300-1234567"
}

// requests collection
{
  "id": "REQ-2603-1234",
  "department": "Boys Hostel",
  "requestType": "Plumbing",
  "description": "Water leakage",
  "priority": "High",
  "status": "Pending",
  "assignedWorker": null,
  "photo": null,
  "submittedAt": "2026-03-07T...",
  "verifiedAt": null,
  "assignedAt": null,
  "completedAt": null,
  "verifiedBy": null,
  "assignedBy": null,
  "completedBy": null
}
```

**Note**: The system includes a `database.json` file for reference, but the live system uses MongoDB Atlas.

---

## 🔄 Request Statuses

1. **Pending** - Newly submitted, awaiting verification
2. **Verified** - Approved by female admin, ready for assignment
3. **Assigned** - Worker assigned, task in progress
4. **Completed** - Task finished by worker

---

## 📈 Benefits Over Manual Process

### For Admins
✅ Digital record keeping (no paper registers)
✅ Real-time status tracking
✅ Quick search and filter
✅ Historical data and analytics
✅ Audit trail (who did what, when)

### For Departments
✅ No need to visit admin office
✅ Instant request submission
✅ Request ID for tracking
✅ 24/7 submission availability

### For Organization
✅ Reduced paperwork
✅ Better accountability
✅ Data-driven insights
✅ Faster processing time
✅ Easy reporting

---

## 🚧 Limitations (Prototype)

This is a **prototype**, not a production system. Limitations include:

1. **File uploads on Vercel** - Photos stored temporarily (serverless limitation)
2. **Basic authentication** - Passwords stored in plain text (MongoDB)
3. **No password reset** - Fixed credentials
4. **No email notifications** - Manual communication only
5. **No user management** - Can't add/remove admins via UI
6. **Manual WhatsApp** - No API integration
7. **Session storage** - May not persist across serverless regions

---

## 🎯 Future Enhancements (Production)

For a production system, consider:

1. **Authentication**: bcrypt password hashing, JWT tokens, OAuth
2. **File Storage**: Cloud storage (Cloudinary, AWS S3, Vercel Blob)
3. **Notifications**: Email and SMS alerts
4. **Reporting**: PDF generation, advanced Excel exports
5. **Mobile App**: React Native or Flutter
6. **WhatsApp API**: Automated message sending (WhatsApp Business API)
7. **User Management**: Add/edit users, departments, workers via UI
8. **Advanced Analytics**: Charts, graphs, trends, performance metrics
9. **Multi-language**: Urdu and English support
10. **Session Management**: Redis or MongoDB sessions for better persistence

---

## 🐛 Troubleshooting

### Port Already in Use
If you get "Port 3000 already in use" error:
1. Find the process: `netstat -ano | findstr :3000`
2. Kill it: `taskkill /PID <process_id> /F`
3. Or change port in `server.js`: `const PORT = 3001;`

### Database Not Loading
1. Make sure `database.json` exists
2. Check JSON syntax is valid
3. Restart the server

### Can't Login
- Make sure you're using correct credentials
- Clear browser cookies
- Try in incognito/private mode

### Photos Not Uploading
- Check `uploads/` folder exists
- Verify file size is reasonable (<10MB)
- Check file is an image format

---

## 🌐 Deployment to Production

This system is now configured to work with **MongoDB Atlas** and can be deployed to **Vercel** for free!

### Quick Deployment Steps:
1. Set up MongoDB Atlas (free tier)
2. Configure environment variables
3. Seed your database
4. Deploy to Vercel

📚 **See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step deployment instructions**

### What You Need:
- MongoDB Atlas account (database hosting)
- Vercel account (app hosting)
- GitHub repository (already set up!)

Both services offer generous free tiers perfect for this prototype.

---

## 📝 API Endpoints

### Public
- `POST /api/requests` - Submit new request

### Protected (Requires Authentication)
- `POST /api/login` - Admin login
- `GET /api/auth/check` - Check auth status
- `POST /api/logout` - Logout
- `GET /api/requests` - Get all requests
- `GET /api/workers` - Get workers list
- `POST /api/requests/:id/verify` - Verify request
- `POST /api/requests/:id/assign` - Assign worker
- `POST /api/requests/:id/complete` - Complete request

---

## 📞 Support

For questions or issues with this prototype:
- Check this README first
- Review the code comments
- Test with provided credentials
- Verify Node.js and npm are installed correctly

---

## 📄 License

This is a prototype system for Al Huda International Foundation.
MIT License - Free to use, modify, and distribute.

---

## ✨ Summary

This prototype demonstrates a **complete digital workflow** for maintenance request management:

1. ✅ Departments can submit requests online
2. ✅ Female admin can verify requests
3. ✅ Male admin can assign workers and track completion
4. ✅ Workers receive info via WhatsApp (manual)
5. ✅ Complete history and analytics
6. ✅ Role-based access control
7. ✅ Clean, modern interface
8. ✅ Easy to run locally

**The system successfully bridges the gap between digital tracking and traditional worker communication methods.**

---

**Developed for Al Huda International Foundation**
*Prototype Version 1.0 - March 2026*
