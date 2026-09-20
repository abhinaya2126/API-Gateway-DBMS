import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/useAuth";

function AdminLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("arjun.admin@apigw.local");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user: nextUser } = response.data;

      if (nextUser?.role !== "ADMIN") {
        setError("Access denied: admin only");
        return;
      }

      login(token, nextUser);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Access denied: admin only");
    } finally {
      setLoading(false);
    }
  };

  if (user && user.role !== "ADMIN") {
    return (
      <div className="access-denied-page">
        <h1>403</h1>
        <p>Access denied: admin only</p>
        <Link to="/">Return to developer portal</Link>
      </div>
    );
  }

  return (
    <main className="login-page admin-login-page">
      <section className="login-layout">
        <div className="login-brand-panel admin-brand-panel">
          <div className="login-bg-circle circle-one"></div>
          <div className="login-bg-circle circle-two"></div>
          <div className="login-grid-pattern"></div>

          <div className="brand-content">
            <div className="brand-logo">⚡</div>
            <div className="brand-label">ADMIN CONSOLE</div>
            <h1>Secure control center</h1>
            <p>Manage users, permissions, routes, audit logs, and global platform health.</p>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-card admin-login-card">
            <div className="login-header">
              <div className="welcome-badge admin-badge">
                <span className="status-dot"></span>
                Admin Console
              </div>
              <h2>Welcome back</h2>
              <p>Sign in to the administrative control panel.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label htmlFor="admin-email">Email address</label>
                <div className="input-wrapper">
                  <span className="input-icon">@</span>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="login-form-group">
                <div className="password-label-row">
                  <label htmlFor="admin-password">Password</label>
                  <button type="button" className="forgot-password" onClick={() => setError("Password recovery will be available soon.")}>Forgot password?</button>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">●</span>
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((previous) => !previous)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error" role="alert">
                  <span className="error-icon">!</span>
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="login-submit admin-submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in →"}
              </button>
            </form>

            <div className="login-security">
              <span className="security-icon">🔒</span>
              <span>Protected by secure authentication</span>
            </div>

            <div className="login-divider">
              <span>ADMIN CONSOLE</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminLogin;
