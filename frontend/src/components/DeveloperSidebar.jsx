import { NavLink } from "react-router-dom";

function DeveloperSidebar() {
  const links = [
    { name: "Dashboard", path: "/", icon: "⌂" },
    { name: "My APIs", path: "/apis", icon: "◈" },
    { name: "Versions", path: "/versions", icon: "◷" },
    { name: "Routes", path: "/routes", icon: "⇄" },
    { name: "My API Keys", path: "/api-keys", icon: "⚿" },
    { name: "Gateway Tester", path: "/gateway-tester", icon: "▷" },
    { name: "My Usage", path: "/usage", icon: "▥" },
  ];

  return (
    <aside className="app-sidebar developer-sidebar">
      <div className="sidebar-heading">
        <div className="sidebar-gateway-icon">⚡</div>

        <div>
          <div className="sidebar-title">Developer</div>
          <div className="sidebar-subtitle">Portal</div>
        </div>
      </div>

      <nav className="sidebar-navigation">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Workspace</div>

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

export default DeveloperSidebar;
