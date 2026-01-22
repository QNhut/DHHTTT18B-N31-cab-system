const Review = require("../models/Review");

exports.createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReviewsByRide = async (req, res) => {
  const { rideId } = req.params;
  const reviews = await Review.findAll({ where: { rideId } });
  res.json(reviews);
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};