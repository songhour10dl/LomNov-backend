// services/emailService.js
const nodemailer = require("nodemailer");

const sendVerificationEmail = async (toEmail, otpCode) => {
  try {
    // 1. Setup the connection profile to Gmail's SMTP servers
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL/TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // The 16-character App Password
      },
    });

    // 2. Format the layout of the email text
    const mailOptions = {
      from: `"LomNov Auth" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Your 6-Digit Secure Verification Code",
      text: `Hello,\n\nYour security verification code is: ${otpCode}.\n\nThis code will expire in 10 minutes. Please do not share it with anyone.`,
    };

    // 3. Fire the email out across the web
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ Nodemailer failed to send email:", error);
    return false;
  }
};

module.exports = { sendVerificationEmail };
