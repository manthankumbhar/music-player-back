const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(cors());

var port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "hello world!" });
});

app.listen(port, () => {
  console.log(`running on ${port}`);
});
