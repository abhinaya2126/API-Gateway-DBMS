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

  const getMethodClass = (method) => {
    return `usage-method ${String(method || "GET").toLowerCase()}`;
  };

  const getStatusClass = (status) => {
    const code = Number(status);

    if (code >= 200 && code < 300) {
      return "usage-status success";
    }

    if (code >= 400) {
      return "usage-status failed";
    }

    return "usage-status other";
  };

  const getStatusLabel = (status) => {
    const code = Number(status);

    if (code >= 200 && code < 300) {
      return "Success";
    }

    if (code >= 400) {
      return "Failed";
    }

    return "Other";
  };

  if (loading) {
    return (
      <div className="usage-loading">
        <div className="usage-loading-spinner"></div>

        <h2>Loading usage logs</h2>

        <p>
          Retrieving API gateway request activity...
        </p>
      </div>
    );
  }

  return (
    <div className="usage-page">

      {/* PAGE HEADER */}
      <div className="usage-page-header">

        <div>
          <div className="usage-breadcrumb">
            API GATEWAY / MONITORING / USAGE
          </div>

          <h1>Usage Logs</h1>

          <p>
            Monitor API gateway requests, response times and
            request activity.
          </p>
        </div>

        <div className="usage-header-status">
          <span className="usage-online-dot"></span>
          Gateway Monitoring Online
        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="usage-error">

          <div className="usage-error-icon">
            !
          </div>

          <div>
            <strong>Unable to load usage data</strong>
            <p>{error}</p>
          </div>

        </div>
      )}

      {/* STATISTICS */}
      <div className="usage-summary">

        <div className="usage-summary-card">

          <div className="usage-summary-icon blue">
            ↗
          </div>

          <div>
            <span>Total Requests</span>

            <strong>{stats.total}</strong>

            <small>
              Gateway requests recorded
            </small>
          </div>

        </div>

        <div className="usage-summary-card">

          <div className="usage-summary-icon green">
            ✓
          </div>

          <div>
            <span>Successful</span>

            <strong>{stats.successful}</strong>

            <small>
              Requests below 400 status
            </small>
          </div>

        </div>

        <div className="usage-summary-card">

          <div className="usage-summary-icon red">
            !
          </div>

          <div>
            <span>Failed</span>

            <strong>{stats.failed}</strong>

            <small>
              Requests with errors
            </small>
          </div>

        </div>

        <div className="usage-summary-card">

          <div className="usage-summary-icon purple">
            ◷
          </div>

          <div>
            <span>Avg Response</span>

            <strong>
              {stats.averageResponseTime}
              <small className="usage-ms"> ms</small>
            </strong>

            <small>
              Average gateway response time
            </small>
          </div>

        </div>

      </div>

      {/* EMPTY STATE */}
      {!error && logs.length === 0 && (
        <section className="usage-empty-state">

          <div className="usage-empty-icon">
            ◌
          </div>

          <h2>No usage logs found</h2>

          <p>
            There are currently no API gateway requests
            recorded in the system.
          </p>

          <div className="usage-empty-status">
            <span></span>
            Monitoring system ready
          </div>

        </section>
      )}

      {/* LOG TABLE */}
      {logs.length > 0 && (
        <section className="usage-table-card">

          {/* TABLE HEADER */}
          <div className="usage-table-header">

            <div>
              <span className="usage-section-eyebrow">
                REQUEST ACTIVITY
              </span>

              <h2>Gateway Request Registry</h2>

              <p>
                Detailed record of API gateway requests and
                their execution performance.
              </p>
            </div>

            <div className="usage-record-count">
              <strong>{logs.length}</strong>
              <span>REQUESTS</span>
            </div>

          </div>

          {/* TABLE */}
          <div className="usage-table-wrapper">

            <table className="professional-usage-table">

              <thead>
                <tr>
                  <th>REQUEST</th>
                  <th>API</th>
                  <th>VERSION</th>
                  <th>ROUTE</th>
                  <th>METHOD</th>
                  <th>KEY</th>
                  <th>STATUS</th>
                  <th>RESPONSE</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>

              <tbody>

                {logs.map((log, index) => (
                  <tr
                    key={log.log_id}
                    style={{
                      animationDelay: `${index * 0.045}s`,
                    }}
                  >

                    {/* REQUEST ID */}
                    <td>
                      <div className="usage-request-cell">

                        <div className="usage-request-icon">
                          #
                        </div>

                        <div>
                          <strong>
                            #{String(log.log_id).padStart(4, "0")}
                          </strong>

                          <span>
                            Gateway Request
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* API */}
                    <td>
                      <div className="usage-api-cell">
                        <strong>
                          {log.api_name || "Unknown API"}
                        </strong>

                        <span>
                          API Gateway
                        </span>
                      </div>
                    </td>

                    {/* VERSION */}
                    <td>
                      <span className="usage-version">
                        {log.version_number || "N/A"}
                      </span>
                    </td>

                    {/* ROUTE */}
                    <td>
                      <code className="usage-route">
                        {log.path || "/"}
                      </code>
                    </td>

                    {/* METHOD */}
                    <td>
                      <span
                        className={getMethodClass(
                          log.http_method
                        )}
                      >
                        {log.http_method || "GET"}
                      </span>
                    </td>

                    {/* KEY */}
                    <td>
                      {log.key_id != null ? (
                        <span className="usage-key">
                          KEY #{log.key_id}
                        </span>
                      ) : (
                        <span className="usage-na">
                          N/A
                        </span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td>
                      <div
                        className={getStatusClass(
                          log.status_code
                        )}
                      >
                        <span></span>

                        <strong>
                          {log.status_code}
                        </strong>

                        <em>
                          {getStatusLabel(
                            log.status_code
                          )}
                        </em>
                      </div>
                    </td>

                    {/* RESPONSE TIME */}
                    <td>
                      <div className="usage-response-time">

                        <strong>
                          {log.response_time_ms}
                        </strong>

                        <span>ms</span>

                      </div>
                    </td>

                    {/* TIMESTAMP */}
                    <td>
                      <div className="usage-timestamp">

                        <strong>
                          {new Date(
                            log.request_timestamp
                          ).toLocaleDateString()}
                        </strong>

                        <span>
                          {new Date(
                            log.request_timestamp
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {/* TABLE FOOTER */}
          <div className="usage-table-footer">

            <span>
              Showing{" "}
              <strong>{logs.length}</strong>{" "}
              gateway requests
            </span>

            <span className="usage-footer-status">
              <span></span>
              Monitoring synchronized
            </span>

          </div>

        </section>
      )}

    </div>
  );
}

export default Usage;