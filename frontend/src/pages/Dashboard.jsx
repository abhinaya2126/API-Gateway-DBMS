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
    return <h2>Loading dashboard...</h2>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <p>
        Welcome, <strong>{user?.username}</strong>
      </p>

      <p>
        Role: <strong>{user?.role}</strong>
      </p>

      {error && <p>{error}</p>}

      <div className="dashboard-grid">

        <div className="card">
          <h3>Total Users</h3>
          <p>{users}</p>
        </div>

        <div className="card">
          <h3>Total APIs</h3>
          <p>{apis}</p>
        </div>

        <div className="card">
          <h3>API Requests</h3>
          <p>{usage}</p>
        </div>

        <div className="card">
          <h3>Audit Events</h3>
          <p>{audit}</p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;