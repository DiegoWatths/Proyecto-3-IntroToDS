const mongoose = require("mongoose");
require('dotenv').config({ path: '../../.env' });

exports.connect = () => {
  // Connecting to the database
  mongoose
    .connect(process.env.USERS_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed");
      console.error(error);
      process.exit(1);
    });
};