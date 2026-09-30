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
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333;">Security Verification</h2>
      <p>Hello,</p>
      <p>Your security verification code is:</p>
      <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px 20px; text-align: center; letter-spacing: 4px; margin: 20px 0; border-radius: 4px;">
        ${otpCode}
      </div>
      <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. Please do not share it with anyone.</p>
    </div>
  `,
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
