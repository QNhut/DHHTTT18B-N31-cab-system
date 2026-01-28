const bookingService = require("../services/booking.service");

exports.createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking(req.body);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  const booking = bookingService.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  res.json(booking);
};


exports.getAllBookings = (req, res) => {
  const bookings = bookingService.getAllBookings();
  res.json(bookings);
};

