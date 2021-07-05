const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("./database");
const { generateUploadURL, downloadURL } = require("./s3");

const config = require("./twilio");
const client = require("twilio")(config.accountSID, config.authToken);

app.use(express.json());
app.use(cors());

var port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "hello world!" });
});

async function get_auth_user_info_by_email(email) {
  const data = await pool.query(
    `select * from auth_user_info where email = $1`,
    [email]
  );
  if (data.rows.length <= 0) {
    return null;
  } else if (data.rows.length == 1) {
    return data.rows[0];
  } else if (data.rows.length > 1) {
    throw new Error("error: voilates the unique ability!");
  }
}

async function insert_auth_user_info(email, password) {
  const data = await pool.query(
    `insert into auth_user_info(email, password) values ($1, $2)`,
    [email, password]
  );
  return await get_auth_user_info_by_email(email);
}

app.post("/user_signup", async (req, res) => {
  try {
    const reqBody = req.body;
    if (
      reqBody.email == null ||
      reqBody.email == "" ||
      reqBody.password == null ||
      reqBody.password == ""
    ) {
      return res
        .status(400)
        .json({ error: "email or password is not entered" });
    }
    var check_auth_user_info_by_email = await get_auth_user_info_by_email(
      reqBody.email
    );
    if (check_auth_user_info_by_email) {
      return res.status(400).json({ error: "user already exists!" });
    }

    const hashedPassword = await bcrypt.hash(reqBody.password, 10);
    await insert_auth_user_info(reqBody.email, hashedPassword);
    var user = await get_auth_user_info_by_email(reqBody.email);
    var accessToken = jwt.sign(user["email"], process.env.ACCESS_TOKEN_SECRET);
    res.status(200).json({ success: accessToken });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.post("/user_auth", async (req, res) => {
  var reqBody = req.body;
  if (
    reqBody.email == null ||
    reqBody.email == "" ||
    reqBody.password == null ||
    reqBody.password == ""
  ) {
    return res.status(400).json({ error: "email or password is not entered" });
  }
  var user = await get_auth_user_info_by_email(reqBody.email);
  if (!user) {
    return res
      .status(400)
      .json({ error: "user doesn't exist, please signup!" });
  }
  if (await bcrypt.compare(reqBody.password, user["password"])) {
    var accessToken = jwt.sign(user["email"], process.env.ACCESS_TOKEN_SECRET);
    res.status(200).json({ success: accessToken });
  } else {
    res.status(400).json({ error: "incorrect email or password" });
  }
});

app.post("/s3url", async (req, res) => {
  const url = await generateUploadURL();
  res.json({ success: url });
});

app.post("/songs/:id", async (req, res) => {
  const id = req.params.id;
  const url = await downloadURL(id);
  res.json({ success: url });
});

app.post("/forget_password_trigger", async (req, res) => {
  var reqData = req.body;
  await client.verify
    .services(config.serviceID)
    .verifications.create({
      to: `+${reqData.phone}`,
      channel: "sms",
    })
    .then((data) => {
      res.status(200).send(data);
    });
});

app.post("/forget_password_verify", async (req, res) => {
  var reqData = req.body;
  await client.verify
    .services(config.serviceID)
    .verificationChecks.create({
      to: `+${reqData.phone}`,
      code: reqData.code,
    })
    .then((data) => {
      res.status(200).send(data);
    });
});

app.listen(port, () => {
  console.log(`running on ${port}`);
});
