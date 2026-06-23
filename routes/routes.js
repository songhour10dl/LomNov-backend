const express = require("express");
const homepage = require("../routes/homepage");
const Auth = require("../routes/authRoutes");

module.exports = function (app) {
  app.use(express.json());
  app.use("/", homepage);
  app.use("/api/auth", Auth);
};
