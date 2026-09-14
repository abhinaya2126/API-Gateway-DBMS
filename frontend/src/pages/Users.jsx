import { useEffect, useState } from "react";
import api from "../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users");

        setUsers(response.data.users || []);
      } catch (err) {
        console.error("Users error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load users."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const activeUsers = users.filter(
    (user) => user.is_active
  ).length;

  const inactiveUsers =
    users.length - activeUsers;

  const getInitials = (username) => {
    if (!username) return "U";

    return username
      .split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getRoleClass = (role) => {
    if (!role) return "user-role";

    const normalizedRole =
      role.toLowerCase();

    if (normalizedRole.includes("admin")) {
      return "user-role admin";
    }

    if (
      normalizedRole.includes("developer") ||
      normalizedRole.includes("dev")
    ) {
      return "user-role developer";
    }

    return "user-role";
  };

  if (loading) {
    return (
      <div className="users-loading">
        <div className="users-spinner"></div>

        <h3>Loading User Management</h3>

        <p>
          Retrieving registered users...
        </p>
      </div>
    );
  }

  return (
    <div className="users-page">

      {/* ==========================================
          PAGE HEADER
          ========================================== */}

      <div className="users-page-header">

        <div>

          <div className="users-breadcrumb">
            API GATEWAY
            <span>/</span>
            USER MANAGEMENT
          </div>

          <h1>Users</h1>

          <p>
            View and monitor users registered
            with the API Gateway.
          </p>

        </div>


        <div className="users-header-status">

          <span></span>

          User Directory Online

        </div>

      </div>


      {/* ==========================================
          ERROR
          ========================================== */}

      {error && (
        <div className="users-error">

          <span>!</span>

          {error}

        </div>
      )}


      {/* ==========================================
          STATISTICS
          ========================================== */}

      {!error && (
        <div className="users-summary">

          <div className="user-summary-card">

            <div className="user-summary-icon blue">
              ◉
            </div>

            <div>

              <span>
                Total Users
              </span>

              <strong>
                {users.length}
              </strong>

            </div>

          </div>


          <div className="user-summary-card">

            <div className="user-summary-icon green">
              ✓
            </div>

            <div>

              <span>
                Active Users
              </span>

              <strong>
                {activeUsers}
              </strong>

            </div>

          </div>


          <div className="user-summary-card">

            <div className="user-summary-icon gray">
              ○
            </div>

            <div>

              <span>
                Inactive Users
              </span>

              <strong>
                {inactiveUsers}
              </strong>

            </div>

          </div>

        </div>
      )}


      {/* ==========================================
          EMPTY STATE
          ========================================== */}

      {!error && users.length === 0 && (

        <div className="users-empty">

          <div className="users-empty-icon">
            ◉
          </div>

          <h2>
            No users found
          </h2>

          <p>
            There are currently no registered
            users in the API Gateway.
          </p>

        </div>

      )}


      {/* ==========================================
          USER TABLE
          ========================================== */}

      {!error && users.length > 0 && (

        <div className="users-table-card">

          <div className="users-table-header">

            <div>

              <span className="users-section-label">
                USER DIRECTORY
              </span>

              <h2>
                Registered Users
              </h2>

            </div>


            <div className="users-count">

              {users.length}{" "}
              {users.length === 1
                ? "User"
                : "Users"}

            </div>

          </div>


          <div className="users-table-wrapper">

            <table className="professional-users-table">

              <thead>

                <tr>

                  <th>
                    USER
                  </th>

                  <th>
                    EMAIL
                  </th>

                  <th>
                    ROLE
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    CREATED
                  </th>

                </tr>

              </thead>


              <tbody>

                {users.map(
                  (user, index) => (

                    <tr
                      key={user.user_id}
                      style={{
                        animationDelay:
                          `${index * 0.07}s`,
                      }}
                    >

                      {/* USER */}

                      <td>

                        <div className="user-profile-cell">

                          <div className="user-avatar">

                            {getInitials(
                              user.username
                            )}

                          </div>


                          <div className="user-profile-info">

                            <strong>
                              {user.username}
                            </strong>

                            <span>
                              User ID #
                              {String(
                                user.user_id
                              ).padStart(2, "0")}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td>

                        <div className="user-email">

                          <span className="email-icon">
                            @
                          </span>

                          {user.email}

                        </div>

                      </td>


                      {/* ROLE */}

                      <td>

                        <span
                          className={getRoleClass(
                            user.role_name
                          )}
                        >

                          <span className="role-dot"></span>

                          {user.role_name}

                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            user.is_active
                              ? "user-status active"
                              : "user-status inactive"
                          }
                        >

                          <span></span>

                          {user.is_active
                            ? "Active"
                            : "Inactive"}

                        </span>

                      </td>


                      {/* CREATED */}

                      <td>

                        <div className="user-created">

                          <strong>
                            {new Date(
                              user.created_at
                            ).toLocaleDateString(
                              undefined,
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </strong>

                          <span>
                            Registered
                          </span>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>


          {/* FOOTER */}

          <div className="users-table-footer">

            <span>
              User directory synchronized with
              API Gateway
            </span>

            <span className="users-system-status">

              <span></span>

              DIRECTORY ONLINE

            </span>

          </div>

        </div>

      )}

    </div>
  );
}

export default Users;