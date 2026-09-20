import Navbar from "./Navbar";
import DeveloperSidebar from "./DeveloperSidebar";

function DeveloperLayout({ children }) {
  return (
    <div className="app-layout developer-layout">
      <Navbar
        portal="developer"
        title="Developer Portal"
        subtitle="API Workspace"
      />

      <div className="main-layout">
        <DeveloperSidebar />

        <main className="content">{children}</main>
      </div>
    </div>
  );
}

export default DeveloperLayout;
