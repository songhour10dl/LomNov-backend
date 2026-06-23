const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Sup gang 😎");
});

module.exports = router;
