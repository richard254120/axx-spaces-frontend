import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import AdminLayout from "./components/AdminLayout";
import CommandCenter from "./pages/CommandCenter";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import BusinessDetail from "./pages/BusinessDetail";

// Gate every console route behind an authenticated admin session
function AdminOnly({ children }) {
  const { user } = useContext(AuthContext);
  if (user?.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/business/:id" element={<BusinessDetail />} />
          <Route path="/business/create" element={<BusinessDetail />} />

          <Route
            element={
              <AdminOnly>
                <AdminLayout />
              </AdminOnly>
            }
          >
            <Route path="/" element={<CommandCenter />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
