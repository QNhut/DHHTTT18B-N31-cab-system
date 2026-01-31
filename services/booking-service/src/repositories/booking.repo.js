const bookings = new Map();

exports.save = (booking) => {
  bookings.set(booking.id, booking);
  return booking;
};

exports.findById = (id) => {
  return bookings.get(id);
};

exports.findAll = () => {
  return Array.from(bookings.values());
};
