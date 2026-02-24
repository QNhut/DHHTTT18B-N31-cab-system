const express = require('express');
const rideRoutes = require('./routes/ride.routes');

const app = express();
app.use(express.json());

app.use('/rides', rideRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'ride-service' });
});

module.exports = app;
