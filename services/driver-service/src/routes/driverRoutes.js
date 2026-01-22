const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const driverController = require('../controllers/driverController');

// Public test route (no auth)
router.get('/test', (req, res) => {
	res.json({ message: 'Driver service is working' });
});

// API trả về 1 object driver mẫu cho frontend test (no auth)
router.get('/mock', driverController.testDriver);

// Public route (nếu cần, nhưng MVP dùng auth)
router.post('/', authMiddleware, driverController.registerDriver);

// Protected routes
router.get('/:id', authMiddleware, driverController.getDriver);
router.put('/:id', authMiddleware, driverController.updateDriver);
router.put('/:id/location', authMiddleware, driverController.updateLocation);

module.exports = router;