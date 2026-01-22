const emailService = require('./email.service');
const { v4: uuid } = require('uuid');

exports.handleNotification = async (payload) => {
  const {
    userId,
    email,
    title,
    message,
    channel = 'EMAIL'
  } = payload;

  const notification = {
    id: uuid(),
    userId,
    title,
    message,
    channel,
    createdAt: new Date()
  };

  if (channel === 'EMAIL') {
    await emailService.sendEmail(email, title, message);
  }

  return {
    success: true,
    notification
  };
};
