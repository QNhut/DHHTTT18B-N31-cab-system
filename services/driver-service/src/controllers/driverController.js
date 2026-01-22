const driverModel = require('../models/driverModel');

module.exports = {
  // API trả về dữ liệu mẫu driver để test frontend
  testDriver: (req, res) => {
    res.json({
      driver_id: 1,
      driver_name: 'Test Driver',
      phone: '0123456789',
      vehicleType: 'car',
      vehiclePlate: 'TEST123',
      latitude: 10.762622,
      longitude: 106.660172
    });
  },
  registerDriver: async (req, res) => {
    const { name, phone, vehicleType, vehiclePlate } = req.body;
    const userId = req.user.id;  // Từ JWT, giả định user đã login qua auth-service
    try {
      const driver = await driverModel.createDriver(userId, name, phone, vehicleType, vehiclePlate);
      res.status(201).json(driver);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getDriver: async (req, res) => {
    try {
      const driver = await driverModel.getDriverById(req.params.id);
      if (!driver) return res.status(404).json({ error: 'Driver not found' });
      res.json(driver);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateDriver: async (req, res) => {
    try {
      const driver = await driverModel.updateDriver(req.params.id, req.body);
      if (!driver) return res.status(404).json({ error: 'Driver not found' });
      res.json(driver);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateLocation: async (req, res) => {
    const { latitude, longitude } = req.body;
    try {
      const driver = await driverModel.updateLocation(req.params.id, latitude, longitude);
      if (!driver) return res.status(404).json({ error: 'Driver not found' });
      res.json(driver);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};