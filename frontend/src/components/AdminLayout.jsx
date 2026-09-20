import Navbar from "./Navbar";
import AdminSidebar from "./AdminSidebar";

function AdminLayout({ children }) {
  return (
    <div className="app-layout admin-layout">
      <Navbar
        portal="admin"
        title="Admin Console"
        subtitle="Operations Center"
      />

      <div className="main-layout">
        <AdminSidebar />

        <main className="content">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
