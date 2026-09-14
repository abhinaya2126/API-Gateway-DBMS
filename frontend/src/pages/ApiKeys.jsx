import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [userId, setUserId] = useState("");
  const [keyName, setKeyName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibleKeys, setVisibleKeys] = useState({});
  const [revokingId, setRevokingId] = useState(null);

  const fetchKeys = async () => {
    try {
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

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data.users || []);
    } catch (err) {
      console.error("Users error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load users."
      );
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

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

  const handleCreateKey = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);
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
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to revoke this API key?"
    );

    if (!confirmed) return;

    try {
      setRevokingId(keyId);
      setError("");

      await api.put(`/keys/${keyId}/revoke`);

      await fetchKeys();
    } catch (err) {
      console.error("Revoke API key error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to revoke API key."
      );
    } finally {
      setRevokingId(null);
    }
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys((previous) => ({
      ...previous,
      [keyId]: !previous[keyId],
    }));
  };

  const activeCount = keys.filter(
    (key) => key.is_active
  ).length;

  const revokedCount = keys.length - activeCount;

  const filteredKeys = useMemo(() => {
    return keys.filter((key) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        key.username?.toLowerCase().includes(searchText) ||
        key.key_name?.toLowerCase().includes(searchText) ||
        key.api_key?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && key.is_active) ||
        (statusFilter === "revoked" && !key.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [keys, search, statusFilter]);

  const maskApiKey = (apiKey) => {
    if (!apiKey) return "••••••••••••••••";

    if (apiKey.length <= 12) {
      return "••••••••••••";
    }

    return `${apiKey.slice(0, 10)}••••••••${apiKey.slice(-4)}`;
  };

  const formatDate = (date) => {
    if (!date) return "Never";

    return new Date(date).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="keys-loading">
        <div className="keys-loading-spinner"></div>
        <span>Loading credential vault...</span>
      </div>
    );
  }

  return (
    <div className="keys-page">

      {/* ================= HEADER ================= */}

      <section className="keys-header">

        <div>
          <div className="keys-breadcrumb">
            API GATEWAY <span>/</span> SECURITY <span>/</span> API KEYS
          </div>

          <h1>API Keys</h1>

          <p>
            Manage secure credentials used to access your APIs.
          </p>
        </div>

        <button
          className="create-key-button"
          onClick={() => {
            setShowForm((previous) => !previous);
            setError("");
          }}
        >
          <span>
            {showForm ? "×" : "+"}
          </span>

          {showForm
            ? "Close"
            : "Create API Key"}
        </button>

      </section>


      {/* ================= SECURITY NOTICE ================= */}

      <div className="key-security-banner">

        <div className="security-banner-icon">
          ◉
        </div>

        <div>
          <strong>Credential security</strong>

          <p>
            API keys provide direct access to gateway services.
            Keep active credentials private and revoke compromised keys immediately.
          </p>
        </div>

        <span className="security-banner-status">
          SECURE
        </span>

      </div>


      {/* ================= SUMMARY ================= */}

      <section className="keys-summary">

        <div className="keys-summary-card">

          <div className="keys-summary-icon">
            ⚿
          </div>

          <div>
            <span>Total Keys</span>
            <strong>{keys.length}</strong>
          </div>

        </div>


        <div className="keys-summary-card">

          <div className="keys-summary-icon active">
            ✓
          </div>

          <div>
            <span>Active Keys</span>
            <strong>{activeCount}</strong>
          </div>

        </div>


        <div className="keys-summary-card">

          <div className="keys-summary-icon revoked">
            ○
          </div>

          <div>
            <span>Revoked Keys</span>
            <strong>{revokedCount}</strong>
          </div>

        </div>

      </section>


      {/* ================= CREATE FORM ================= */}

      {showForm && (
        <section className="key-create-panel">

          <div className="key-create-heading">

            <div>
              <span>CREDENTIAL VAULT</span>

              <h2>Create API Key</h2>

              <p>
                Generate a credential for an authorized gateway user.
              </p>
            </div>

            <button
              type="button"
              className="key-close-button"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>

          </div>


          <form
            className="key-create-form"
            onSubmit={handleCreateKey}
          >

            <div className="key-field">

              <label htmlFor="key-user">
                User
              </label>

              <select
                id="key-user"
                value={userId}
                onChange={(e) =>
                  setUserId(e.target.value)
                }
                required
              >
                <option value="">
                  Select authorized user
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


            <div className="key-field">

              <label htmlFor="key-name">
                Key Name
              </label>

              <input
                id="key-name"
                type="text"
                value={keyName}
                onChange={(e) =>
                  setKeyName(e.target.value)
                }
                placeholder="e.g. production-service-key"
                required
              />

            </div>


            <div className="key-field">

              <label htmlFor="key-expiry">
                Expiration
              </label>

              <input
                id="key-expiry"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) =>
                  setExpiresAt(e.target.value)
                }
              />

            </div>


            <div className="key-form-actions">

              <button
                type="button"
                className="key-cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="key-submit-button"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <span className="key-button-spinner"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Credential
                    <span>→</span>
                  </>
                )}
              </button>

            </div>

          </form>

        </section>
      )}


      {/* ================= ERROR ================= */}

      {error && (
        <div className="keys-error">
          <span>!</span>
          <div>{error}</div>
        </div>
      )}


      {/* ================= TOOLBAR ================= */}

      <section className="keys-toolbar">

        <div className="key-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search keys, users or credentials..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}

        </div>


        <div className="key-filter">

          <label>
            STATUS
          </label>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">
              All Keys
            </option>

            <option value="active">
              Active
            </option>

            <option value="revoked">
              Revoked
            </option>
          </select>

        </div>

      </section>


      {/* ================= TABLE ================= */}

      {keys.length === 0 ? (

        <div className="keys-empty">

          <div className="keys-empty-icon">
            ⚿
          </div>

          <h3>No API keys found</h3>

          <p>
            Create your first gateway credential to start
            securing API access.
          </p>

          <button
            onClick={() => setShowForm(true)}
          >
            Create API Key →
          </button>

        </div>

      ) : filteredKeys.length === 0 ? (

        <div className="keys-empty">

          <div className="keys-empty-icon">
            ⌕
          </div>

          <h3>No matching credentials</h3>

          <p>
            Try changing your search or status filter.
          </p>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          >
            Clear filters
          </button>

        </div>

      ) : (

        <section className="keys-table-card">

          <div className="keys-table-heading">

            <div>
              <span>CREDENTIAL VAULT</span>

              <h2>Gateway API Keys</h2>
            </div>

            <div className="keys-count">
              Showing <strong>{filteredKeys.length}</strong>{" "}
              of <strong>{keys.length}</strong>
            </div>

          </div>


          <div className="keys-table-wrapper">

            <table className="professional-keys-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>OWNER</th>
                  <th>KEY NAME</th>
                  <th>API KEY</th>
                  <th>STATUS</th>
                  <th>CREATED</th>
                  <th>EXPIRES</th>
                  <th>ACTION</th>
                </tr>

              </thead>


              <tbody>

                {filteredKeys.map((key, index) => {

                  const initial =
                    key.username
                      ?.charAt(0)
                      ?.toUpperCase() || "U";

                  const isVisible =
                    visibleKeys[key.key_id];

                  return (
                    <tr
                      key={key.key_id}
                      style={{
                        animationDelay: `${index * 0.06}s`,
                      }}
                    >

                      <td>
                        <span className="key-id">
                          #{String(key.key_id).padStart(2, "0")}
                        </span>
                      </td>


                      <td>

                        <div className="key-owner">

                          <div className="key-owner-avatar">
                            {initial}
                          </div>

                          <span>
                            {key.username}
                          </span>

                        </div>

                      </td>


                      <td>

                        <div className="key-name-cell">

                          <strong>
                            {key.key_name}
                          </strong>

                          <span>
                            Gateway credential
                          </span>

                        </div>

                      </td>


                      <td>

                        <div className="credential-cell">

                          <code>
                            {isVisible
                              ? key.api_key
                              : maskApiKey(key.api_key)}
                          </code>

                          <button
                            type="button"
                            className="key-view-button"
                            onClick={() =>
                              toggleKeyVisibility(
                                key.key_id
                              )
                            }
                          >
                            {isVisible
                              ? "Hide"
                              : "Show"}
                          </button>

                        </div>

                      </td>


                      <td>

                        <span
                          className={
                            key.is_active
                              ? "credential-status active"
                              : "credential-status revoked"
                          }
                        >
                          <span></span>

                          {key.is_active
                            ? "Active"
                            : "Revoked"}
                        </span>

                      </td>


                      <td>
                        <span className="key-date">
                          {formatDate(key.created_at)}
                        </span>
                      </td>


                      <td>

                        <span
                          className={
                            key.expires_at
                              ? "key-date"
                              : "key-never"
                          }
                        >
                          {formatDate(key.expires_at)}
                        </span>

                      </td>


                      <td>

                        {key.is_active ? (

                          <button
                            className="key-revoke-button"
                            disabled={
                              revokingId === key.key_id
                            }
                            onClick={() =>
                              handleRevokeKey(
                                key.key_id
                              )
                            }
                          >
                            {revokingId === key.key_id
                              ? "Revoking..."
                              : "Revoke"}
                          </button>

                        ) : (

                          <span className="revoked-label">
                            Revoked
                          </span>

                        )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>


          <div className="keys-table-footer">

            <span>
              Credentials synchronized with API Gateway
            </span>

            <span className="vault-live">
              <span></span>
              VAULT ONLINE
            </span>

          </div>

        </section>

      )}

    </div>
  );
}

export default ApiKeys;