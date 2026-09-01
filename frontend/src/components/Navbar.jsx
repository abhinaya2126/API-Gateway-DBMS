import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-title">
        API Gateway Management
      </div>

      <div className="navbar-user">
        <span>
          {user?.username} ({user?.role})
        </span>

        <button onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;