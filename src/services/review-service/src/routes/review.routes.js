const express = require("express");
const router = express.Router();
const controller = require("../controllers/review.controller");

router.get("/", controller.getAllReviews);
router.post("/", controller.createReview);
router.get("/ride/:rideId", controller.getReviewsByRide);

module.exports = router;
