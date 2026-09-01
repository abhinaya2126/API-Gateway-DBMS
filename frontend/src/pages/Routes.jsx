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
  const [error, setError] = useState("");

  // Load APIs
  useEffect(() => {
    const fetchApis = async () => {
      try {
        const response = await api.get("/apis");
        setApis(response.data.apis || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load APIs.");
      } finally {
        setLoading(false);
      }
    };

    fetchApis();
  }, []);

  // Load versions when API changes
  const handleApiChange = async (e) => {
    const apiId = e.target.value;

    setSelectedApi(apiId);
    setSelectedVersion("");
    setVersions([]);
    setRoutes([]);
    setError("");

    if (!apiId) return;

    try {
      const response = await api.get(`/versions/api/${apiId}`);

      setVersions(response.data.versions || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load versions.");
    }
  };

  // Load routes when version changes
  const handleVersionChange = async (e) => {
    const versionId = e.target.value;

    setSelectedVersion(versionId);
    setRoutes([]);
    setError("");

    if (!versionId) return;

    try {
      const response = await api.get(`/routes/version/${versionId}`);

      setRoutes(response.data.routes || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load routes.");
    }
  };

  // Create route
  const handleCreateRoute = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/routes/version/${selectedVersion}`, {
        path,
        http_method: httpMethod,
      });

      setPath("");
      setHttpMethod("GET");

      // Refresh routes
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
    }
  };

  if (loading) {
    return <h2>Loading routes...</h2>;
  }

  return (
    <div>
      <h1>API Routes</h1>

      <p>Manage routes for API versions.</p>

      {error && <p>{error}</p>}

      {/* Select API */}
      <div className="form-card">
        <label>Select API</label>
        <br />

        <select
          value={selectedApi}
          onChange={handleApiChange}
        >
          <option value="">-- Select API --</option>

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

      {/* Select Version */}
      {selectedApi && (
        <div className="form-card">
          <label>Select Version</label>
          <br />

          <select
            value={selectedVersion}
            onChange={handleVersionChange}
          >
            <option value="">-- Select Version --</option>

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
      )}

      {/* Create Route */}
      {selectedVersion && (
        <>
          <div className="form-card">
            <h2>Create Route</h2>

            <form onSubmit={handleCreateRoute}>
              <div>
                <label>Path</label>
                <br />

                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="Example: /products"
                  required
                />
              </div>

              <br />

              <div>
                <label>HTTP Method</label>
                <br />

                <select
                  value={httpMethod}
                  onChange={(e) =>
                    setHttpMethod(e.target.value)
                  }
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <br />

              <button type="submit">
                Create Route
              </button>
            </form>
          </div>

          {/* Routes table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Route ID</th>
                  <th>Path</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {routes.length === 0 ? (
                  <tr>
                    <td colSpan="4">
                      No routes found.
                    </td>
                  </tr>
                ) : (
                  routes.map((route) => (
                    <tr key={route.route_id}>
                      <td>{route.route_id}</td>

                      <td>{route.path}</td>

                      <td>{route.http_method}</td>

                      <td>
                        {route.is_active
                          ? "Active"
                          : "Inactive"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default RoutesPage;