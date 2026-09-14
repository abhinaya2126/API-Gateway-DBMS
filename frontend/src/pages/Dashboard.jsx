import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  const [users, setUsers] = useState(0);
  const [apis, setApis] = useState(0);
  const [usage, setUsage] = useState(0);
  const [audit, setAudit] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          usersResponse,
          apisResponse,
          usageResponse,
          auditResponse,
        ] = await Promise.all([
          api.get("/users"),
          api.get("/apis"),
          api.get("/usage/my"),
          api.get("/audit"),
        ]);

        setUsers(usersResponse.data.count || 0);
        setApis(apisResponse.data.count || 0);
        setUsage(usageResponse.data.count || 0);
        setAudit(auditResponse.data.count || 0);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-eyebrow">
            API GATEWAY / OVERVIEW
          </div>

          <h1>Dashboard</h1>

          <p>
            Monitor your API infrastructure and gateway activity.
          </p>
        </div>

        <div className="dashboard-user-badge">
          <div className="dashboard-user-avatar">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <span>Signed in as</span>
            <strong>{user?.username || "User"}</strong>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="dashboard-error">
          <span>!</span>
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="dashboard-stats">

        <div className="dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon users-icon">♙</div>

            <span className="stat-status">
              Active
            </span>
          </div>

          <div className="stat-number">
            {users}
          </div>

          <div className="stat-label">
            Total Users
          </div>

          <div className="stat-description">
            Registered gateway users
          </div>
        </div>


        <div className="dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon api-icon">◈</div>

            <span className="stat-status">
              Managed
            </span>
          </div>

          <div className="stat-number">
            {apis}
          </div>

          <div className="stat-label">
            Total APIs
          </div>

          <div className="stat-description">
            APIs managed by gateway
          </div>
        </div>


        <div className="dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon request-icon">↗</div>

            <span className="stat-status">
              Tracked
            </span>
          </div>

          <div className="stat-number">
            {usage}
          </div>

          <div className="stat-label">
            API Requests
          </div>

          <div className="stat-description">
            Recorded API activity
          </div>
        </div>


        <div className="dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon audit-icon">◉</div>

            <span className="stat-status">
              Secure
            </span>
          </div>

          <div className="stat-number">
            {audit}
          </div>

          <div className="stat-label">
            Audit Events
          </div>

          <div className="stat-description">
            Recorded system events
          </div>
        </div>

      </div>

      {/* Bottom section */}
      <div className="dashboard-bottom-grid">

        {/* Gateway status */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">
                SYSTEM
              </span>

              <h3>Gateway Status</h3>
            </div>

            <span className="online-badge">
              <span></span>
              Operational
            </span>
          </div>

          <div className="gateway-status-content">

            <div className="gateway-status-icon">
              ⚡
            </div>

            <div>
              <strong>API Gateway is running normally</strong>

              <p>
                Your gateway infrastructure is connected
                and ready to process requests.
              </p>
            </div>

          </div>

          <div className="gateway-details">

            <div>
              <span>Service</span>
              <strong>API Gateway</strong>
            </div>

            <div>
              <span>Environment</span>
              <strong>Development</strong>
            </div>

            <div>
              <span>API Version</span>
              <strong>v1.0.0</strong>
            </div>

          </div>
        </div>


        {/* Account */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">
                ACCOUNT
              </span>

              <h3>Your Access</h3>
            </div>
          </div>

          <div className="account-details">

            <div className="account-row">
              <div className="account-row-icon">
                ♙
              </div>

              <div>
                <span>Username</span>
                <strong>
                  {user?.username || "User"}
                </strong>
              </div>
            </div>


            <div className="account-row">
              <div className="account-row-icon">
                @
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {user?.email || "Not available"}
                </strong>
              </div>
            </div>


            <div className="account-row">
              <div className="account-row-icon">
                ◉
              </div>

              <div>
                <span>Role</span>
                <strong className="role-badge">
                  {user?.role || "User"}
                </strong>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;