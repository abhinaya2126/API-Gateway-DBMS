import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      number: "01",
      title: "Build & Manage APIs",
      description:
        "Design, organize and manage your APIs from one centralized gateway platform.",
      features: [
        "Centralized API Management",
        "Route Configuration",
        "API Version Control",
      ],
    },
    {
      number: "02",
      title: "Secure Every Request",
      description:
        "Control authentication, permissions and access to your API ecosystem.",
      features: [
        "Secure Authentication",
        "Role-Based Permissions",
        "Protected API Access",
      ],
    },
    {
      number: "03",
      title: "Monitor API Performance",
      description:
        "Keep track of API usage, activity and gateway performance in one place.",
      features: [
        "Usage Monitoring",
        "API Activity Tracking",
        "Audit & Analytics",
      ],
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      login(token, user);

      console.log("Login successful:", user);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentSlide = slides[activeSlide];

  return (
    <main className="login-page">
      <section className="login-layout">

        {/* ================================
            LEFT SIDE
        ================================= */}

        <div className="login-brand-panel">

          {/* Decorative background */}
          <div className="login-bg-circle circle-one"></div>
          <div className="login-bg-circle circle-two"></div>
          <div className="login-grid-pattern"></div>

          <div className="brand-content">

            {/* Logo */}
            <div className="brand-logo">
              <span className="gateway-icon">
                ⚡
              </span>
            </div>

            <div className="brand-label">
              API MANAGEMENT PLATFORM
            </div>

            <div className="brand-heading-wrapper">

              <h1 key={activeSlide}>
                {currentSlide.title}
              </h1>

              <p key={`description-${activeSlide}`}>
                {currentSlide.description}
              </p>

            </div>

            {/* Feature list */}
            <div
              className="brand-features"
              key={`features-${activeSlide}`}
            >
              {currentSlide.features.map((feature, index) => (
                <div
                  className="feature-item"
                  key={index}
                >
                  <span className="feature-icon">
                    ✓
                  </span>

                  <span>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Slider controls */}
            <div className="slider-controls">

              <div className="slider-number">
                {currentSlide.number}
              </div>

              <div className="slider-lines">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={
                      activeSlide === index
                        ? "slider-line active"
                        : "slider-line"
                    }
                    onClick={() =>
                      setActiveSlide(index)
                    }
                    aria-label={`Go to slide ${index + 1}`}
                  ></button>
                ))}
              </div>

              <div className="slider-count">
                03
              </div>

            </div>

          </div>

          <div className="brand-footer">
            <span>
              API Gateway Management System
            </span>

            <span>
              Enterprise API Infrastructure
            </span>
          </div>

        </div>


        {/* ================================
            RIGHT SIDE
        ================================= */}

        <div className="login-form-panel">

          <div className="login-card">

            {/* Small mobile logo */}
            <div className="mobile-logo">
              ⚡
            </div>


            {/* Header */}
            <div className="login-header">

              <div className="welcome-badge">
                <span className="status-dot"></span>
                Secure Login
              </div>

              <h2>
                Welcome back
              </h2>

              <p>
                Sign in to access your API Gateway dashboard.
              </p>

            </div>


            {/* Form */}
            <form onSubmit={handleLogin}>

              {/* Email */}
              <div className="login-form-group">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    @
                  </span>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />

                </div>

              </div>


              {/* Password */}
              <div className="login-form-group">

                <div className="password-label-row">

                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() =>
                      setError(
                        "Password recovery will be available soon."
                      )
                    }
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ●
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              {/* Error */}
              {error && (
                <div
                  className="login-error"
                  role="alert"
                >
                  <span className="error-icon">
                    !
                  </span>

                  <span>
                    {error}
                  </span>
                </div>
              )}


              {/* Login button */}
              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="button-arrow">
                      →
                    </span>
                  </>
                )}

              </button>

            </form>


            {/* Security */}
            <div className="login-security">

              <span className="security-icon">
                🔒
              </span>

              <span>
                Protected by secure authentication
              </span>

            </div>


            {/* Divider */}
            <div className="login-divider">
              <span>
                API GATEWAY
              </span>
            </div>


            {/* Footer */}
            <div className="login-footer">

              <span>
                © 2026 API Gateway Management System
              </span>

              <span className="footer-status">
                <span className="footer-dot"></span>
                System Ready
              </span>

            </div>

          </div>

        </div>

      </section>
    </main>
  );
}

export default Login;