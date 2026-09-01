import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import Users from "./pages/Users";
import APIs from "./pages/APIs";
import Versions from "./pages/Versions";
import RoutesPage from "./pages/Routes";
import Permissions from "./pages/Permissions";
import ApiKeys from "./pages/ApiKeys";
import Usage from "./pages/Usage";
import Audit from "./pages/Audit";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />

            <Route
  path="/apis"
  element={
    <ProtectedRoute>
      <Layout>
        <APIs />
      </Layout>
    </ProtectedRoute>
  }
/>
          <Route
  path="/versions"
  element={
    <ProtectedRoute>
      <Layout>
        <Versions />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/routes"
  element={
    <ProtectedRoute>
      <Layout>
        <RoutesPage />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/permissions"
  element={
    <ProtectedRoute>
      <Layout>
        <Permissions />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/api-keys"
  element={
    <ProtectedRoute>
      <Layout>
        <ApiKeys />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/usage"
  element={
    <ProtectedRoute>
      <Layout>
        <Usage />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/audit"
  element={
    <ProtectedRoute>
      <Layout>
        <Audit />
      </Layout>
    </ProtectedRoute>
  }
/>

          <Route
            path="*"
            element={<Login />}
          />


        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;