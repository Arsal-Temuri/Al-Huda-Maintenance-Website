const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, workerController.getWorkers);

module.exports = router;