// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

// Protects sensitive routes like Requesting an OTP
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes window
  max: 3, // Limit each IP to 3 requests per 'window' (5 mins)
  message: {
    message:
      "Too many verification requests from this IP. Please try again after 5 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = { otpLimiter };
