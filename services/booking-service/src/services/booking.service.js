const { v4: uuidv4 } = require("uuid");
const Booking = require("../models/booking.model");
const bookingRepo = require("../repositories/booking.repo");

const pricingService = require("./pricing.service");
const aiMatchingService = require("./aiMatching.service");

exports.createBooking = async ({ pickup, dropoff }) => {
  // 1. Calculate fare
  const fare = await pricingService.calculateFare(pickup, dropoff);

  // 2. Find best driver (AI Matching)
  const driverId = await aiMatchingService.findBestDriver(pickup);

  // 3. Create booking
  const booking = new Booking({
    id: uuidv4(),
    pickup,
    dropoff,
    fare,
    driverId,
    status: "DRIVER_ASSIGNED",
  });

  // 4. Save booking
  return bookingRepo.save(booking);
};

exports.getBookingById = (id) => {
  return bookingRepo.findById(id);
};

exports.getAllBookings = () => {
  return bookingRepo.findAll();
};
