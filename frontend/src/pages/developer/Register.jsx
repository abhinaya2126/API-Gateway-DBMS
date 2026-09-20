import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      setSuccess("Account created. Redirecting to sign in...");
      window.setTimeout(() => navigate("/login"), 700);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

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
            <h1>Create your workspace</h1>
            <p>Register a developer account to manage APIs and gateway access.</p>
          </div>
        </div>
        <div className="login-form-panel">
          <div className="login-card">
            <div className="login-header">
              <h2>Create account</h2>
              <p>Developer accounts are created with the developer role.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label htmlFor="register-username">Username</label>
                <input id="register-username" name="username" value={form.username} onChange={updateField} required />
              </div>
              <div className="login-form-group">
                <label htmlFor="register-email">Email address</label>
                <input id="register-email" name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required />
              </div>
              <div className="login-form-group">
                <label htmlFor="register-password">Password</label>
                <input id="register-password" name="password" type="password" value={form.password} onChange={updateField} autoComplete="new-password" minLength="12" required />
              </div>
              {error && <div className="login-error" role="alert">{error}</div>}
              {success && <div className="login-success" role="status">{success}</div>}
              <button type="submit" className="login-submit developer-submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
            <Link className="login-register-link" to="/login">Back to sign in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;
