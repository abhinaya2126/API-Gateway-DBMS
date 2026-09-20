import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function APIs() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [creating, setCreating] = useState(false);

  const [apiName, setApiName] = useState("");
  const [description, setDescription] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [rateLimit, setRateLimit] = useState("60");
  const [ownerId, setOwnerId] = useState("");

  const fetchApis = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/apis");

      setApis(response.data.apis || []);
    } catch (err) {
      console.error("APIs error:", err);
      setError("Unable to load APIs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchApis);
  }, []);

  const handleCreateApi = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);
      setError("");

      await api.post("/apis", {
        api_name: apiName,
        description,
        base_url: baseUrl || null,
        rate_limit_per_min: rateLimit ? Number(rateLimit) : null,
        owner_id: Number(ownerId),
      });

      setApiName("");
      setDescription("");
      setBaseUrl("");
      setRateLimit("60");
      setOwnerId("");
      setShowForm(false);

      await fetchApis();
    } catch (err) {
      console.error("Create API error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create API."
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredApis = useMemo(() => {
    return apis.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        item.api_name?.toLowerCase().includes(searchText) ||
        item.description?.toLowerCase().includes(searchText) ||
        item.owner_username?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.is_active) ||
        (statusFilter === "inactive" && !item.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [apis, search, statusFilter]);

  const activeCount = apis.filter(
    (item) => item.is_active
  ).length;

  const inactiveCount = apis.length - activeCount;

  if (loading) {
    return (
      <div className="apis-loading">
        <div className="apis-loading-spinner"></div>
        <span>Loading API registry...</span>
      </div>
    );
  }

  return (
    <div className="apis-page">

      {/* ================= HEADER ================= */}

      <section className="apis-header">

        <div>
          <div className="apis-breadcrumb">
            API GATEWAY <span>/</span> API MANAGEMENT
          </div>

          <h1>APIs</h1>

          <p>
            Register, monitor and manage your gateway APIs.
          </p>
        </div>

        <button
          className="register-api-button"
          onClick={() => {
            setShowForm((previous) => !previous);
            setError("");
          }}
        >
          <span className="register-plus">
            {showForm ? "×" : "+"}
          </span>

          {showForm ? "Close" : "Register API"}
        </button>

      </section>


      {/* ================= SUMMARY ================= */}

      <section className="api-summary">

        <div className="api-summary-card">
          <div className="summary-icon">
            ◈
          </div>

          <div>
            <span>Total APIs</span>
            <strong>{apis.length}</strong>
          </div>
        </div>


        <div className="api-summary-card">
          <div className="summary-icon summary-active">
            ✓
          </div>

          <div>
            <span>Active APIs</span>
            <strong>{activeCount}</strong>
          </div>
        </div>


        <div className="api-summary-card">
          <div className="summary-icon summary-inactive">
            ○
          </div>

          <div>
            <span>Inactive APIs</span>
            <strong>{inactiveCount}</strong>
          </div>
        </div>

      </section>


      {/* ================= CREATE FORM ================= */}

      {showForm && (
        <section className="api-create-panel">

          <div className="api-create-header">

            <div>
              <span>API REGISTRY</span>
              <h2>Register New API</h2>
              <p>
                Add a new API to your gateway infrastructure.
              </p>
            </div>

            <button
              type="button"
              className="form-close-button"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>

          </div>


          <form
            className="api-create-form"
            onSubmit={handleCreateApi}
          >

            <div className="api-form-field">
              <label htmlFor="base-url">Service Base URL</label>
              <input
                id="base-url"
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:6001"
              />
            </div>

            <div className="api-form-field">
              <label htmlFor="rate-limit">Requests per minute</label>
              <input
                id="rate-limit"
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                min="1"
              />
            </div>

            <div className="api-form-field">
              <label htmlFor="api-name">
                API Name
              </label>

              <input
                id="api-name"
                type="text"
                value={apiName}
                onChange={(e) =>
                  setApiName(e.target.value)
                }
                placeholder="e.g. User Management API"
                required
              />
            </div>


            <div className="api-form-field api-description-field">
              <label htmlFor="api-description">
                Description
              </label>

              <textarea
                id="api-description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe what this API does..."
                rows="3"
                required
              />
            </div>


            <div className="api-form-field">
              <label htmlFor="owner-id">
                Owner ID
              </label>

              <input
                id="owner-id"
                type="number"
                value={ownerId}
                onChange={(e) =>
                  setOwnerId(e.target.value)
                }
                placeholder="User ID"
                min="1"
                required
              />
            </div>


            <div className="api-form-actions">

              <button
                type="button"
                className="api-cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="api-create-button"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <span className="button-spinner"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    Create API
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
        <div className="apis-error">
          <span>!</span>
          <div>{error}</div>
        </div>
      )}


      {/* ================= TOOLBAR ================= */}

      <section className="apis-toolbar">

        <div className="api-search">

          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search APIs, descriptions or owners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}

        </div>


        <div className="api-filter">

          <span>STATUS</span>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">
              All APIs
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

        </div>

      </section>


      {/* ================= TABLE ================= */}

      {apis.length === 0 ? (

        <div className="apis-empty">
          <div className="empty-icon">
            ◈
          </div>

          <h3>No APIs registered</h3>

          <p>
            Register your first API to start managing
            your gateway infrastructure.
          </p>

          <button
            onClick={() => setShowForm(true)}
          >
            Register API →
          </button>
        </div>

      ) : filteredApis.length === 0 ? (

        <div className="apis-empty">
          <div className="empty-icon">
            ⌕
          </div>

          <h3>No matching APIs</h3>

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

        <section className="api-table-card">

          <div className="api-table-header">

            <div>
              <span>API REGISTRY</span>
              <h2>Registered APIs</h2>
            </div>

            <div className="api-count">
              Showing <strong>{filteredApis.length}</strong>{" "}
              of <strong>{apis.length}</strong>
            </div>

          </div>


          <div className="api-table-wrapper">

            <table className="professional-api-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>API</th>
                  <th>Description</th>
                  <th>Owner</th>
                  <th>Status</th>
                </tr>
              </thead>


              <tbody>

                {filteredApis.map((item, index) => {

                  const ownerInitial =
                    item.owner_username
                      ?.charAt(0)
                      ?.toUpperCase() || "U";

                  return (
                    <tr
                      key={item.api_id}
                      style={{
                        animationDelay: `${index * 0.06}s`,
                      }}
                    >

                      <td>
                        <span className="api-id">
                          #{String(item.api_id).padStart(2, "0")}
                        </span>
                      </td>


                      <td>
                        <div className="api-name-cell">

                          <div className="api-name-icon">
                            ◈
                          </div>

                          <div>
                            <strong>
                              {item.api_name}
                            </strong>

                            <span>
                              API Gateway Service
                            </span>
                          </div>

                        </div>
                      </td>


                      <td>
                        <span className="api-description">
                          {item.description}
                        </span>
                      </td>


                      <td>
                        <div className="api-owner">

                          <div className="owner-avatar">
                            {ownerInitial}
                          </div>

                          <span>
                            {item.owner_username}
                          </span>

                        </div>
                      </td>


                      <td>
                        <span
                          className={
                            item.is_active
                              ? "api-status active"
                              : "api-status inactive"
                          }
                        >
                          <span></span>

                          {item.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>


          <div className="api-table-footer">

            <span>
              API registry synchronized with gateway
            </span>

            <span className="registry-live">
              <span></span>
              LIVE
            </span>

          </div>

        </section>
      )}

    </div>
  );
}

export default APIs;