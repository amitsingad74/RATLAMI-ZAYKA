const mongoose = require("mongoose");
const dns = require("dns");
const User = require("./models/User");

require("dotenv").config();

// ===============================
// USE GOOGLE DNS
// ===============================

dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);

// ===============================
// ADMIN EMAIL
// ===============================

const adminEmail = "amitsingad74@gmail.com";


// ===============================
// CONNECT TO MONGODB
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {

    console.log("MongoDB Connected Successfully! 🍃");

    const user = await User.findOne({
      email: adminEmail.toLowerCase(),
    });

    if (!user) {

      console.log(
        "User not found. Please check the email."
      );

      process.exit();

    }

    user.role = "admin";

    await user.save();

    console.log(
      `Admin role assigned to ${user.email} 👨‍💼`
    );

    console.log(
      `Role: ${user.role}`
    );

    process.exit();

  })
  .catch((error) => {

    console.error(
      "Error:",
      error.message
    );

    process.exit(1);

  });