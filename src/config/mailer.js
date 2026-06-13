const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetLink = `http://localhost:3000/api/auth/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: process.env.MAILTRAP_FROM,
    to: toEmail,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>Tumne password reset request ki hai.</p>
      <p>Neeche diye link pe click karo — ye <b>15 minutes</b> mein expire ho jaayega:</p>
      <a href="${resetLink}" style="
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
      ">Reset Password</a>
      <p>Agar tumne ye request nahi ki toh ignore karo.</p>
    `,
  });
};

module.exports = { sendPasswordResetEmail };