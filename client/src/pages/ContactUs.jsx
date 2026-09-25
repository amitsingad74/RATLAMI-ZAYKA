import React, { useState } from "react";
import API_URL from "../config/api";

function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send your message. Please try again."
        );
      }

      setSuccessMessage(
        data.message ||
          "Thank you for contacting RATLAMI Zayka. Our team will get back to you soon."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(
        "Contact Form Error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to send your message. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">

        {/* HEADER */}
        <div className="contact-header">

          <p className="contact-tag">
            WE ARE HERE TO HELP
          </p>

          <h1>
            Contact <span>Us</span>
          </h1>

          <p>
            Have a question about our products, orders, delivery,
            or anything else? We'd love to hear from you.
          </p>

        </div>

        {/* CONTENT */}
        <div className="contact-content">

          {/* CONTACT INFORMATION */}
          <div className="contact-info-card">

            <h2>
              Get In Touch
            </h2>

            <p className="contact-info-description">
              For product enquiries, order support, delivery questions,
              or general assistance, contact our support team.
            </p>

            {/* ADDRESS */}
            <div className="contact-info-item">

              <div className="contact-icon">
                📍
              </div>

              <div>
                <h3>
                  Address
                </h3>

                <p>
                  Ratlam, Madhya Pradesh, India
                </p>
              </div>

            </div>

            {/* PHONE */}
            <div className="contact-info-item">

              <div className="contact-icon">
                📞
              </div>

              <div>
                <h3>
                  Phone
                </h3>

                <p>
                  +91 XXXXXXXXXX
                </p>
              </div>

            </div>

            {/* EMAIL */}
            <div className="contact-info-item">

              <div className="contact-icon">
                ✉️
              </div>

              <div>
                <h3>
                  Email
                </h3>

                <p>
                  support@ratlamizayka.com
                </p>
              </div>

            </div>

            {/* SUPPORT HOURS */}
            <div className="contact-info-item">

              <div className="contact-icon">
                🕐
              </div>

              <div>
                <h3>
                  Support Hours
                </h3>

                <p>
                  Monday - Saturday
                  <br />
                  10:00 AM - 6:00 PM
                </p>
              </div>

            </div>

          </div>

          {/* CONTACT FORM */}
          <div className="contact-form-card">

            <h2>
              Send Us a Message
            </h2>

            <p>
              Fill in the details below and our team will get back
              to you as soon as possible.
            </p>

            {/* SUCCESS MESSAGE */}
            {successMessage && (
              <div className="contact-success-message">
                {successMessage}
              </div>
            )}

            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div className="contact-error-message">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* NAME */}
              <div className="contact-form-group">

                <label>
                  Your Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  maxLength="100"
                  required
                  disabled={submitting}
                />

              </div>

              {/* EMAIL */}
              <div className="contact-form-group">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  maxLength="150"
                  required
                  disabled={submitting}
                />

              </div>

              {/* PHONE */}
              <div className="contact-form-group">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  maxLength="20"
                  disabled={submitting}
                />

              </div>

              {/* SUBJECT */}
              <div className="contact-form-group">

                <label>
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  maxLength="200"
                  required
                  disabled={submitting}
                />

              </div>

              {/* MESSAGE */}
              <div className="contact-form-group">

                <label>
                  Message
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows="6"
                  maxLength="2000"
                  required
                  disabled={submitting}
                />

              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className="contact-submit-btn"
                disabled={submitting}
              >
                {submitting
                  ? "SENDING..."
                  : "SEND MESSAGE"}
              </button>

            </form>

          </div>

        </div>

        {/* SUPPORT NOTE */}
        <div className="contact-support-note">

          <div>
            🛍️
          </div>

          <div>

            <h3>
              Need help with an order?
            </h3>

            <p>
              Please keep your order ID ready when contacting
              our support team so we can assist you faster.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ContactUs;