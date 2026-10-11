const cors = require("cors");
const express = require("express");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

require("./routes/routes")(app);
require("./startup/db");

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`Server is listening to ${port}`);
});

module.exports = server;
