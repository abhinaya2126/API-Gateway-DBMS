import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/useAuth";

function DeveloperLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("priya.dev@apigw.local");
  const [password, setPassword] = useState("Dev@123");
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

      if (nextUser?.role === "ADMIN") {
        setError("Admins must sign in at /admin");
        return;
      }

      if (nextUser?.role !== "DEVELOPER" && nextUser?.role !== "USER") {
        setError("Access denied: developer portal only");
        return;
      }

      login(token, nextUser);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  if (user && user.role === "ADMIN") {
    return (
      <div className="access-denied-page">
        <h1>Admin access</h1>
        <p>Admins must sign in at /admin</p>
        <Link to="/admin">Go to admin login</Link>
      </div>
    );
  }

  return (
    <main className="login-page developer-login-page">
      <section className="login-layout">
        <div className="login-brand-panel developer-brand-panel">
          <div className="login-bg-circle circle-one"></div>
          <div className="login-bg-circle circle-two"></div>
          <div className="login-grid-pattern"></div>

          <div className="brand-content">
            <div className="brand-logo">⚡</div>
            <div className="brand-label">DEVELOPER PORTAL</div>
            <h1>Build and ship API experiences</h1>
            <p>Manage your own APIs, routes, versions, and gateway access.</p>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-card">
            <div className="login-header">
              <div className="welcome-badge developer-badge">
                <span className="status-dot"></span>
                Developer Portal
              </div>
              <h2>Welcome back</h2>
              <p>Sign in to access your developer workspace.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label htmlFor="developer-email">Email address</label>
                <div className="input-wrapper">
                  <span className="input-icon">@</span>
                  <input
                    id="developer-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="login-form-group">
                <div className="password-label-row">
                  <label htmlFor="developer-password">Password</label>
                  <button type="button" className="forgot-password" onClick={() => setError("Password recovery will be available soon.")}>Forgot password?</button>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">●</span>
                  <input
                    id="developer-password"
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

              <button type="submit" className="login-submit developer-submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in →"}
              </button>
            </form>

            <div className="login-security">
              <span className="security-icon">🔒</span>
              <span>Protected by secure authentication</span>
            </div>

            <div className="login-divider">
              <span>DEVELOPER PORTAL</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default DeveloperLogin;
