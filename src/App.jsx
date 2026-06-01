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
import LeaveReview from "./pages/LeaveReview";
import VerifyEmail from "./pages/VerifyEmail";

// ─── Tourism Pages ───────────────────────────────────────────────────────────
import TourismPage from "./pages/tourism/TourismPage";
import TourismListingsPage from "./pages/tourism/TourismListingsPage";
import TourismDetailPage from "./pages/tourism/TourismDetailPage";
import RegisterPropertyPage from "./pages/tourism/RegisterPropertyPage";
import ProviderDashboard from "./pages/tourism/ProviderDashboard";
import EditPropertyPage from "./pages/tourism/EditPropertyPage";

// ─── AxxBiashara Business Directory Pages ─────────────────────────────────────
import AxxBiashara from "./pages/AxxBiashara";
import BusinessForm from "./pages/BusinessForm";
import BusinessDetail from "./pages/BusinessDetail";
import UserDashboard from "./pages/UserDashboard";
import BusinessLogin from "./pages/BusinessLogin";
import BusinessRegister from "./pages/BusinessRegister";

import "leaflet/dist/leaflet.css";

// ─── Layouts ────────────────────────────────────────────────────────────────

// Public pages get the Navbar + WhatsApp button
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <FloatingWhatsApp />
    </>
  );
}

// Dashboard pages get NO Navbar and NO WhatsApp button
function DashboardLayout({ children }) {
  return <>{children}</>;
}

// ─── Route guard ────────────────────────────────────────────────────────────

const ProtectedRoute = ({ children, allowedRoles = [], businessRoute = false }) => {
  const { token, user } = useContext(AuthContext);

  if (!token) {
    if (businessRoute) {
      return <Navigate to="/business-login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ─── App ────────────────────────────────────────────────────────────────────

function App() {
  const navigate = useNavigate();
  useDevToolsProtection();

  return (
    <Routes>

      {/* ── PUBLIC ROUTES (have Navbar) ── */}
      <Route path="/" element={<DashboardLayout><Home /></DashboardLayout>} />
      <Route path="/listings" element={<DashboardLayout><Listings /></DashboardLayout>} />
      <Route path="/movers" element={<DashboardLayout><Movers /></DashboardLayout>} />
      <Route path="/login" element={<DashboardLayout><Login /></DashboardLayout>} />
      <Route path="/register" element={<DashboardLayout><Register /></DashboardLayout>} />
      <Route path="/about" element={<DashboardLayout><AboutUs /></DashboardLayout>} />
      <Route path="/reset-password/:token" element={<DashboardLayout><ResetPassword /></DashboardLayout>} />
      <Route path="/verify-email/:token" element={<DashboardLayout><VerifyEmail /></DashboardLayout>} />
      <Route path="/seller-login" element={<DashboardLayout><SellerLogin /></DashboardLayout>} />
      <Route path="/materials" element={<DashboardLayout><Materials /></DashboardLayout>} />
      <Route path="/faq" element={<DashboardLayout><FAQ /></DashboardLayout>} />
      <Route path="/contact" element={<DashboardLayout><Contact /></DashboardLayout>} />
      <Route path="/terms" element={<DashboardLayout><TermsAndPrivacy /></DashboardLayout>} />

      {/* ── TOURISM ROUTES (have Navbar) ── */}
      {/* IMPORTANT: specific /tourism/* paths must come before /tourism/:id */}
      <Route path="/tourism" element={<DashboardLayout><TourismPage /></DashboardLayout>} />
      <Route path="/tourism/listings" element={<DashboardLayout><TourismListingsPage /></DashboardLayout>} />
      <Route path="/tourism/register-property" element={<DashboardLayout><RegisterPropertyPage /></DashboardLayout>} />
      <Route
        path="/tourism/dashboard"
        element={
          <DashboardLayout>
            <ProtectedRoute>
              <ProviderDashboard />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/tourism/dashboard/property/:id"
        element={
          <DashboardLayout>
            <ProtectedRoute>
              <EditPropertyPage />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route path="/tourism/:id" element={<DashboardLayout><TourismDetailPage /></DashboardLayout>} />

      {/* ── AXXBIASHARA BUSINESS DIRECTORY ROUTES (have Navbar) ── */}
      <Route path="/axxbiashara" element={<DashboardLayout><AxxBiashara /></DashboardLayout>} />
      <Route path="/business-login" element={<DashboardLayout><BusinessLogin /></DashboardLayout>} />
      <Route path="/business-register" element={<DashboardLayout><BusinessRegister /></DashboardLayout>} />
      <Route
        path="/business/create"
        element={
          <DashboardLayout>
            <ProtectedRoute businessRoute><BusinessForm /></ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/business/edit/:id"
        element={
          <DashboardLayout>
            <ProtectedRoute businessRoute>
              <BusinessForm />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route path="/business/:id" element={<DashboardLayout><BusinessDetail /></DashboardLayout>} />
      <Route
        path="/business-dashboard"
        element={
          <DashboardLayout>
            <ProtectedRoute businessRoute>
              <UserDashboard />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />

      {/* ── DASHBOARD ROUTES (no Navbar) ── */}
      <Route
        path="/seller-dashboard"
        element={<DashboardLayout><SellerDashboard /></DashboardLayout>}
      />
      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            <ProtectedRoute allowedRoles={["landlord"]}>
              <LandlordDashboard />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/mover-dashboard"
        element={
          <DashboardLayout>
            <ProtectedRoute allowedRoles={["mover"]}>
              <MoverDashboard />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />

      {/* ── PROTECTED PUBLIC ROUTES (have Navbar) ── */}
      <Route
        path="/upload"
        element={
          <DashboardLayout>
            <ProtectedRoute><Upload /></ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/premium-plans"
        element={
          <DashboardLayout>
            <ProtectedRoute><PremiumPlans /></ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <DashboardLayout>
            <ProtectedRoute><Checkout /></ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route path="/leave-review" element={<DashboardLayout><LeaveReview /></DashboardLayout>} />

      {/* ── 404 ── */}
      <Route
        path="*"
        element={
          <DashboardLayout>
            <div style={{
              minHeight: "80vh", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: "#0f1729", color: "#94a3b8",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏚️</div>
              <h2 style={{ color: "#fbbf24", margin: "0 0 8px" }}>Page Not Found</h2>
              <p style={{ margin: "0 0 24px" }}>This page doesn't exist on Axxspace.</p>
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
          </DashboardLayout>
        }
      />
    </Routes>
  );
}

export default App;