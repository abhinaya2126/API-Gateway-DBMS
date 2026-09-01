import { NavLink } from "react-router-dom";

function Sidebar() {
  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Users", path: "/users" },
    { name: "APIs", path: "/apis" },
    { name: "Versions", path: "/versions" },
    { name: "Routes", path: "/routes" },
    { name: "Permissions", path: "/permissions" },
    { name: "API Keys", path: "/api-keys" },
    { name: "Usage Logs", path: "/usage" },
    { name: "Audit Logs", path: "/audit" },
  ];

  return (
    <aside className="sidebar">
      <h2>Gateway</h2>

      <nav>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;