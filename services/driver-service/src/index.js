require('dotenv').config();
const express = require('express');
const app = express();
const driverRoutes = require('./routes/driverRoutes');

app.use(express.json());

// Routes
app.use('/drivers', driverRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Driver Service running on port ${PORT}`);
});