import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  const username = user?.username || "User";
  const role = user?.role || "User";

  const initials = username
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="app-navbar">

      {/* Brand */}
      <div className="navbar-brand">
        <div className="navbar-logo">
          ⚡
        </div>

        <div className="navbar-brand-text">
          <span className="navbar-title">
            API Gateway
          </span>

          <span className="navbar-subtitle">
            Management System
          </span>
        </div>
      </div>


      {/* Right side */}
      <div className="navbar-right">

        <div className="navbar-status">
          <span className="navbar-status-dot"></span>
          System Online
        </div>

        <div className="navbar-divider"></div>

        <div className="navbar-user">

          <div className="navbar-avatar">
            {initials}
          </div>

          <div className="navbar-user-info">
            <span className="navbar-username">
              {username}
            </span>

            <span className="navbar-role">
              {role}
            </span>
          </div>

        </div>

        <button
          className="navbar-logout"
          onClick={logout}
        >
          <span>↪</span>
          Logout
        </button>

      </div>

    </header>
  );
}

export default Navbar;