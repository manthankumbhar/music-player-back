const Pool = require("pg").Pool;
require("dotenv").config();

const devConfig = `postgresql://${process.env.DV_USER}:${process.env.DV_PASSWORD}@${process.env.DV_HOST}:${process.env.DV_PORT}/${process.env.DV_DATABASE}`;

const proConfig = process.env.DATABASE_URL;

const pool = new Pool({
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  connectionString:
    process.env.NODE_ENV === "production" ? proConfig : devConfig,
});

module.exports = pool;
