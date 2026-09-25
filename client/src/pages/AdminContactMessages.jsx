import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../config/api";

function AdminContactMessages() {
  const navigate = useNavigate();

  // =========================================
  // USER + TOKEN
  // =========================================

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const token = localStorage.getItem("token");

  // =========================================
  // STATE
  // =========================================

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState("");

  const [deletingId, setDeletingId] = useState("");

  // =========================================
  // CHECK ADMIN
  // =========================================

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    fetchMessages();
  }, []);

  // =========================================
  // FETCH CONTACT MESSAGES
  // =========================================

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/contact`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch contact messages."
        );
      }

      if (!Array.isArray(data.messages)) {
        throw new Error(
          "Contact messages API returned invalid data."
        );
      }

      setMessages(data.messages);
    } catch (error) {
      console.error(
        "Admin Contact Messages Error:",
        error
      );

      setError(
        error.message ||
          "Unable to load contact messages."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // UPDATE STATUS
  // =========================================

  const handleStatusChange = async (
    messageId,
    status
  ) => {
    try {
      setUpdatingId(messageId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/contact/${messageId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update message status."
        );
      }

      setMessages((previousMessages) =>
        previousMessages.map((message) =>
          message._id === messageId
            ? {
                ...message,
                status,
              }
            : message
        )
      );
    } catch (error) {
      console.error(
        "Contact Status Error:",
        error
      );

      setError(
        error.message ||
          "Unable to update message status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  // =========================================
  // DELETE MESSAGE
  // =========================================

  const handleDelete = async (messageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact message?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(messageId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/contact/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete contact message."
        );
      }

      setMessages((previousMessages) =>
        previousMessages.filter(
          (message) =>
            message._id !== messageId
        )
      );
    } catch (error) {
      console.error(
        "Contact Delete Error:",
        error
      );

      setError(
        error.message ||
          "Unable to delete contact message."
      );
    } finally {
      setDeletingId("");
    }
  };

  // =========================================
  // COUNTS
  // =========================================

  const newCount = messages.filter(
    (message) => message.status === "New"
  ).length;

  const readCount = messages.filter(
    (message) => message.status === "Read"
  ).length;

  const resolvedCount = messages.filter(
    (message) => message.status === "Resolved"
  ).length;

  // =========================================
  // DATE FORMAT
  // =========================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="admin-contact-page">
        <div className="admin-contact-container">
          <div className="admin-contact-loading">
            Loading contact messages...
          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="admin-contact-page">

      <div className="admin-contact-container">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="admin-contact-header">

          <div>
            <p className="admin-contact-tag">
              CUSTOMER SUPPORT
            </p>

            <h1>
              Contact Messages 💬
            </h1>

            <p>
              Manage enquiries and messages
              submitted by your customers.
            </p>
          </div>

          <button
            className="admin-contact-back-btn"
            onClick={() =>
              navigate("/admin")
            }
          >
            ← Dashboard
          </button>

        </div>

        {/* =====================================
            ERROR
        ===================================== */}

        {error && (
          <div className="admin-contact-error">
            {error}
          </div>
        )}

        {/* =====================================
            SUMMARY
        ===================================== */}

        <div className="admin-contact-summary">

          <div className="admin-contact-summary-card">

            <div className="admin-contact-summary-icon">
              💬
            </div>

            <div>
              <span>Total Messages</span>
              <strong>
                {messages.length}
              </strong>
            </div>

          </div>

          <div className="admin-contact-summary-card">

            <div className="admin-contact-summary-icon">
              🆕
            </div>

            <div>
              <span>New</span>
              <strong>{newCount}</strong>
            </div>

          </div>

          <div className="admin-contact-summary-card">

            <div className="admin-contact-summary-icon">
              👁️
            </div>

            <div>
              <span>Read</span>
              <strong>{readCount}</strong>
            </div>

          </div>

          <div className="admin-contact-summary-card">

            <div className="admin-contact-summary-icon">
              ✅
            </div>

            <div>
              <span>Resolved</span>
              <strong>
                {resolvedCount}
              </strong>
            </div>

          </div>

        </div>

        {/* =====================================
            MESSAGES
        ===================================== */}

        <div className="admin-contact-list">

          {messages.length === 0 ? (

            <div className="admin-contact-empty">

              <div className="admin-contact-empty-icon">
                📭
              </div>

              <h2>
                No Contact Messages
              </h2>

              <p>
                Customer enquiries will appear
                here when someone submits the
                Contact Us form.
              </p>

            </div>

          ) : (

            messages.map((message) => (

              <div
                className={`admin-contact-card ${
                  message.status === "New"
                    ? "admin-contact-card-new"
                    : ""
                }`}
                key={message._id}
              >

                {/* =================================
                    MESSAGE HEADER
                ================================= */}

                <div className="admin-contact-card-header">

                  <div>

                    <div className="admin-contact-customer">

                      <div className="admin-contact-avatar">
                        {message.name
                          ?.charAt(0)
                          ?.toUpperCase() || "?"}
                      </div>

                      <div>

                        <h2>
                          {message.name}
                        </h2>

                        <p>
                          {message.email}
                        </p>

                      </div>

                    </div>

                  </div>

                  <span
                    className={`admin-contact-status admin-contact-status-${message.status.toLowerCase()}`}
                  >
                    {message.status}
                  </span>

                </div>

                {/* =================================
                    MESSAGE INFORMATION
                ================================= */}

                <div className="admin-contact-details">

                  <div className="admin-contact-detail">

                    <span>
                      SUBJECT
                    </span>

                    <strong>
                      {message.subject}
                    </strong>

                  </div>

                  <div className="admin-contact-detail">

                    <span>
                      PHONE
                    </span>

                    <strong>
                      {message.phone || "Not provided"}
                    </strong>

                  </div>

                  <div className="admin-contact-detail">

                    <span>
                      RECEIVED
                    </span>

                    <strong>
                      {formatDate(
                        message.createdAt
                      )}
                    </strong>

                  </div>

                </div>

                {/* =================================
                    MESSAGE BODY
                ================================= */}

                <div className="admin-contact-message">

                  <span>
                    MESSAGE
                  </span>

                  <p>
                    {message.message}
                  </p>

                </div>

                {/* =================================
                    ACTIONS
                ================================= */}

                <div className="admin-contact-actions">

                  <div className="admin-contact-status-control">

                    <label>
                      Status
                    </label>

                    <select
                      value={message.status}
                      onChange={(event) =>
                        handleStatusChange(
                          message._id,
                          event.target.value
                        )
                      }
                      disabled={
                        updatingId ===
                        message._id
                      }
                    >
                      <option value="New">
                        New
                      </option>

                      <option value="Read">
                        Read
                      </option>

                      <option value="Resolved">
                        Resolved
                      </option>
                    </select>

                  </div>

                  <div className="admin-contact-action-buttons">

                    <a
                      className="admin-contact-email-btn"
                      href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(
                        message.subject
                      )}`}
                    >
                      ✉️ Reply
                    </a>

                    {message.phone && (
                      <a
                        className="admin-contact-call-btn"
                        href={`tel:${message.phone}`}
                      >
                        📞 Call
                      </a>
                    )}

                    <button
                      className="admin-contact-delete-btn"
                      onClick={() =>
                        handleDelete(
                          message._id
                        )
                      }
                      disabled={
                        deletingId ===
                        message._id
                      }
                    >
                      {deletingId ===
                      message._id
                        ? "Deleting..."
                        : "🗑️ Delete"}
                    </button>

                  </div>

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
}

export default AdminContactMessages;