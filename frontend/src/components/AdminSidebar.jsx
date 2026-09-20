import { NavLink } from "react-router-dom";

function AdminSidebar() {
  const links = [
    { name: "Dashboard", path: "/admin", icon: "⌂" },
    { name: "Users", path: "/admin/users", icon: "♙" },
    { name: "APIs", path: "/admin/apis", icon: "◈" },
    { name: "Versions", path: "/admin/versions", icon: "◷" },
    { name: "Routes", path: "/admin/routes", icon: "⇄" },
    { name: "Permissions", path: "/admin/permissions", icon: "◉" },
    { name: "Keys", path: "/admin/keys", icon: "⚿" },
    { name: "Usage", path: "/admin/usage", icon: "▥" },
    { name: "Audit", path: "/admin/audit", icon: "▤" },
    { name: "Gateway Tester", path: "/admin/gateway-tester", icon: "▷" },
  ];

  return (
    <aside className="app-sidebar admin-sidebar">
      <div className="sidebar-heading">
        <div className="sidebar-gateway-icon">⚡</div>

        <div>
          <div className="sidebar-title">Admin</div>
          <div className="sidebar-subtitle">Console</div>
        </div>
      </div>

      <nav className="sidebar-navigation">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Management</div>

          <div className="sidebar-links">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                <span className="sidebar-link-icon">{link.icon}</span>
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
