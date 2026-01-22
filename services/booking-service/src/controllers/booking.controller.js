const { v4: uuidv4 } = require('uuid');
const BookingModel = require('../models/booking.model');
const PricingService = require('../services/pricing.mock');
const BookingEvent = require('../events/booking.event');

exports.createBooking = (req, res) => {
  const { userId, pickup, destination } = req.body;

  if (!userId || !pickup || !destination) {
    return res.status(400).json({
      message: 'Missing required fields'
    });
  }

  const fare = PricingService.calculateFare(pickup, destination);

  const booking = {
    id: uuidv4(),
    userId,
    pickup,
    destination,
    fare,
    status: 'CREATED',
    createdAt: new Date()
  };

  BookingModel.create(booking);

  // publish event
  BookingEvent.publishBookingCreated(booking);

  res.status(201).json({
    message: 'Booking created successfully',
    booking
  });
};

exports.getBookings = (req, res) => {
  res.json(BookingModel.findAll());
};
