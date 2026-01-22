const express = require('express');
const router = express.Router();
const rideController = require('../controllers/ride.controller');

router.post('/', rideController.createRide);
router.get('/:id', rideController.getRide);

module.exports = router;
