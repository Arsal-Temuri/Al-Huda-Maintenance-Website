const { getDatabase } = require('../config/db');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const db = await getDatabase();
    const admin = await db.collection('admins').findOne({ username, password });
    
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
};

exports.checkAuth = (req, res) => {
  if (req.session && req.session.admin) {
    res.json({ authenticated: true, admin: req.session.admin });
  } else {
    res.json({ authenticated: false });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.json({ success: true });
};