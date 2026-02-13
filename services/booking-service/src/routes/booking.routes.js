const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");

// Tạo booking
router.post("/", bookingController.createBooking);
// Lấy tất cả
router.get("/", bookingController.getAllBookings);
// Lấy booking có id nào
router.get("/:id", bookingController.getBookingById);

module.exports = router;

