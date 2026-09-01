import { useEffect, useState } from "react";
import api from "../services/api";

function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [userId, setUserId] = useState("");
  const [keyName, setKeyName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // --------------------------------------------------
  // Fetch API Keys
  // --------------------------------------------------
  const fetchKeys = async () => {
    try {
      setError("");

      const response = await api.get("/keys");

      setKeys(response.data.keys || []);
    } catch (err) {
      console.error("API keys error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load API keys."
      );
    }
  };

  // --------------------------------------------------
  // Fetch Users
  // --------------------------------------------------
  const fetchUsers = async () => {
  try {
    const response = await api.get("/users");

    console.log("USERS RESPONSE:", response.data);

    setUsers(response.data.users || []);
  } catch (err) {
    console.error("USERS ERROR:", err);
    console.error("STATUS:", err.response?.status);
    console.error("RESPONSE:", err.response?.data);

    setError(
      err.response?.data?.message ||
      "Unable to load users."
    );
  }
};

  // --------------------------------------------------
  // Load initial data
  // --------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        await Promise.all([
          fetchKeys(),
          fetchUsers(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --------------------------------------------------
  // Create API Key
  // --------------------------------------------------
  const handleCreateKey = async (e) => {
    e.preventDefault();

    try {
      setError("");

      await api.post("/keys", {
        user_id: Number(userId),
        key_name: keyName,
        expires_at: expiresAt || null,
      });

      setUserId("");
      setKeyName("");
      setExpiresAt("");

      setShowForm(false);

      await fetchKeys();
    } catch (err) {
      console.error("Create API key error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to create API key."
      );
    }
  };

  // --------------------------------------------------
  // Revoke API Key
  // --------------------------------------------------
  const handleRevokeKey = async (keyId) => {
    try {
      setError("");

      await api.put(`/keys/${keyId}/revoke`);

      await fetchKeys();
    } catch (err) {
      console.error("Revoke API key error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to revoke API key."
      );
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------
  if (loading) {
    return <h2>Loading API keys...</h2>;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>API Keys</h1>
          <p>Manage gateway credentials.</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Create API Key"}
        </button>
      </div>

      {/* Error */}
      {error && <p>{error}</p>}

      {/* Create API Key Form */}
      {showForm && (
        <div className="form-card">
          <h2>Create API Key</h2>

          <form onSubmit={handleCreateKey}>
            {/* User */}
            <div>
              <label>User</label>
              <br />

              <select
                value={userId}
                onChange={(e) =>
                  setUserId(e.target.value)
                }
                required
              >
                <option value="">
                  -- Select User --
                </option>

                {users.map((user) => (
                  <option
                    key={user.user_id}
                    value={user.user_id}
                  >
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            <br />

            {/* Key Name */}
            <div>
              <label>Key Name</label>
              <br />

              <input
                type="text"
                value={keyName}
                onChange={(e) =>
                  setKeyName(e.target.value)
                }
                placeholder="Example: priya-testing-key"
                required
              />
            </div>

            <br />

            {/* Expiry */}
            <div>
              <label>Expires At</label>
              <br />

              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) =>
                  setExpiresAt(e.target.value)
                }
              />
            </div>

            <br />

            <button type="submit">
              Create API Key
            </button>
          </form>
        </div>
      )}

      {/* No Keys */}
      {!error && keys.length === 0 && (
        <p>No API keys found.</p>
      )}

      {/* API Keys Table */}
      {keys.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Key Name</th>
                <th>API Key</th>
                <th>Status</th>
                <th>Created</th>
                <th>Expires</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {keys.map((key) => (
                <tr key={key.key_id}>
                  <td>{key.key_id}</td>

                  <td>{key.username}</td>

                  <td>{key.key_name}</td>

                  <td>
                    <code>{key.api_key}</code>
                  </td>

                  <td>
                    {key.is_active
                      ? "Active"
                      : "Inactive"}
                  </td>

                  <td>
                    {new Date(
                      key.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {key.expires_at
                      ? new Date(
                          key.expires_at
                        ).toLocaleDateString()
                      : "Never"}
                  </td>

                  <td>
                    {key.is_active ? (
                      <button
                        onClick={() =>
                          handleRevokeKey(
                            key.key_id
                          )
                        }
                      >
                        Revoke
                      </button>
                    ) : (
                      "Revoked"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ApiKeys;