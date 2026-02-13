const express = require("express");
const bookingRoutes = require("./routes/booking.routes");

const app = express();

app.use(express.json());

// routes
app.use("/api/bookings", bookingRoutes);

// health check
app.get("/ping", (req, res) => {
  res.json({ status: "OK", service: "booking-service" });
});

module.exports = app;