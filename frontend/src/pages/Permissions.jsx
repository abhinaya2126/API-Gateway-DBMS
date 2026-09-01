import { useEffect, useState } from "react";
import api from "../services/api";

function Permissions() {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);

  const [selectedUser, setSelectedUser] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [error, setError] = useState("");

  // Load users and all available permissions
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
        setError("Unable to load permission data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

 const handleGrant = async (permissionId) => {
  try {
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
  }
};

const handleRevoke = async (permissionId) => {
  try {
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
  }
};

  // Load permissions for selected user
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
      setError("Unable to load user permissions.");
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleUserChange = async (e) => {
    const userId = e.target.value;

    setSelectedUser(userId);

    await fetchUserPermissions(userId);
  };

  // Check whether permission is already granted
  const hasPermission = (permissionId) => {
    return userPermissions.some(
      (permission) =>
        permission.permission_id === permissionId
    );
  };

  if (loading) {
    return <h2>Loading permissions...</h2>;
  }

  return (
    <div>
      <h1>Permissions</h1>

      <p>
        Manage user permissions and access control.
      </p>

      {error && <p>{error}</p>}

      {/* Select user */}
      <div className="form-card">
        <label>Select User</label>
        <br />

        <select
          value={selectedUser}
          onChange={handleUserChange}
        >
          <option value="">
            -- Select User --
          </option>

          {users.map((user) => (
            <option
              key={user.user_id}
              value={user.user_id}
            >
              {user.username} ({user.role_name})
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <>
          {loadingPermissions ? (
            <h3>Loading user permissions...</h3>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Permission</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {permissions.map((permission) => {
                    const granted = hasPermission(
                      permission.permission_id
                    );

                    return (
                      <tr key={permission.permission_id}>
                        <td>
                          {permission.permission_id}
                        </td>

                        <td>
                          {permission.permission_name}
                        </td>

                        <td>
                          {permission.description}
                        </td>

                        <td>
                          {granted
                            ? "Granted"
                            : "Not Granted"}
                        </td>

                        <td>
                          {granted ? (
                            <button
                              onClick={() =>
                                handleRevoke(
                                  permission.permission_id
                                )
                              }
                            >
                              Revoke
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleGrant(
                                  permission.permission_id
                                )
                              }
                            >
                              Grant
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Permissions;