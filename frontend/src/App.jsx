import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import DeveloperLayout from "./components/DeveloperLayout";
import AdminLayout from "./components/AdminLayout";
import { AuthProvider } from "./context/AuthProvider";

import DeveloperLogin from "./pages/developer/DeveloperLogin";
import Register from "./pages/developer/Register";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import APIs from "./pages/APIs";
import Versions from "./pages/Versions";
import RoutesPage from "./pages/Routes";
import Permissions from "./pages/Permissions";
import ApiKeys from "./pages/ApiKeys";
import Usage from "./pages/Usage";
import Audit from "./pages/Audit";
import GatewayTester from "./pages/GatewayTester";
import NotFoundPage from "./pages/NotFound";

function DeveloperRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<DeveloperLogin />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["DEVELOPER", "USER"]} loginPath="/login">
            <DeveloperLayout>
              <Dashboard scope="developer" />
            </DeveloperLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route
        path="/apis"
        element={
          <ProtectedRoute allowedRoles={["DEVELOPER", "USER"]} loginPath="/login">
            <DeveloperLayout>
              <APIs scope="developer" />
            </DeveloperLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/versions"
        element={
          <ProtectedRoute allowedRoles={["DEVELOPER", "USER"]} loginPath="/login">
            <DeveloperLayout>
              <Versions />
            </DeveloperLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/routes"
        element={
          <ProtectedRoute allowedRoles={["DEVELOPER", "USER"]} loginPath="/login">
            <DeveloperLayout>
              <RoutesPage />
            </DeveloperLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/api-keys"
        element={
          <ProtectedRoute allowedRoles={["DEVELOPER", "USER"]} loginPath="/login">
            <DeveloperLayout>
              <ApiKeys />
            </DeveloperLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/usage"
        element={
          <ProtectedRoute allowedRoles={["DEVELOPER", "USER"]} loginPath="/login">
            <DeveloperLayout>
              <Usage scope="developer" />
            </DeveloperLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gateway-tester"
        element={
          <ProtectedRoute allowedRoles={["DEVELOPER", "USER"]} loginPath="/login">
            <DeveloperLayout>
              <GatewayTester />
            </DeveloperLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} loginPath="/admin/login">
            <AdminLayout>
              <Dashboard scope="admin" />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} loginPath="/admin/login">
            <AdminLayout>
              <Users />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/apis"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} loginPath="/admin/login">
            <AdminLayout>
              <APIs scope="admin" />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/versions"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} loginPath="/admin/login">
            <AdminLayout>
              <Versions />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/routes"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} loginPath="/admin/login">
            <AdminLayout>
              <RoutesPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/permissions"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} loginPath="/admin/login">
            <AdminLayout>
              <Permissions />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/keys"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} loginPath="/admin/login">
            <AdminLayout>
              <ApiKeys />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/usage"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} loginPath="/admin/login">
            <AdminLayout>
              <Usage scope="admin" />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} loginPath="/admin/login">
            <AdminLayout>
              <Audit />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gateway-tester"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} loginPath="/admin/login">
            <AdminLayout>
              <GatewayTester />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/*" element={<DeveloperRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;