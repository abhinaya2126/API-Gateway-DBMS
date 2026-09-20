import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Navbar({ portal = "developer", title = "API Gateway", subtitle = "Management System" }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const username = user?.username || "User";
  const role = user?.role || "User";

  const initials = username
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate(portal === "admin" ? "/admin/login" : "/login", { replace: true });
  };

  return (
    <header className="app-navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">⚡</div>

        <div className="navbar-brand-text">
          <span className="navbar-title">{title}</span>
          <span className="navbar-subtitle">{subtitle}</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-status">
          <span className="navbar-status-dot"></span>
          System Online
        </div>

        <div className="navbar-divider"></div>

        <div className="navbar-user">
          <div className="navbar-avatar">{initials}</div>

          <div className="navbar-user-info">
            <span className="navbar-username">{username}</span>
            <span className="navbar-role">{role}</span>
          </div>
        </div>

        <button className="navbar-logout" onClick={handleLogout}>
          <span>↪</span>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;