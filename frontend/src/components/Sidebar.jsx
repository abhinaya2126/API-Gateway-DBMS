import { NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Sidebar() {
  const { user } = useAuth();
  const sections = [
    {
      title: "MAIN",
      links: [
        { name: "Dashboard", path: "/dashboard", icon: "⌂" },
        { name: "APIs", path: "/apis", icon: "◈" },
        { name: "Gateway Tester", path: "/gateway-tester", icon: "▷", roles: ["ADMIN", "DEVELOPER", "USER"] },
        { name: "API Keys", path: "/api-keys", icon: "⚿", roles: ["ADMIN"] },
        { name: "Versions", path: "/versions", icon: "◷", roles: ["ADMIN", "DEVELOPER"] },
        { name: "Routes", path: "/routes", icon: "⇄", roles: ["ADMIN", "DEVELOPER"] },
      ],
    },
    {
      title: "MANAGEMENT",
      links: [
        { name: "Users", path: "/users", icon: "♙", roles: ["ADMIN"] },
        { name: "Permissions", path: "/permissions", icon: "◉", roles: ["ADMIN"] },
      ],
    },
    {
      title: "MONITORING",
      links: [
        { name: "Usage Logs", path: "/usage", icon: "▥", roles: ["ADMIN", "DEVELOPER", "USER"] },
        { name: "Audit Logs", path: "/audit", icon: "▤", roles: ["ADMIN"] },
      ],
    },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-heading">
        <div className="sidebar-gateway-icon">⚡</div>

        <div>
          <div className="sidebar-title">Gateway</div>
          <div className="sidebar-subtitle">API Infrastructure</div>
        </div>
      </div>

      <nav className="sidebar-navigation">
        {sections.map((section) => (
          <div className="sidebar-section" key={section.title}>
            <div className="sidebar-section-title">
              {section.title}
            </div>

            <div className="sidebar-links">
              {section.links.filter((link) => !link.roles || link.roles.includes(user?.role)).map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    isActive
                      ? "sidebar-link active"
                      : "sidebar-link"
                  }
                >
                  <span className="sidebar-link-icon">
                    {link.icon}
                  </span>

                  <span>{link.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-status">
          <span className="sidebar-status-dot"></span>

          <div>
            <div className="sidebar-status-title">
              Gateway Status
            </div>
            <div className="sidebar-status-text">
              Operational
            </div>
          </div>
        </div>

        <div className="sidebar-version">
          API Gateway <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;