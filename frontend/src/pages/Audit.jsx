import { useEffect, useState } from "react";
import api from "../services/api";

function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAuditLogs = async () => {
    try {
      setError("");

      const response = await api.get("/audit");

      setLogs(response.data.logs || []);
    } catch (err) {
      console.error("Audit logs error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load audit logs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  if (loading) {
    return <h2>Loading audit logs...</h2>;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Audit Logs</h1>
          <p>
            Track administrative and system activities.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && <p>{error}</p>}

      {/* No Logs */}
      {!error && logs.length === 0 && (
        <p>No audit logs found.</p>
      )}

      {/* Audit Table */}
      {logs.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>Description</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.audit_id}>
                  <td>{log.audit_id}</td>

                  <td>
                    {log.username || "System"}
                  </td>

                  <td>
                    {log.action_type}
                  </td>

                  <td>
                    {log.entity_type}
                  </td>

                  <td>
                    {log.entity_id || "N/A"}
                  </td>

                  <td>
                    {log.description || "N/A"}
                  </td>

                  <td>
                    {new Date(
                      log.created_at
                    ).toLocaleString()}
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

export default Audit;