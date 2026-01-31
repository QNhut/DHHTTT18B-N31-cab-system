const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const driverController = require('../controllers/driverController');

<<<<<<< HEAD
=======
// In-memory storage for testing (will reset on server restart)
let drivers = {
	driver_001: {
		driver_id: 'driver_001',
		name: 'Nguyen Van A',
		phone: '0912345678',
		email: 'driver@example.com',
		vehicle_type: 'car',
		license_plate: '29A-12345',
		latitude: 21.0285,
		longitude: 105.8542
	}
};

>>>>>>> main
// Public test route (no auth)
router.get('/test', (req, res) => {
	res.json({ message: 'Driver service is working' });
});

// API trả về 1 object driver mẫu cho frontend test (no auth)
router.get('/mock', driverController.testDriver);

<<<<<<< HEAD
// Public route (nếu cần, nhưng MVP dùng auth)
=======
// Test endpoints without auth (for development/testing only)
router.post('/test-register', (req, res) => {
	const { name, phone, email, vehicle_type, license_plate } = req.body;
	const driver_id = 'driver_' + Object.keys(drivers).length;
	drivers[driver_id] = {
		driver_id,
		name,
		phone,
		email,
		vehicle_type,
		license_plate,
		latitude: 10.762622,
		longitude: 106.660172
	};
	res.status(201).json(drivers[driver_id]);
});

router.get('/test-get/:id', (req, res) => {
	const driver = drivers[req.params.id];
	if (!driver) {
		return res.status(404).json({ error: 'Driver not found' });
	}
	res.json(driver);
});

router.put('/test-update/:id', (req, res) => {
	const driver = drivers[req.params.id];
	if (!driver) {
		return res.status(404).json({ error: 'Driver not found' });
	}
	drivers[req.params.id] = { ...driver, ...req.body };
	res.json(drivers[req.params.id]);
});

router.put('/test-location/:id', (req, res) => {
	const driver = drivers[req.params.id];
	if (!driver) {
		return res.status(404).json({ error: 'Driver not found' });
	}
	drivers[req.params.id].latitude = req.body.latitude;
	drivers[req.params.id].longitude = req.body.longitude;
	res.json(drivers[req.params.id]);
});

// Protected routes (production - requires auth)
>>>>>>> main
router.post('/', authMiddleware, driverController.registerDriver);

// Protected routes
router.get('/:id', authMiddleware, driverController.getDriver);
router.put('/:id', authMiddleware, driverController.updateDriver);
router.put('/:id/location', authMiddleware, driverController.updateLocation);

module.exports = router;