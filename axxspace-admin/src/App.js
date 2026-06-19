import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import BusinessDetail from "./pages/BusinessDetail";
import BoostManagement from "./components/BoostManagement";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/business/:id" element={<BusinessDetail />} />
          <Route path="/business/create" element={<BusinessDetail />} />
          <Route path="/boost-management" element={<BoostManagement />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
