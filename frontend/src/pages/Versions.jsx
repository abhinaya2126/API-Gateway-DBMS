import { useEffect, useState } from "react";
import api from "../services/api";

function Versions() {
  const [apis, setApis] = useState([]);
  const [versions, setVersions] = useState([]);

  const [selectedApi, setSelectedApi] = useState("");
  const [versionNumber, setVersionNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApis = async () => {
    try {
      const response = await api.get("/apis");
      setApis(response.data.apis || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load APIs.");
    }
  };

  const fetchVersions = async (apiId) => {
    if (!apiId) {
      setVersions([]);
      return;
    }

    try {
      const response = await api.get(`/versions/api/${apiId}`);

      setVersions(response.data.versions || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load versions.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchApis();
      setLoading(false);
    };

    loadData();
  }, []);

  const handleApiChange = async (e) => {
    const apiId = e.target.value;

    setSelectedApi(apiId);
    setError("");

    await fetchVersions(apiId);
  };

  const handleCreateVersion = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/versions/api/${selectedApi}`, {
        version_number: versionNumber,
      });

      setVersionNumber("");

      await fetchVersions(selectedApi);
    } catch (err) {
      console.error("Create version error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to create version."
      );
    }
  };

  if (loading) {
    return <h2>Loading versions...</h2>;
  }

  return (
    <div>
      <h1>API Versions</h1>

      <p>Manage versions for registered APIs.</p>

      {error && <p>{error}</p>}

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

      {selectedApi && (
        <>
          <div className="form-card">
            <h2>Create Version</h2>

            <form onSubmit={handleCreateVersion}>
              <label>Version Number</label>
              <br />

              <input
                type="text"
                value={versionNumber}
                onChange={(e) =>
                  setVersionNumber(e.target.value)
                }
                placeholder="Example: v1"
                required
              />

              <br />
              <br />

              <button type="submit">
                Create Version
              </button>
            </form>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Version ID</th>
                  <th>Version</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {versions.length === 0 ? (
                  <tr>
                    <td colSpan="3">
                      No versions found.
                    </td>
                  </tr>
                ) : (
                  versions.map((version) => (
                    <tr key={version.version_id}>
                      <td>{version.version_id}</td>

                      <td>
                        {version.version_number}
                      </td>

                      <td>
                        {version.is_active
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

export default Versions;