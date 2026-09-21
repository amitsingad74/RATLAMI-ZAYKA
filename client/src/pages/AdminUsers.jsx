import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const token = localStorage.getItem("token");

  // =========================================
  // CHECK ADMIN + LOAD USERS
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

    fetchUsers();
  }, []);

  // =========================================
  // FETCH USERS
  // =========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
       `${API_URL}/api/admin/users`,
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
            "Failed to fetch users."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "Users API did not return a user list."
        );
      }

      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error(
        "Admin Users Error:",
        error
      );

      setError(
        error.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // SEARCH + ROLE FILTER
  // =========================================

  useEffect(() => {
    const searchText =
      search.trim().toLowerCase();

    const filtered = users.filter(
      (item) => {
        const matchesSearch =
          !searchText ||
          item.name
            ?.toLowerCase()
            .includes(searchText) ||
          item.email
            ?.toLowerCase()
            .includes(searchText) ||
          item.phone
            ?.toLowerCase()
            .includes(searchText);

        const matchesRole =
          roleFilter === "All" ||
          item.role === roleFilter;

        return (
          matchesSearch &&
          matchesRole
        );
      }
    );

    setFilteredUsers(filtered);
  }, [search, roleFilter, users]);

  // =========================================
  // UPDATE USER ROLE
  // =========================================

  const handleRoleChange = async (
    userId,
    newRole
  ) => {
    try {
      const response = await fetch(
       `${API_URL}/api/admin/users/${userId}/role`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update user role."
        );
      }

      alert(
        "User role updated successfully! ✅"
      );

      fetchUsers();
    } catch (error) {
      console.error(
        "Update User Role Error:",
        error
      );

      alert(
        error.message ||
          "Failed to update user role."
      );
    }
  };

  // =========================================
  // DELETE USER
  // =========================================

  const handleDeleteUser = async (
    userId,
    userName
  ) => {
    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete "${userName}"?`
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}`,
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
            "Failed to delete user."
        );
      }

      alert(
        "User deleted successfully! 🗑️"
      );

      fetchUsers();
    } catch (error) {
      console.error(
        "Delete User Error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete user."
      );
    }
  };

  // =========================================
  // RESET FILTERS
  // =========================================

  const handleReset = () => {
    setSearch("");
    setRoleFilter("All");
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <h2>
            Loading Users... 👥
          </h2>
        </div>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>
            Something went wrong 😕
          </h2>

          <p>{error}</p>

          <button
            className="admin-add-btn"
            onClick={() =>
              navigate("/admin")
            }
          >
            ← Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="admin-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="admin-header">

        <div>
          <p className="admin-tag">
            ADMIN PANEL
          </p>

          <h1>
            User Management 👥
          </h1>

          <p>
            Manage registered RATLAMI Zayka users
          </p>
        </div>

        <button
          className="admin-add-btn"
          onClick={() =>
            navigate("/admin")
          }
        >
          ← Dashboard
        </button>

      </div>

      {/* =====================================
          USERS SECTION
      ===================================== */}

      <div className="admin-section">

        <div className="admin-section-header">

          <h2>
            Registered Users
          </h2>

          <span>
            {filteredUsers.length} of{" "}
            {users.length} Users
          </span>

        </div>

        {/* =====================================
            SEARCH + FILTER
        ===================================== */}

        <div className="admin-users-toolbar">

          <div className="admin-user-search-wrapper">

            <span className="admin-user-search-icon">
              🔍
            </span>

            <input
              type="text"
              className="admin-user-search"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <select
            className="admin-user-role-filter"
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
          >
            <option value="All">
              All Roles
            </option>

            <option value="admin">
              Admin
            </option>

            <option value="user">
              User
            </option>
          </select>

          <button
            className="admin-user-reset-btn"
            onClick={handleReset}
          >
            ↻ Reset
          </button>

        </div>

        {/* =====================================
            NO RESULTS
        ===================================== */}

        {filteredUsers.length === 0 ? (

          <div className="admin-no-users">

            <h3>
              No Users Found 👥
            </h3>

            <p>
              Try changing your search or filter.
            </p>

          </div>

        ) : (

          /* ===================================
             USERS TABLE
          =================================== */

          <div className="admin-users-table-wrapper">

            <table className="admin-users-table">

              <thead>

                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredUsers.map(
                  (item, index) => {

                    const isCurrentUser =
                      item._id === user._id;

                    return (
                      <tr key={item._id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          <strong>
                            {item.name}
                          </strong>

                          {isCurrentUser && (
                            <span className="admin-current-user">
                              You
                            </span>
                          )}
                        </td>

                        <td>
                          {item.email}
                        </td>

                        <td>
                          {item.phone}
                        </td>

                        <td>

                          <select
                            className={`admin-role-select ${
                              item.role ===
                              "admin"
                                ? "admin-role"
                                : "user-role"
                            }`}
                            value={item.role}
                            disabled={
                              isCurrentUser
                            }
                            onChange={(e) =>
                              handleRoleChange(
                                item._id,
                                e.target.value
                              )
                            }
                          >

                            <option value="user">
                              User
                            </option>

                            <option value="admin">
                              Admin
                            </option>

                          </select>

                        </td>

                        <td>
                          {item.createdAt
                            ? new Date(
                                item.createdAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td>

                          <button
                            className="admin-user-delete-btn"
                            disabled={
                              isCurrentUser
                            }
                            onClick={() =>
                              handleDeleteUser(
                                item._id,
                                item.name
                              )
                            }
                          >
                            🗑️ Delete
                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default AdminUsers;