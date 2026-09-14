import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function Versions() {
  const [apis, setApis] = useState([]);
  const [versions, setVersions] = useState([]);

  const [selectedApi, setSelectedApi] = useState("");
  const [versionNumber, setVersionNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchApis = async () => {
    try {
      const response = await api.get("/apis");
      setApis(response.data.apis || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load APIs."
      );
    }
  };

  const fetchVersions = async (apiId) => {
    if (!apiId) {
      setVersions([]);
      return;
    }

    try {
      setVersionsLoading(true);
      setError("");

      const response = await api.get(
        `/versions/api/${apiId}`
      );

      setVersions(response.data.versions || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load versions."
      );
    } finally {
      setVersionsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchApis();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleApiChange = async (e) => {
    const apiId = e.target.value;

    setSelectedApi(apiId);
    setVersionNumber("");
    setShowCreateForm(false);
    setError("");

    await fetchVersions(apiId);
  };

  const handleCreateVersion = async (e) => {
    e.preventDefault();

    if (!selectedApi) return;

    try {
      setCreating(true);
      setError("");

      await api.post(
        `/versions/api/${selectedApi}`,
        {
          version_number: versionNumber,
        }
      );

      setVersionNumber("");
      setShowCreateForm(false);

      await fetchVersions(selectedApi);
    } catch (err) {
      console.error(
        "Create version error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create version."
      );
    } finally {
      setCreating(false);
    }
  };

  const selectedApiData = useMemo(() => {
    return apis.find(
      (item) =>
        String(item.api_id) ===
        String(selectedApi)
    );
  }, [apis, selectedApi]);

  const activeVersions = versions.filter(
    (version) => version.is_active
  ).length;

  const inactiveVersions =
    versions.length - activeVersions;

  if (loading) {
    return (
      <div className="versions-loading">
        <div className="versions-spinner"></div>
        <span>Loading version control...</span>
      </div>
    );
  }

  return (
    <div className="versions-page">

      {/* =================================================
          PAGE HEADER
          ================================================= */}

      <section className="versions-header">

        <div>

          <div className="versions-breadcrumb">
            API GATEWAY
            <span>/</span>
            DEVELOPMENT
            <span>/</span>
            VERSION CONTROL
          </div>

          <h1>API Versions</h1>

          <p>
            Manage and control versions across your
            registered API services.
          </p>

        </div>

      </section>


      {/* =================================================
          API SELECTOR
          ================================================= */}

      <section className="version-selector-card">

        <div className="version-selector-icon">
          ◇
        </div>

        <div className="version-selector-content">

          <label htmlFor="version-api">
            SELECT API
          </label>

          <h2>
            Choose an API to manage
          </h2>

          <p>
            Select a registered API to view and create
            its available versions.
          </p>

          <select
            id="version-api"
            value={selectedApi}
            onChange={handleApiChange}
          >
            <option value="">
              Select an API...
            </option>

            {apis.map((item) => (
              <option
                key={item.api_id}
                value={item.api_id}
              >
                {item.api_name}
              </option>
            ))}

          </select>

        </div>

        {selectedApiData && (
          <div className="selected-api-badge">

            <span className="selected-api-dot"></span>

            <div>
              <small>SELECTED</small>
              <strong>
                {selectedApiData.api_name}
              </strong>
            </div>

          </div>
        )}

      </section>


      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div className="versions-error">
          <span>!</span>
          <div>{error}</div>
        </div>
      )}


      {/* =================================================
          EMPTY INITIAL STATE
          ================================================= */}

      {!selectedApi && !error && (

        <section className="versions-empty">

          <div className="versions-empty-icon">
            ◇
          </div>

          <h2>
            Select an API
          </h2>

          <p>
            Choose an API from the selector above to
            view its version history and management
            options.
          </p>

        </section>

      )}


      {/* =================================================
          SELECTED API CONTENT
          ================================================= */}

      {selectedApi && (

        <div className="versions-content">


          {/* =============================================
              API INFORMATION
              ============================================= */}

          <section className="selected-api-header">

            <div>

              <span className="selected-api-label">
                MANAGED API
              </span>

              <h2>
                {selectedApiData?.api_name ||
                  "Selected API"}
              </h2>

              <p>
                {selectedApiData?.description ||
                  "API version management"}
              </p>

            </div>

            <button
              className="create-version-button"
              onClick={() =>
                setShowCreateForm(
                  (previous) => !previous
                )
              }
            >
              <span>
                {showCreateForm ? "×" : "+"}
              </span>

              {showCreateForm
                ? "Close"
                : "Create Version"}
            </button>

          </section>


          {/* =============================================
              SUMMARY
              ============================================= */}

          <section className="versions-summary">

            <div className="version-summary-card">

              <div className="version-summary-icon">
                ◇
              </div>

              <div>
                <span>Total Versions</span>
                <strong>
                  {versions.length}
                </strong>
              </div>

            </div>


            <div className="version-summary-card">

              <div className="version-summary-icon active">
                ✓
              </div>

              <div>
                <span>Active Versions</span>
                <strong>
                  {activeVersions}
                </strong>
              </div>

            </div>


            <div className="version-summary-card">

              <div className="version-summary-icon inactive">
                ○
              </div>

              <div>
                <span>Inactive Versions</span>
                <strong>
                  {inactiveVersions}
                </strong>
              </div>

            </div>

          </section>


          {/* =============================================
              CREATE FORM
              ============================================= */}

          {showCreateForm && (

            <section className="create-version-panel">

              <div className="create-version-heading">

                <div>

                  <span>
                    VERSION CONTROL
                  </span>

                  <h2>
                    Create New Version
                  </h2>

                  <p>
                    Add a new version to this API.
                  </p>

                </div>

                <button
                  type="button"
                  className="version-close-button"
                  onClick={() =>
                    setShowCreateForm(false)
                  }
                >
                  ×
                </button>

              </div>


              <form
                className="create-version-form"
                onSubmit={handleCreateVersion}
              >

                <div className="version-field">

                  <label htmlFor="version-number">
                    Version Number
                  </label>

                  <input
                    id="version-number"
                    type="text"
                    value={versionNumber}
                    onChange={(e) =>
                      setVersionNumber(
                        e.target.value
                      )
                    }
                    placeholder="Example: v2"
                    required
                  />

                  <span>
                    Use a clear version identifier such
                    as v1, v2 or v1.1.
                  </span>

                </div>


                <div className="version-form-actions">

                  <button
                    type="button"
                    className="version-cancel-button"
                    onClick={() =>
                      setShowCreateForm(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="version-submit-button"
                    disabled={creating}
                  >

                    {creating ? (
                      <>
                        <span className="version-button-spinner"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Version
                        <span>→</span>
                      </>
                    )}

                  </button>

                </div>

              </form>

            </section>

          )}


          {/* =============================================
              VERSION TABLE
              ============================================= */}

          <section className="versions-table-card">

            <div className="versions-table-heading">

              <div>

                <span>
                  VERSION REGISTRY
                </span>

                <h2>
                  Available Versions
                </h2>

              </div>

              <div className="version-count">

                {versions.length === 1
                  ? "1 version"
                  : `${versions.length} versions`}

              </div>

            </div>


            {versionsLoading ? (

              <div className="versions-table-loading">

                <div className="versions-small-spinner"></div>

                <span>
                  Loading versions...
                </span>

              </div>

            ) : versions.length === 0 ? (

              <div className="version-no-results">

                <div className="version-no-results-icon">
                  ◇
                </div>

                <h3>
                  No versions registered
                </h3>

                <p>
                  This API does not have any versions
                  yet. Create the first version to begin
                  managing its lifecycle.
                </p>

                <button
                  onClick={() =>
                    setShowCreateForm(true)
                  }
                >
                  Create First Version →
                </button>

              </div>

            ) : (

              <div className="versions-table-wrapper">

                <table className="professional-versions-table">

                  <thead>

                    <tr>
                      <th>ID</th>
                      <th>VERSION</th>
                      <th>STATUS</th>
                      <th>API</th>
                    </tr>

                  </thead>

                  <tbody>

                    {versions.map(
                      (version, index) => (

                        <tr
                          key={version.version_id}
                          style={{
                            animationDelay:
                              `${index * 0.07}s`,
                          }}
                        >

                          <td>

                            <span className="version-id">
                              #
                              {String(
                                version.version_id
                              ).padStart(2, "0")}
                            </span>

                          </td>


                          <td>

                            <div className="version-number-cell">

                              <div className="version-number-icon">
                                V
                              </div>

                              <div>

                                <strong>
                                  {version.version_number}
                                </strong>

                                <span>
                                  API release version
                                </span>

                              </div>

                            </div>

                          </td>


                          <td>

                            <span
                              className={
                                version.is_active
                                  ? "version-status active"
                                  : "version-status inactive"
                              }
                            >

                              <span></span>

                              {version.is_active
                                ? "Active"
                                : "Inactive"}

                            </span>

                          </td>


                          <td>

                            <span className="version-api-name">
                              {selectedApiData?.api_name ||
                                "Selected API"}
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}


            {versions.length > 0 && (
              <div className="versions-table-footer">

                <span>
                  Version registry synchronized
                  with API Gateway
                </span>

                <span className="version-system-status">

                  <span></span>

                  VERSION CONTROL ONLINE

                </span>

              </div>
            )}

          </section>

        </div>
      )}

    </div>
  );
}

export default Versions;