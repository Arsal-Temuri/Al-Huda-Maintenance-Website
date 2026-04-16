const { getDatabase } = require('../config/db');

exports.getWorkers = async (req, res) => {
  try {
    const db = await getDatabase();
    const workers = await db.collection('workers').find({}).toArray();
    res.json({ workers });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};