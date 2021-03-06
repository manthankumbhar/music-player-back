require("dotenv").config();

module.exports = {
  serviceID: process.env.TWILIO_SERVICE_ID,
  accountSID: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
};
