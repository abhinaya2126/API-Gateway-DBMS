import { useEffect, useState } from "react";
import api from "../services/api";

function APIs() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [apiName, setApiName] = useState("");
  const [description, setDescription] = useState("");
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
    fetchApis();
  }, []);

  const handleCreateApi = async (e) => {
    e.preventDefault();

    try {
      await api.post("/apis", {
        api_name: apiName,
        description,
        owner_id: Number(ownerId),
      });

      setApiName("");
      setDescription("");
      setOwnerId("");
      setShowForm(false);
      setError("");

      await fetchApis();
    } catch (err) {
      console.error("Create API error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to create API."
      );
    }
  };

  if (loading) {
    return <h2>Loading APIs...</h2>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>APIs</h1>
          <p>Manage registered APIs</p>
        </div>

        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Register API"}
        </button>
      </div>

      {error && <p>{error}</p>}

      {showForm && (
        <div className="form-card">
          <h2>Register New API</h2>

          <form onSubmit={handleCreateApi}>
            <div>
              <label>API Name</label>
              <br />
              <input
                type="text"
                value={apiName}
                onChange={(e) => setApiName(e.target.value)}
                placeholder="Enter API name"
                required
              />
            </div>

            <br />

            <div>
              <label>Description</label>
              <br />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter API description"
                rows="4"
                required
              />
            </div>

            <br />

            <div>
              <label>Owner ID</label>
              <br />
              <input
                type="number"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                placeholder="Enter owner user ID"
                required
                min="1"
              />
            </div>

            <br />

            <button type="submit">
              Create API
            </button>
          </form>
        </div>
      )}

      {!error && apis.length === 0 && (
        <p>No APIs found.</p>
      )}

      {apis.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>API Name</th>
                <th>Description</th>
                <th>Owner</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {apis.map((item) => (
                <tr key={item.api_id}>
                  <td>{item.api_id}</td>
                  <td>{item.api_name}</td>
                  <td>{item.description}</td>
                  <td>{item.owner_username}</td>
                  <td>
                    {item.is_active ? "Active" : "Inactive"}
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

export default APIs;