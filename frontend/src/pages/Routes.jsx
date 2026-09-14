import { useEffect, useState } from "react";
import api from "../services/api";

function RoutesPage() {
  const [apis, setApis] = useState([]);
  const [versions, setVersions] = useState([]);
  const [routes, setRoutes] = useState([]);

  const [selectedApi, setSelectedApi] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");

  const [path, setPath] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");

  const [loading, setLoading] = useState(true);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ==============================
  // LOAD APIS
  // ==============================

  useEffect(() => {
    const fetchApis = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/apis");

        setApis(response.data.apis || []);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Unable to load APIs."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApis();
  }, []);

  // ==============================
  // LOAD VERSIONS
  // ==============================

  const handleApiChange = async (e) => {
    const apiId = e.target.value;

    setSelectedApi(apiId);
    setSelectedVersion("");

    setVersions([]);
    setRoutes([]);

    setShowCreateForm(false);
    setError("");

    if (!apiId) return;

    try {
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
    }
  };

  // ==============================
  // LOAD ROUTES
  // ==============================

  const handleVersionChange = async (e) => {
    const versionId = e.target.value;

    setSelectedVersion(versionId);
    setRoutes([]);

    setShowCreateForm(false);
    setError("");

    if (!versionId) return;

    try {
      setRoutesLoading(true);

      const response = await api.get(
        `/routes/version/${versionId}`
      );

      setRoutes(response.data.routes || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load routes."
      );
    } finally {
      setRoutesLoading(false);
    }
  };

  // ==============================
  // CREATE ROUTE
  // ==============================

  const handleCreateRoute = async (e) => {
    e.preventDefault();

    if (!selectedVersion) return;

    try {
      setCreating(true);
      setError("");

      await api.post(
        `/routes/version/${selectedVersion}`,
        {
          path,
          http_method: httpMethod,
        }
      );

      setPath("");
      setHttpMethod("GET");

      setShowCreateForm(false);

      const response = await api.get(
        `/routes/version/${selectedVersion}`
      );

      setRoutes(response.data.routes || []);
    } catch (err) {
      console.error("Create route error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create route."
      );
    } finally {
      setCreating(false);
    }
  };

  // ==============================
  // HELPERS
  // ==============================

  const selectedApiData = apis.find(
    (item) =>
      String(item.api_id) ===
      String(selectedApi)
  );

  const selectedVersionData = versions.find(
    (version) =>
      String(version.version_id) ===
      String(selectedVersion)
  );

  const activeRoutes = routes.filter(
    (route) => route.is_active
  ).length;

  const inactiveRoutes =
    routes.length - activeRoutes;

  const getMethodClass = (method) => {
    return `route-method route-${method.toLowerCase()}`;
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="routes-loading">
        <div className="routes-spinner"></div>

        <h3>Loading Route Management</h3>

        <p>
          Connecting to API Gateway...
        </p>
      </div>
    );
  }

  return (
    <div className="routes-page">

      {/* ======================================
          PAGE HEADER
          ====================================== */}

      <div className="routes-page-header">

        <div>

          <div className="routes-breadcrumb">
            API GATEWAY
            <span>/</span>
            ROUTE MANAGEMENT
          </div>

          <h1>API Routes</h1>

          <p>
            Configure and manage HTTP endpoints
            across your API versions.
          </p>

        </div>

        <div className="routes-header-status">

          <span className="routes-online-dot"></span>

          Gateway Online

        </div>

      </div>


      {/* ======================================
          API / VERSION SELECTION
          ====================================== */}

      <div className="route-selector-card">

        <div className="route-selector-header">

          <div className="route-selector-icon">
            ⇄
          </div>

          <div>

            <span className="section-label">
              ROUTE CONFIGURATION
            </span>

            <h2>
              Select API & Version
            </h2>

            <p>
              Choose an API and version to manage
              its registered routes.
            </p>

          </div>

        </div>


        <div className="route-selectors">

          {/* API */}

          <div className="route-select-field">

            <label>
              API
            </label>

            <select
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


          <div className="route-selector-arrow">
            →
          </div>


          {/* VERSION */}

          <div className="route-select-field">

            <label>
              VERSION
            </label>

            <select
              value={selectedVersion}
              onChange={handleVersionChange}
              disabled={!selectedApi}
            >

              <option value="">
                {selectedApi
                  ? "Select a version..."
                  : "Select API first"}
              </option>

              {versions.map((version) => (
                <option
                  key={version.version_id}
                  value={version.version_id}
                >
                  {version.version_number}
                </option>
              ))}

            </select>

          </div>

        </div>


        {/* CURRENT SELECTION */}

        {selectedApiData && (
          <div className="route-selection-status">

            <span className="selection-dot"></span>

            <div>

              <small>
                CURRENT CONFIGURATION
              </small>

              <strong>

                {selectedApiData.api_name}

                {selectedVersionData && (
                  <>
                    {" "}
                    /{" "}
                    {selectedVersionData.version_number}
                  </>
                )}

              </strong>

            </div>

          </div>
        )}

      </div>


      {/* ======================================
          ERROR
          ====================================== */}

      {error && (
        <div className="routes-error">

          <span>!</span>

          <div>
            {error}
          </div>

        </div>
      )}


      {/* ======================================
          NO API SELECTED
          ====================================== */}

      {!selectedApi && !error && (
        <div className="routes-empty">

          <div className="routes-empty-icon">
            ⇄
          </div>

          <h2>
            Select an API to begin
          </h2>

          <p>
            Select an API above to view its available
            versions and configure routes.
          </p>

        </div>
      )}


      {/* ======================================
          API SELECTED
          ====================================== */}

      {selectedApi && !selectedVersion && (
        <div className="routes-empty">

          <div className="routes-empty-icon">
            V
          </div>

          <h2>
            Select an API version
          </h2>

          <p>
            Choose a version of{" "}
            <strong>
              {selectedApiData?.api_name}
            </strong>{" "}
            to manage its routes.
          </p>

        </div>
      )}


      {/* ======================================
          VERSION SELECTED
          ====================================== */}

      {selectedVersion && (
        <div className="routes-content">

          {/* ==================================
              ROUTE HEADER
              ================================== */}

          <div className="selected-route-header">

            <div>

              <span className="section-label">
                ROUTE REGISTRY
              </span>

              <h2>

                {selectedApiData?.api_name}

                <span>
                  {" "}
                  /{" "}
                  {selectedVersionData?.version_number}
                </span>

              </h2>

              <p>
                Manage HTTP endpoints configured
                for this API version.
              </p>

            </div>


            <button
              className="create-route-button"
              onClick={() =>
                setShowCreateForm(
                  !showCreateForm
                )
              }
            >

              <span>
                {showCreateForm ? "×" : "+"}
              </span>

              {showCreateForm
                ? "Close"
                : "Create Route"}

            </button>

          </div>


          {/* ==================================
              STATISTICS
              ================================== */}

          <div className="routes-summary">

            <div className="route-summary-card">

              <div className="route-summary-icon blue">
                ⇄
              </div>

              <div>

                <span>
                  Total Routes
                </span>

                <strong>
                  {routes.length}
                </strong>

              </div>

            </div>


            <div className="route-summary-card">

              <div className="route-summary-icon green">
                ✓
              </div>

              <div>

                <span>
                  Active Routes
                </span>

                <strong>
                  {activeRoutes}
                </strong>

              </div>

            </div>


            <div className="route-summary-card">

              <div className="route-summary-icon gray">
                ○
              </div>

              <div>

                <span>
                  Inactive Routes
                </span>

                <strong>
                  {inactiveRoutes}
                </strong>

              </div>

            </div>

          </div>


          {/* ==================================
              CREATE FORM
              ================================== */}

          {showCreateForm && (
            <div className="create-route-panel">

              <div className="create-route-title">

                <div>

                  <span className="section-label">
                    NEW ENDPOINT
                  </span>

                  <h2>
                    Create Route
                  </h2>

                  <p>
                    Add a new HTTP endpoint to this
                    API version.
                  </p>

                </div>

                <button
                  className="route-close-button"
                  onClick={() =>
                    setShowCreateForm(false)
                  }
                >
                  ×
                </button>

              </div>


              <form
                className="create-route-form"
                onSubmit={handleCreateRoute}
              >

                <div className="route-field">

                  <label>
                    Endpoint Path
                  </label>

                  <input
                    type="text"
                    value={path}
                    onChange={(e) =>
                      setPath(e.target.value)
                    }
                    placeholder="/products"
                    required
                  />

                  <small>
                    Example: /users,
                    /products/:id,
                    /orders
                  </small>

                </div>


                <div className="route-field">

                  <label>
                    HTTP Method
                  </label>

                  <select
                    value={httpMethod}
                    onChange={(e) =>
                      setHttpMethod(
                        e.target.value
                      )
                    }
                  >

                    <option value="GET">
                      GET
                    </option>

                    <option value="POST">
                      POST
                    </option>

                    <option value="PUT">
                      PUT
                    </option>

                    <option value="DELETE">
                      DELETE
                    </option>

                    <option value="PATCH">
                      PATCH
                    </option>

                  </select>

                </div>


                <div className="route-form-actions">

                  <button
                    type="button"
                    className="route-cancel-button"
                    onClick={() =>
                      setShowCreateForm(false)
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="route-submit-button"
                    disabled={creating}
                  >

                    {creating ? (
                      <>
                        <span className="route-button-spinner"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Route
                        <span>→</span>
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>
          )}


          {/* ==================================
              ROUTE TABLE
              ================================== */}

          <div className="routes-table-card">

            <div className="routes-table-header">

              <div>

                <span className="section-label">
                  ENDPOINT REGISTRY
                </span>

                <h2>
                  Registered Routes
                </h2>

              </div>

              <div className="route-count">
                {routes.length}{" "}
                {routes.length === 1
                  ? "Route"
                  : "Routes"}
              </div>

            </div>


            {routesLoading ? (

              <div className="routes-table-loading">

                <div className="routes-small-spinner"></div>

                Loading routes...

              </div>

            ) : routes.length === 0 ? (

              <div className="route-no-results">

                <div className="route-no-results-icon">
                  ⇄
                </div>

                <h3>
                  No routes registered
                </h3>

                <p>
                  This API version currently has
                  no configured endpoints.
                </p>

                <button
                  onClick={() =>
                    setShowCreateForm(true)
                  }
                >
                  Create First Route →
                </button>

              </div>

            ) : (

              <div className="routes-table-wrapper">

                <table className="professional-routes-table">

                  <thead>

                    <tr>

                      <th>
                        ID
                      </th>

                      <th>
                        ENDPOINT
                      </th>

                      <th>
                        METHOD
                      </th>

                      <th>
                        STATUS
                      </th>

                      <th>
                        VERSION
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {routes.map(
                      (route, index) => (

                        <tr
                          key={route.route_id}
                          style={{
                            animationDelay:
                              `${index * 0.06}s`,
                          }}
                        >

                          <td>

                            <span className="route-id">
                              #
                              {String(
                                route.route_id
                              ).padStart(2, "0")}
                            </span>

                          </td>


                          <td>

                            <div className="route-path-cell">

                              <div className="route-path-icon">
                                /
                              </div>

                              <div>

                                <code>
                                  {route.path}
                                </code>

                                <small>
                                  API endpoint
                                </small>

                              </div>

                            </div>

                          </td>


                          <td>

                            <span
                              className={getMethodClass(
                                route.http_method
                              )}
                            >
                              {route.http_method}
                            </span>

                          </td>


                          <td>

                            <span
                              className={
                                route.is_active
                                  ? "route-status active"
                                  : "route-status inactive"
                              }
                            >

                              <span></span>

                              {route.is_active
                                ? "Active"
                                : "Inactive"}

                            </span>

                          </td>


                          <td>

                            <span className="route-version">

                              {selectedVersionData?.version_number}

                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}


            {routes.length > 0 && (
              <div className="routes-table-footer">

                <span>
                  Route registry synchronized with
                  API Gateway
                </span>

                <span className="routes-system-status">

                  <span></span>

                  ROUTING SYSTEM ONLINE

                </span>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default RoutesPage;