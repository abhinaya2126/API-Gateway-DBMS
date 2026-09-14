import { useEffect, useState } from "react";
import api from "../services/api";

function Permissions() {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);

  const [selectedUser, setSelectedUser] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [processingPermission, setProcessingPermission] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [usersResponse, permissionsResponse] =
          await Promise.all([
            api.get("/users"),
            api.get("/permissions"),
          ]);

        setUsers(usersResponse.data.users || []);
        setPermissions(permissionsResponse.data.permissions || []);
      } catch (err) {
        console.error("Permissions setup error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load permission data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchUserPermissions = async (userId) => {
    if (!userId) {
      setUserPermissions([]);
      return;
    }

    try {
      setLoadingPermissions(true);
      setError("");

      const response = await api.get(
        `/permissions/user/${userId}`
      );

      setUserPermissions(response.data.permissions || []);
    } catch (err) {
      console.error("User permissions error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load user permissions."
      );
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleUserChange = async (e) => {
    const userId = e.target.value;

    setSelectedUser(userId);
    await fetchUserPermissions(userId);
  };

  const handleGrant = async (permissionId) => {
    try {
      setProcessingPermission(permissionId);
      setError("");

      await api.post(`/permissions/user/${selectedUser}`, {
        permission_id: permissionId,
      });

      await fetchUserPermissions(selectedUser);
    } catch (err) {
      console.error("Grant permission error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to grant permission."
      );
    } finally {
      setProcessingPermission(null);
    }
  };

  const handleRevoke = async (permissionId) => {
    try {
      setProcessingPermission(permissionId);
      setError("");

      await api.delete(
        `/permissions/user/${selectedUser}/${permissionId}`
      );

      await fetchUserPermissions(selectedUser);
    } catch (err) {
      console.error("Revoke permission error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to revoke permission."
      );
    } finally {
      setProcessingPermission(null);
    }
  };

  const hasPermission = (permissionId) => {
    return userPermissions.some(
      (permission) =>
        permission.permission_id === permissionId
    );
  };

  const selectedUserData = users.find(
    (user) => String(user.user_id) === String(selectedUser)
  );

  const grantedCount = permissions.filter((permission) =>
    hasPermission(permission.permission_id)
  ).length;

  const availableCount = permissions.length - grantedCount;

  const getInitials = (username) => {
    if (!username) return "U";

    return username
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="permissions-loading">
        <div className="permissions-loading-spinner"></div>
        <h2>Loading permissions</h2>
        <p>Preparing access control data...</p>
      </div>
    );
  }

  return (
    <div className="permissions-page">

      {/* PAGE HEADER */}
      <div className="permissions-page-header">
        <div>
          <div className="permissions-breadcrumb">
            API GATEWAY / SECURITY / ACCESS CONTROL
          </div>

          <h1>Permissions</h1>

          <p>
            Manage user permissions and control access across
            the API Gateway.
          </p>
        </div>

        <div className="permissions-header-status">
          <span className="permissions-online-dot"></span>
          Access Control Online
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="permissions-error">
          <div className="permissions-error-icon">!</div>

          <div>
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* TOP SUMMARY */}
      <div className="permissions-summary">

        <div className="permission-summary-card">
          <div className="permission-summary-icon blue">
            ◈
          </div>

          <div>
            <span>Total Permissions</span>
            <strong>{permissions.length}</strong>
            <small>Available access controls</small>
          </div>
        </div>

        <div className="permission-summary-card">
          <div className="permission-summary-icon green">
            ✓
          </div>

          <div>
            <span>Granted</span>
            <strong>{selectedUser ? grantedCount : "—"}</strong>
            <small>
              {selectedUser
                ? "Permissions assigned"
                : "Select a user first"}
            </small>
          </div>
        </div>

        <div className="permission-summary-card">
          <div className="permission-summary-icon orange">
            ○
          </div>

          <div>
            <span>Not Granted</span>
            <strong>{selectedUser ? availableCount : "—"}</strong>
            <small>
              {selectedUser
                ? "Permissions available"
                : "Waiting for selection"}
            </small>
          </div>
        </div>

        <div className="permission-summary-card">
          <div className="permission-summary-icon purple">
            👥
          </div>

          <div>
            <span>Users</span>
            <strong>{users.length}</strong>
            <small>Registered gateway users</small>
          </div>
        </div>

      </div>

      {/* USER SELECTOR */}
      <section className="permission-selector-card">

        <div className="permission-section-heading">
          <div>
            <span className="section-eyebrow">
              ACCESS PRINCIPAL
            </span>

            <h2>Select User</h2>

            <p>
              Choose a user to view and manage their
              permissions.
            </p>
          </div>

          <div className="selector-step">
            <span>01</span>
            USER
          </div>
        </div>

        <div className="permission-user-selector">

          <div className="selector-user-icon">
            👤
          </div>

          <div className="selector-input-area">
            <label htmlFor="permission-user">
              User Account
            </label>

            <select
              id="permission-user"
              value={selectedUser}
              onChange={handleUserChange}
            >
              <option value="">
                -- Select a user --
              </option>

              {users.map((user) => (
                <option
                  key={user.user_id}
                  value={user.user_id}
                >
                  {user.username} — {user.role_name}
                </option>
              ))}
            </select>
          </div>

          {selectedUserData && (
            <div className="selected-user-preview">

              <div className="selected-user-avatar">
                {getInitials(selectedUserData.username)}
              </div>

              <div>
                <strong>
                  {selectedUserData.username}
                </strong>

                <span>
                  {selectedUserData.email}
                </span>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* PERMISSIONS */}
      {!selectedUser ? (
        <section className="permissions-empty-state">

          <div className="permissions-empty-icon">
            ◈
          </div>

          <h2>Select a user to continue</h2>

          <p>
            Choose a user from the selector above to view
            their current permissions and manage access.
          </p>

          <div className="empty-state-hint">
            <span>01</span>
            Select User
            <span className="hint-arrow">→</span>
            <span>02</span>
            Manage Permissions
          </div>

        </section>
      ) : loadingPermissions ? (
        <section className="permissions-loading-card">

          <div className="permissions-loading-spinner"></div>

          <h2>Loading user permissions</h2>

          <p>
            Checking access configuration for{" "}
            <strong>
              {selectedUserData?.username}
            </strong>
            ...
          </p>

        </section>
      ) : (
        <section className="permissions-table-card">

          {/* TABLE HEADER */}
          <div className="permissions-table-header">

            <div>
              <span className="section-eyebrow">
                ACCESS CONTROL
              </span>

              <h2>Permission Registry</h2>

              <p>
                Review and manage permissions assigned to
                this user.
              </p>
            </div>

            <div className="permission-user-badge">

              <div className="permission-badge-avatar">
                {getInitials(selectedUserData?.username)}
              </div>

              <div>
                <span>MANAGING ACCESS FOR</span>
                <strong>
                  {selectedUserData?.username}
                </strong>
              </div>

            </div>

          </div>

          {/* TABLE */}
          <div className="permissions-table-wrapper">

            <table className="professional-permissions-table">

              <thead>
                <tr>
                  <th>PERMISSION</th>
                  <th>DESCRIPTION</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>

                {permissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="permissions-no-data"
                    >
                      No permissions available.
                    </td>
                  </tr>
                ) : (
                  permissions.map(
                    (permission, index) => {
                      const granted = hasPermission(
                        permission.permission_id
                      );

                      const processing =
                        processingPermission ===
                        permission.permission_id;

                      return (
                        <tr
                          key={permission.permission_id}
                          style={{
                            animationDelay: `${index * 0.06}s`,
                          }}
                        >

                          <td>
                            <div className="permission-name-cell">

                              <div
                                className={
                                  granted
                                    ? "permission-symbol granted"
                                    : "permission-symbol"
                                }
                              >
                                {granted ? "✓" : "◈"}
                              </div>

                              <div>
                                <strong>
                                  {
                                    permission.permission_name
                                  }
                                </strong>

                                <span>
                                  Permission #
                                  {
                                    permission.permission_id
                                  }
                                </span>
                              </div>

                            </div>
                          </td>

                          <td>
                            <div className="permission-description">
                              {permission.description ||
                                "No description available."}
                            </div>
                          </td>

                          <td>
                            {granted ? (
                              <span className="permission-status granted">
                                <span></span>
                                Granted
                              </span>
                            ) : (
                              <span className="permission-status not-granted">
                                <span></span>
                                Not Granted
                              </span>
                            )}
                          </td>

                          <td>
                            {granted ? (
                              <button
                                className="permission-action revoke"
                                onClick={() =>
                                  handleRevoke(
                                    permission.permission_id
                                  )
                                }
                                disabled={processing}
                              >
                                {processing ? (
                                  <>
                                    <span className="mini-spinner"></span>
                                    Processing
                                  </>
                                ) : (
                                  <>
                                    Revoke
                                    <span>×</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                className="permission-action grant"
                                onClick={() =>
                                  handleGrant(
                                    permission.permission_id
                                  )
                                }
                                disabled={processing}
                              >
                                {processing ? (
                                  <>
                                    <span className="mini-spinner"></span>
                                    Processing
                                  </>
                                ) : (
                                  <>
                                    Grant
                                    <span>→</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* FOOTER */}
          <div className="permissions-table-footer">

            <span>
              Showing{" "}
              <strong>{permissions.length}</strong>{" "}
              permissions
            </span>

            <span className="permissions-footer-status">
              <span></span>
              Access control synchronized
            </span>

          </div>

        </section>
      )}

    </div>
  );
}

export default Permissions;