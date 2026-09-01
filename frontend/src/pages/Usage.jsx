import { useEffect, useState } from "react";
import api from "../services/api";

function Usage() {
  const [logs, setLogs] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    averageResponseTime: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const calculateStats = (logs) => {
    const total = logs.length;

    const successful = logs.filter(
      (log) => Number(log.status_code) < 400
    ).length;

    const failed = logs.filter(
      (log) => Number(log.status_code) >= 400
    ).length;

    const averageResponseTime =
      total > 0
        ? (
            logs.reduce(
              (sum, log) =>
                sum + Number(log.response_time_ms || 0),
              0
            ) / total
          ).toFixed(2)
        : 0;

    setStats({
      total,
      successful,
      failed,
      averageResponseTime,
    });
  };

  const fetchLogs = async () => {
    try {
      setError("");

      const response = await api.get("/usage");

      const fetchedLogs = response.data.logs || [];

      setLogs(fetchedLogs);
      calculateStats(fetchedLogs);
    } catch (err) {
      console.error("Usage logs error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load usage logs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return <h2>Loading usage logs...</h2>;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Usage Logs</h1>
          <p>Monitor simulated API gateway requests.</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Requests</h3>
          <p>{stats.total}</p>
        </div>

        <div className="stat-card">
          <h3>Successful</h3>
          <p>{stats.successful}</p>
        </div>

        <div className="stat-card">
          <h3>Failed</h3>
          <p>{stats.failed}</p>
        </div>

        <div className="stat-card">
          <h3>Avg Response Time</h3>
          <p>{stats.averageResponseTime} ms</p>
        </div>

      </div>

      {/* Error */}
      {error && <p>{error}</p>}

      {/* No Logs */}
      {!error && logs.length === 0 && (
        <p>No usage logs found.</p>
      )}

      {/* Usage Logs Table */}
      {logs.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>API</th>
                <th>Version</th>
                <th>Route</th>
                <th>Method</th>
                <th>Key ID</th>
                <th>Status</th>
                <th>Response Time</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.log_id}>
                  <td>{log.log_id}</td>

                  <td>{log.api_name}</td>

                  <td>{log.version_number}</td>

                  <td>{log.path}</td>

                  <td>{log.http_method}</td>

                  <td>{log.key_id ?? "N/A"}</td>

                  <td>{log.status_code}</td>

                  <td>
                    {log.response_time_ms} ms
                  </td>

                  <td>
                    {new Date(
                      log.request_timestamp
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

export default Usage;