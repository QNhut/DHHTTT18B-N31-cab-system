const rideService = require('../services/ride.service');

exports.createRide = async (req, res) => {
  const ride = await rideService.createRide(req.body);
  res.status(201).json(ride);
};

exports.getRide = async (req, res) => {
  const ride = await rideService.getRideById(req.params.id);
  res.json(ride);
};
