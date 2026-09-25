const express = require("express");
const ContactMessage = require("../models/ContactMessage");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
    } = req.body;

    const cleanName =
      typeof name === "string" ? name.trim() : "";

    const cleanEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    const cleanPhone =
      typeof phone === "string" ? phone.trim() : "";

    const cleanSubject =
      typeof subject === "string" ? subject.trim() : "";

    const cleanMessage =
      typeof message === "string" ? message.trim() : "";

    if (
      !cleanName ||
      !cleanEmail ||
      !cleanSubject ||
      !cleanMessage
    ) {
      return res.status(400).json({
        message:
          "Please fill in all required fields.",
      });
    }

    if (cleanName.length > 100) {
      return res.status(400).json({
        message: "Name is too long.",
      });
    }

    if (cleanEmail.length > 150) {
      return res.status(400).json({
        message: "Email address is too long.",
      });
    }

    if (cleanPhone.length > 20) {
      return res.status(400).json({
        message: "Phone number is too long.",
      });
    }

    if (cleanSubject.length > 200) {
      return res.status(400).json({
        message: "Subject is too long.",
      });
    }

    if (cleanMessage.length > 2000) {
      return res.status(400).json({
        message: "Message is too long.",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const contactMessage =
      await ContactMessage.create({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        message: cleanMessage,
      });

    return res.status(201).json({
      message:
        "Thank you for contacting RATLAMI Zayka. Our team will get back to you soon.",
      contactId: contactMessage._id,
    });
  } catch (error) {
    console.error(
      "Contact Message Error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Unable to send your message right now. Please try again later.",
    });
  }
});

module.exports = router;