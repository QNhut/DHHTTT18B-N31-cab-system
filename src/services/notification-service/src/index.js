require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env')
});
const express = require('express');
const notificationRoutes = require('./routes/notification.routes');

const app = express();
app.use(express.json());

app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({
    service: process.env.SERVICE_NAME,
    status: 'UP'
  });
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`🔔 Notification Service running on port ${PORT}`);
});

console.log("MAIL_HOST =", process.env.MAIL_HOST);
console.log("MAIL_PORT =", process.env.MAIL_PORT);
