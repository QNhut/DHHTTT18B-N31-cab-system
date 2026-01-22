module.exports = {
  publishBookingCreated(booking) {
    console.log('📣 EVENT: BookingCreated');
    console.log(JSON.stringify(booking, null, 2));
  }
};
