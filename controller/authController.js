// controllers/authController.js
const authService = require("../services/authService");
const User = require("../models/user");

const Joi = require("joi");

const schema = Joi.object({
  email: Joi.string().min(5).max(255).required().email(),
  phone: Joi.string().min(9).required(),
  password: Joi.string().min(5).max(50).required(),
});

const registerUser = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const existingEmail = await User.findUserByEmail(email);
    if (existingEmail)
      return res.status(400).send("Email is already registered.");

    const existingPhone = await User.findUserByPhone(phone);
    if (existingPhone)
      return res.status(400).send("Phone number is already registered.");

    const result = await authService.register(email, phone, password);

    return res.status(201).json({
      message: "User registered successfully!",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
};
