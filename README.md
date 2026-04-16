# Al Huda Maintenance System

A full-stack MERN (MongoDB, Express, React, Node.js) application designed to manage digital maintenance requests efficiently.

## 🏗️ Architecture

The project has been scaled and migrated from a monolithic Vanilla JS structure into an industry-standard MVC MERN stack format:

### `/client`
The frontend application built with **React 18** and **Vite**.
- Uses `react-router-dom` for client-side routing.
- Handles user authentication and protected admin dashboards.
- Integrates optimistic UI updates and session storage.

### `/server`
The backend application built with **Node.js** and **Express**.
- **Controllers (`server/controllers/`):** Contains all isolated business logic (Request Management, Worker Assignment, Authentication, Export).
- **Routes (`server/routes/`):** Maps URL endpoints safely securely through Express routers.
- **Middleware (`server/middleware/`):** Contains protected route guards (`auth.js`) and file upload utilities (`upload.js` using Multer).
- **Configuration (`server/config/`):** Dedicated MongoDB Atlas database driver connector.

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB Atlas** (Ensure your connection string is valid in the root `.env` file)

### 2. Environment Variables
Your `.env` file MUST sit at the root directory of the project and contain:
\`\`\`env
MONGODB_URI=your_mongodb_connection_string_here
\`\`\`

### 3. Install Dependencies
You need to install dependencies for both the root backend server and the frontend client proxy. From your root terminal, run:

\`\`\`bash
npm install
cd client && npm install
cd ..
\`\`\`

### 4. Start the Application
You can run the backend and frontend separately from the root directory terminal.

**Start the Backend (Port 3000):**
\`\`\`bash
npm run server
\`\`\`

**Start the React Frontend (Port 5173 - Proxied to Backend):**
Open a second terminal at the root and run:
\`\`\`bash
npm run client
\`\`\`

---

## 🛠️ Advanced

**Database Seeding**
If you need to reset your database for testing purposes, you can populate it with default collections (Admins, Workers, default Requests) by running:
\`\`\`bash
npm run seed
\`\`\`