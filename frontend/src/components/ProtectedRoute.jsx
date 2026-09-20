import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProtectedRoute({ children, allowedRoles = [], loginPath = "/login" }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="access-denied-page">
        <h1>403</h1>
        <p>Access denied for this portal.</p>
        {user?.role === "ADMIN" ? (
          <Link to="/admin">Go to admin dashboard</Link>
        ) : (
          <Link to="/">Return to developer portal</Link>
        )}
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;