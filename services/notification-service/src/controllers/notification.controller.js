const notificationService = require('../services/notification.service');

exports.sendNotification = async (req, res) => {
  try {
    const result = await notificationService.handleNotification(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
