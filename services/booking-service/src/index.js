const express = require('express');
const bookingRoutes = require('./routes/booking.route');

const app = express();
app.use(express.json());

app.use('/bookings', bookingRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Booking Service running on port ${PORT}`);
});
