// App.jsx
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
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
import PremiumPlans from "./pages/PremiumPlans";
import Checkout from "./pages/Checkout";
import Materials from "./pages/Materials";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import TermsAndPrivacy from "./pages/TermsAndPrivacy";

import TourismPage from "./pages/tourism/TourismPage";
import TourismListingsPage from "./pages/tourism/TourismListingsPage";
import TourismDetailPage from "./pages/tourism/TourismDetailPage";
import RegisterPropertyPage from "./pages/tourism/RegisterPropertyPage";
import ProviderDashboard from "./pages/tourism/ProviderDashboard";
import EditPropertyPage from "./pages/tourism/EditPropertyPage";

import "leaflet/dist/leaflet.css";

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <FloatingWhatsApp />
    </>
  );
}

function DashboardLayout({ children }) {
  return <>{children}</>;
}

// ─── Route guard ─────────────────────────────────────────────────────────────
//  allowedRoles – only these roles may enter; others go to their own dashboard
//  redirectTo   – where unauthenticated users are sent (per-section login page)
const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = "/login" }) => {
  const { token, user } = useContext(AuthContext);

  // Not logged in → send to the correct login page for this section
  if (!token) return <Navigate to={redirectTo} replace />;

  // Logged in but wrong role → bounce to their own dashboard
  if (allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
    if (user.role === "mover")     return <Navigate to="/mover-dashboard" replace />;
    if (user.role === "landlord")  return <Navigate to="/dashboard" replace />;
    if (user.role === "provider")  return <Navigate to="/tourism/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const navigate = useNavigate();
  useDevToolsProtection();

  return (
    <Routes>

      {/* ── PUBLIC ROUTES ── */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/listings" element={<PublicLayout><Listings /></PublicLayout>} />
      <Route path="/movers" element={<PublicLayout><Movers /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutUs /></PublicLayout>} />
      <Route path="/reset-password/:token" element={<PublicLayout><ResetPassword /></PublicLayout>} />
      <Route path="/seller-login" element={<PublicLayout><SellerLogin /></PublicLayout>} />
      <Route path="/materials" element={<PublicLayout><Materials /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><TermsAndPrivacy /></PublicLayout>} />

      {/* ── TOURISM ROUTES ── */}
      <Route path="/tourism" element={<PublicLayout><TourismPage /></PublicLayout>} />
      <Route path="/tourism/listings" element={<PublicLayout><TourismListingsPage /></PublicLayout>} />
      <Route path="/tourism/register-property" element={<PublicLayout><RegisterPropertyPage /></PublicLayout>} />

      {/* Provider dashboard — "provider" role only; logged-out → /tourism */}
      <Route
        path="/tourism/dashboard"
        element={
          <DashboardLayout>
            <ProtectedRoute allowedRoles={["provider"]} redirectTo="/tourism">
              <ProviderDashboard />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/tourism/dashboard/property/:id"
        element={
          <DashboardLayout>
            <ProtectedRoute allowedRoles={["provider"]} redirectTo="/tourism">
              <EditPropertyPage />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route path="/tourism/:id" element={<PublicLayout><TourismDetailPage /></PublicLayout>} />

      {/* ── DASHBOARD ROUTES (no Navbar) ── */}
      <Route
        path="/seller-dashboard"
        element={<DashboardLayout><SellerDashboard /></DashboardLayout>}
      />

      {/* Landlord dashboard — "landlord" role only; logged-out → /login */}
      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            <ProtectedRoute allowedRoles={["landlord"]} redirectTo="/login">
              <LandlordDashboard />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />

      {/* Mover dashboard — "mover" role only; logged-out → /movers */}
      <Route
        path="/mover-dashboard"
        element={
          <DashboardLayout>
            <ProtectedRoute allowedRoles={["mover"]} redirectTo="/movers">
              <MoverDashboard />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />

      {/* ── PROTECTED PUBLIC ROUTES ── */}
      <Route path="/upload" element={<PublicLayout><ProtectedRoute><Upload /></ProtectedRoute></PublicLayout>} />
      <Route path="/premium-plans" element={<PublicLayout><ProtectedRoute><PremiumPlans /></ProtectedRoute></PublicLayout>} />
      <Route path="/checkout" element={<PublicLayout><ProtectedRoute><Checkout /></ProtectedRoute></PublicLayout>} />

      {/* ── 404 ── */}
      <Route
        path="*"
        element={
          <PublicLayout>
            <div style={{
              minHeight: "80vh", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: "#0f1729", color: "#94a3b8",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏚️</div>
              <h2 style={{ color: "#fbbf24", margin: "0 0 8px" }}>Page Not Found</h2>
              <p style={{ margin: "0 0 24px" }}>This page doesn't exist on Axx Spaces.</p>
              <button
                onClick={() => navigate("/")}
                style={{
                  padding: "12px 28px", background: "#3b82f6", color: "white",
                  border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer",
                }}
              >
                Go Home
              </button>
            </div>
          </PublicLayout>
        }
      />
    </Routes>
  );
}

export default App;