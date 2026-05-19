import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "./context/AuthContext";

// Protection Hook
import { useDevToolsProtection } from "./hooks/useDevToolsProtection";

import Navbar from "./components/Navbar";
import FloatingWhatsApp from "./components/FloatingWhatsApp";

import Home from "./pages/Home";
import Listings from "./pages/Listings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import LandlordDashboard from "./pages/LandlordDashboard";
import MoverDashboard from "./pages/MoverDashboard";
import Movers from "./pages/Movers";
import ResetPassword from "./pages/ResetPassword";
import AboutUs from "./pages/AboutUs";
import SellerLogin from "./pages/SellerLogin";
import SellerDashboard from "./pages/SellerDashboard";
// Premium pages
import PremiumPlans from "./pages/PremiumPlans";
import Checkout from "./pages/Checkout";

import "leaflet/dist/leaflet.css";
import Materials from "./pages/Materials";
// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { token, user } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required
  if (allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const navigate = useNavigate();
  
  // Enable Console / DevTools Protection
  useDevToolsProtection();

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/movers" element={<Movers />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />

        <Route path="/materials" element={<Materials />} />
        {/* Protected Routes */}
        <Route path="/upload" element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['landlord']}>
            <LandlordDashboard />
          </ProtectedRoute>
        } />

        <Route path="/mover-dashboard" element={
          <ProtectedRoute allowedRoles={['mover']}>
            <MoverDashboard />
          </ProtectedRoute>
        } />

        <Route path="/premium-plans" element={
          <ProtectedRoute>
            <PremiumPlans />
          </ProtectedRoute>
        } />

        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />

        {/* 404 Page */}
        <Route path="*" element={
          <div style={{
            minHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f1729",
            color: "#94a3b8",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏚️</div>
            <h2 style={{ color: "#fbbf24", margin: "0 0 8px" }}>Page Not Found</h2>
            <p style={{ margin: "0 0 24px" }}>This page doesn't exist on Axx Spaces.</p>
            
            <button 
              onClick={() => navigate("/")}
              style={{
                padding: "12px 28px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Go Home
            </button>
          </div>
        } />
      </Routes>

      <FloatingWhatsApp />
    </>
  );
}

export default App;