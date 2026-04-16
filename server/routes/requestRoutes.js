const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route
router.post('/', upload.single('photo'), requestController.submitRequest);

// Protected routes
router.get('/', isAuthenticated, requestController.getRequests);
router.get('/export', isAuthenticated, requestController.exportExcel);
router.post('/:id/verify', isAuthenticated, requestController.verifyRequest);
router.post('/:id/assign', isAuthenticated, requestController.assignWorker);
router.post('/:id/complete', isAuthenticated, requestController.completeRequest);
router.delete('/delete-multiple', isAuthenticated, requestController.deleteMultiple);

module.exports = router;