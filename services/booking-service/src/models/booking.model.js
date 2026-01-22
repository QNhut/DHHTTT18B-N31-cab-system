const bookings = [];

module.exports = {
  create(booking) {
    bookings.push(booking);
    return booking;
  },

  findAll() {
    return bookings;
  }
};
