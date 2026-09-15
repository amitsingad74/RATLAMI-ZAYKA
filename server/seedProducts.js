const mongoose = require("mongoose");
const dns = require("dns");
const Product = require("./models/Product");

require("dotenv").config();

// ===============================
// USE GOOGLE DNS
// ===============================

dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);

// ===============================
// PRODUCT DATA
// ===============================

const products = [
  {
    name: "Classic Ratlami Sev",
    category: "Ratlami Sev",
    price: 120,
    weight: "250g",
    emoji: "🌶️",
    image: "/images/ratlamiSev.png",
    description:
      "Authentic spicy Ratlami Sev with traditional flavours.",
  },

  {
    name: "Garlic Sev",
    category: "Sev",
    price: 140,
    weight: "250g",
    emoji: "🧄",
    image: "",
    description:
      "Crispy sev blended with delicious garlic flavour.",
  },

  {
    name: "Aloo Bhujia",
    category: "Namkeen",
    price: 130,
    weight: "250g",
    emoji: "🥔",
    image: "",
    description:
      "Crunchy and tasty aloo bhujia perfect for every snack time.",
  },

  {
    name: "Mix Namkeen",
    category: "Namkeen",
    price: 150,
    weight: "250g",
    emoji: "🥜",
    image: "",
    description:
      "A delicious mixture of crunchy traditional Indian namkeen.",
  },

  {
    name: "Masala Peanuts",
    category: "Namkeen",
    price: 110,
    weight: "200g",
    emoji: "🥜",
    image: "",
    description:
      "Crunchy peanuts coated with a spicy and tasty masala.",
  },

  {
    name: "Sweet Boondi",
    category: "Sweets",
    price: 160,
    weight: "250g",
    emoji: "🍬",
    image: "",
    description:
      "Traditional sweet boondi made with a delicious Indian recipe.",
  },

  {
    name: "Kaju Katli",
    category: "Sweets",
    price: 280,
    weight: "250g",
    emoji: "🍰",
    image: "",
    description:
      "Soft and delicious kaju katli made with premium cashews.",
  },

  {
    name: "Ratlami Mixture",
    category: "Namkeen",
    price: 170,
    weight: "250g",
    emoji: "🌶️",
    image: "",
    description:
      "A spicy and crunchy Ratlami-style mixture full of flavour.",
  },
];


// ===============================
// CONNECT TO MONGODB
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected Successfully! 🍃");

    // Remove old products
    await Product.deleteMany();

    // Add new products
    await Product.insertMany(products);

    console.log("Products added successfully! 🌶️");
    console.log(`${products.length} products inserted.`);

    process.exit();
  })
  .catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });