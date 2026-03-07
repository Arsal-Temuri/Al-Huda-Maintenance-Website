const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const PORT = 3000;

// Database file path
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'alhuda-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// Helper function to read database
function readDatabase() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { admins: [], workers: [], requests: [] };
  }
}

// Helper function to write database
function writeDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

// Generate unique request ID
function generateRequestId() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REQ-${year}${month}-${random}`;
}

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.admin) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// ==================== ROUTES ====================

// Submit new request (public endpoint)
app.post('/api/requests', upload.single('photo'), (req, res) => {
  try {
    const { department, requestType, description } = req.body;
    
    if (!department || !requestType || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = readDatabase();
    const requestId = generateRequestId();
    
    const newRequest = {
      id: requestId,
      department,
      requestType,
      description,
      priority: 'Not Set',
      status: 'Pending',
      assignedWorker: null,
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      submittedAt: new Date().toISOString(),
      verifiedAt: null,
      assignedAt: null,
      completedAt: null,
      verifiedBy: null,
      assignedBy: null,
      completedBy: null
    };

    db.requests.push(newRequest);
    
    if (writeDatabase(db)) {
      res.json({ 
        success: true, 
        requestId: requestId,
        message: 'Request submitted successfully'
      });
    } else {
      res.status(500).json({ error: 'Failed to save request' });
    }
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin login
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const db = readDatabase();
    const admin = db.admins.find(a => a.username === username && a.password === password);
    
    if (admin) {
      req.session.admin = {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        name: admin.name
      };
      res.json({ 
        success: true, 
        admin: { 
          username: admin.username, 
          role: admin.role,
          name: admin.name
        } 
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check authentication status
app.get('/api/auth/check', (req, res) => {
  if (req.session && req.session.admin) {
    res.json({ authenticated: true, admin: req.session.admin });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Get all requests (protected)
app.get('/api/requests', isAuthenticated, (req, res) => {
  try {
    const db = readDatabase();
    res.json({ requests: db.requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get workers list (protected)
app.get('/api/workers', isAuthenticated, (req, res) => {
  try {
    const db = readDatabase();
    res.json({ workers: db.workers });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify request (protected - female admin)
app.post('/api/requests/:id/verify', isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    
    if (!priority) {
      return res.status(400).json({ error: 'Priority is required' });
    }
    
    const db = readDatabase();
    
    const request = db.requests.find(r => r.id === id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Request already verified' });
    }

    request.status = 'Verified';
    request.priority = priority;
    request.verifiedAt = new Date().toISOString();
    request.verifiedBy = req.session.admin.name;
    
    if (writeDatabase(db)) {
      res.json({ success: true, request });
    } else {
      res.status(500).json({ error: 'Failed to update request' });
    }
  } catch (error) {
    console.error('Error verifying request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign worker (protected - male admin)
app.post('/api/requests/:id/assign', isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;
    const { workerId } = req.body;
    
    const db = readDatabase();
    
    const request = db.requests.find(r => r.id === id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const worker = db.workers.find(w => w.id === parseInt(workerId));
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    request.status = 'Assigned';
    request.assignedWorker = worker;
    request.assignedAt = new Date().toISOString();
    request.assignedBy = req.session.admin.name;
    
    if (writeDatabase(db)) {
      res.json({ success: true, request, worker });
    } else {
      res.status(500).json({ error: 'Failed to assign worker' });
    }
  } catch (error) {
    console.error('Error assigning worker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark request as completed (protected - male admin)
app.post('/api/requests/:id/complete', isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    
    const request = db.requests.find(r => r.id === id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'Assigned') {
      return res.status(400).json({ error: 'Request must be assigned before completion' });
    }

    request.status = 'Completed';
    request.completedAt = new Date().toISOString();
    request.completedBy = req.session.admin.name;
    
    if (writeDatabase(db)) {
      res.json({ success: true, request });
    } else {
      res.status(500).json({ error: 'Failed to complete request' });
    }
  } catch (error) {
    console.error('Error completing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update request status (protected)
app.patch('/api/requests/:id/status', isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Pending', 'Verified', 'Assigned', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const db = readDatabase();
    const request = db.requests.find(r => r.id === id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = status;
    
    if (writeDatabase(db)) {
      res.json({ success: true, request });
    } else {
      res.status(500).json({ error: 'Failed to update status' });
    }
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export requests to Excel (protected)
app.get('/api/export/requests', isAuthenticated, (req, res) => {
  try {
    console.log('Export endpoint called by:', req.session.user);
    console.log('Export filter:', req.query.status);
    
    const db = readDatabase();
    const { status } = req.query;
    
    // Filter requests based on status if provided
    let requests = db.requests;
    if (status && status !== 'all') {
      requests = requests.filter(r => r.status === status);
    }
    
    console.log(`Found ${requests.length} requests to export`);
    
    // Prepare data for Excel
    const excelData = requests.map(request => ({
      'Request ID': request.id,
      'Department': request.department,
      'Type': request.requestType,
      'Description': request.description,
      'Priority': request.priority,
      'Status': request.status,
      'Worker Name': request.assignedWorker ? request.assignedWorker.name : 'N/A',
      'Worker Role': request.assignedWorker ? request.assignedWorker.role : 'N/A',
      'Worker Phone': request.assignedWorker ? request.assignedWorker.phone : 'N/A',
      'Submitted At': new Date(request.submittedAt).toLocaleString(),
      'Verified At': request.verifiedAt ? new Date(request.verifiedAt).toLocaleString() : 'N/A',
      'Verified By': request.verifiedBy || 'N/A',
      'Assigned At': request.assignedAt ? new Date(request.assignedAt).toLocaleString() : 'N/A',
      'Assigned By': request.assignedBy || 'N/A',
      'Completed At': request.completedAt ? new Date(request.completedAt).toLocaleString() : 'N/A',
      'Completed By': request.completedBy || 'N/A'
    }));
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Request ID
      { wch: 20 }, // Department
      { wch: 15 }, // Type
      { wch: 30 }, // Description
      { wch: 10 }, // Priority
      { wch: 12 }, // Status
      { wch: 20 }, // Worker Name
      { wch: 15 }, // Worker Role
      { wch: 15 }, // Worker Phone
      { wch: 20 }, // Submitted At
      { wch: 20 }, // Verified At
      { wch: 20 }, // Verified By
      { wch: 20 }, // Assigned At
      { wch: 20 }, // Assigned By
      { wch: 20 }, // Completed At
      { wch: 20 }  // Completed By
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Requests');
    
    // Generate buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers and send file
    const fileName = `Al_Huda_Requests_${status || 'all'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(excelBuffer);
    
    console.log('Excel file generated successfully');
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: error.message || 'Failed to export data' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('  Al Huda Maintenance System - Server Started');
  console.log('='.repeat(60));
  console.log(`  Server running at: http://localhost:${PORT}`);
  console.log(`  Request Form: http://localhost:${PORT}`);
  console.log(`  Admin Login: http://localhost:${PORT}/login.html`);
  console.log('='.repeat(60));
  console.log('  Default Admin Credentials:');
  console.log('  Female Admin: female_admin / admin123');
  console.log('  Male Admin: male_admin / admin123');
  console.log('='.repeat(60));
});
