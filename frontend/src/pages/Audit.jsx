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
    Promise.resolve().then(fetchAuditLogs);
  }, []);

  const getInitials = (username) => {
    if (!username) return "SY";

    return username
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getActionClass = (action) => {
    const value = String(action || "").toLowerCase();

    if (
      value.includes("create") ||
      value.includes("grant") ||
      value.includes("add")
    ) {
      return "audit-action create";
    }

    if (
      value.includes("delete") ||
      value.includes("revoke") ||
      value.includes("remove")
    ) {
      return "audit-action delete";
    }

    if (
      value.includes("update") ||
      value.includes("modify") ||
      value.includes("edit")
    ) {
      return "audit-action update";
    }

    if (value.includes("login") || value.includes("access")) {
      return "audit-action access";
    }

    return "audit-action default";
  };

  const getEntityClass = (entity) => {
    const value = String(entity || "").toLowerCase();

    if (value.includes("user")) return "audit-entity user";
    if (value.includes("api")) return "audit-entity api";
    if (value.includes("route")) return "audit-entity route";
    if (value.includes("permission")) {
      return "audit-entity permission";
    }
    if (value.includes("key")) return "audit-entity key";

    return "audit-entity default";
  };

  if (loading) {
    return (
      <div className="audit-loading">
        <div className="audit-loading-spinner"></div>

        <h2>Loading audit logs</h2>

        <p>
          Retrieving administrative and system activity...
        </p>
      </div>
    );
  }

  return (
    <div className="audit-page">

      {/* PAGE HEADER */}
      <div className="audit-page-header">

        <div>
          <div className="audit-breadcrumb">
            API GATEWAY / MONITORING / AUDIT
          </div>

          <h1>Audit Logs</h1>

          <p>
            Track administrative actions and system activity
            across the API Gateway.
          </p>
        </div>

        <div className="audit-header-status">
          <span className="audit-online-dot"></span>
          Audit Monitoring Online
        </div>

      </div>

      {/* SUMMARY */}
      <div className="audit-summary">

        <div className="audit-summary-card">

          <div className="audit-summary-icon blue">
            ◉
          </div>

          <div>
            <span>Total Events</span>

            <strong>{logs.length}</strong>

            <small>
              Recorded audit activities
            </small>
          </div>

        </div>

        <div className="audit-summary-card">

          <div className="audit-summary-icon purple">
            ◇
          </div>

          <div>
            <span>Administrative</span>

            <strong>
              {
                logs.filter(
                  (log) =>
                    String(log.entity_type || "")
                      .toLowerCase()
                      .includes("user") ||
                    String(log.entity_type || "")
                      .toLowerCase()
                      .includes("permission")
                ).length
              }
            </strong>

            <small>
              Access control activity
            </small>
          </div>

        </div>

        <div className="audit-summary-card">

          <div className="audit-summary-icon green">
            ✓
          </div>

          <div>
            <span>System Activity</span>

            <strong>
              {
                logs.filter(
                  (log) =>
                    String(log.username || "")
                      .toLowerCase() === "system" ||
                    !log.username
                ).length
              }
            </strong>

            <small>
              Automated system events
            </small>
          </div>

        </div>

        <div className="audit-summary-card">

          <div className="audit-summary-icon orange">
            ◎
          </div>

          <div>
            <span>Latest Event</span>

            <strong>
              {logs.length > 0 ? "LIVE" : "—"}
            </strong>

            <small>
              Audit stream status
            </small>
          </div>

        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="audit-error">

          <div className="audit-error-icon">
            !
          </div>

          <div>
            <strong>Unable to load audit data</strong>

            <p>{error}</p>
          </div>

        </div>
      )}

      {/* EMPTY STATE */}
      {!error && logs.length === 0 && (
        <section className="audit-empty-state">

          <div className="audit-empty-icon">
            ◌
          </div>

          <h2>No audit logs found</h2>

          <p>
            There are currently no administrative or system
            activities recorded in the audit trail.
          </p>

          <div className="audit-empty-status">
            <span></span>
            Audit system ready
          </div>

        </section>
      )}

      {/* AUDIT TABLE */}
      {logs.length > 0 && (
        <section className="audit-table-card">

          {/* TABLE HEADER */}
          <div className="audit-table-header">

            <div>
              <span className="audit-section-eyebrow">
                SECURITY & COMPLIANCE
              </span>

              <h2>Activity Audit Trail</h2>

              <p>
                Complete record of administrative and system
                events within the API Gateway.
              </p>
            </div>

            <div className="audit-record-count">

              <strong>{logs.length}</strong>

              <span>EVENTS</span>

            </div>

          </div>

          {/* TABLE */}
          <div className="audit-table-wrapper">

            <table className="professional-audit-table">

              <thead>
                <tr>
                  <th>EVENT</th>
                  <th>USER</th>
                  <th>ACTION</th>
                  <th>ENTITY</th>
                  <th>ENTITY ID</th>
                  <th>DESCRIPTION</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>

              <tbody>

                {logs.map((log, index) => (

                  <tr
                    key={log.audit_id}
                    style={{
                      animationDelay: `${index * 0.05}s`,
                    }}
                  >

                    {/* EVENT */}
                    <td>
                      <div className="audit-event-cell">

                        <div className="audit-event-icon">
                          #
                        </div>

                        <div>
                          <strong>
                            #{String(
                              log.audit_id
                            ).padStart(4, "0")}
                          </strong>

                          <span>
                            Audit Event
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* USER */}
                    <td>
                      <div className="audit-user-cell">

                        <div className="audit-user-avatar">
                          {getInitials(log.username)}
                        </div>

                        <div>
                          <strong>
                            {log.username || "System"}
                          </strong>

                          <span>
                            {log.username
                              ? "Authenticated User"
                              : "System Process"}
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* ACTION */}
                    <td>
                      <span
                        className={getActionClass(
                          log.action_type
                        )}
                      >
                        <span></span>

                        {log.action_type || "Unknown"}
                      </span>
                    </td>

                    {/* ENTITY */}
                    <td>
                      <span
                        className={getEntityClass(
                          log.entity_type
                        )}
                      >
                        {log.entity_type || "N/A"}
                      </span>
                    </td>

                    {/* ENTITY ID */}
                    <td>
                      <span className="audit-entity-id">
                        {log.entity_id || "N/A"}
                      </span>
                    </td>

                    {/* DESCRIPTION */}
                    <td>
                      <div className="audit-description">
                        {log.description ||
                          "No description available."}
                      </div>
                    </td>

                    {/* TIMESTAMP */}
                    <td>
                      <div className="audit-timestamp">

                        <strong>
                          {new Date(
                            log.created_at
                          ).toLocaleDateString()}
                        </strong>

                        <span>
                          {new Date(
                            log.created_at
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

          {/* FOOTER */}
          <div className="audit-table-footer">

            <span>
              Showing{" "}
              <strong>{logs.length}</strong>{" "}
              audit events
            </span>

            <span className="audit-footer-status">
              <span></span>
              Audit trail synchronized
            </span>

          </div>

        </section>
      )}

    </div>
  );
}

export default Audit;