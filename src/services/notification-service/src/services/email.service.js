const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

exports.sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: `"Car Booking" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text
  });
};
