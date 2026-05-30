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

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { token, user } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" replace />;

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
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/listings" element={<PublicLayout><Listings /></PublicLayout>} />
      <Route path="/movers" element={<PublicLayout><Movers /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutUs /></PublicLayout>} />
      <Route path="/reset-password/:token" element={<PublicLayout><ResetPassword /></PublicLayout>} />
      <Route path="/verify-email/:token" element={<PublicLayout><VerifyEmail /></PublicLayout>} />
      <Route path="/seller-login" element={<PublicLayout><SellerLogin /></PublicLayout>} />
      <Route path="/materials" element={<PublicLayout><Materials /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><TermsAndPrivacy /></PublicLayout>} />

      {/* ── TOURISM ROUTES (have Navbar) ── */}
      {/* IMPORTANT: specific /tourism/* paths must come before /tourism/:id */}
      <Route path="/tourism" element={<PublicLayout><TourismPage /></PublicLayout>} />
      <Route path="/tourism/listings" element={<PublicLayout><TourismListingsPage /></PublicLayout>} />
      <Route path="/tourism/register-property" element={<PublicLayout><RegisterPropertyPage /></PublicLayout>} />
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
      <Route path="/tourism/:id" element={<PublicLayout><TourismDetailPage /></PublicLayout>} />

      {/* ── AXXBIASHARA BUSINESS DIRECTORY ROUTES (have Navbar) ── */}
      <Route path="/axxbiashara" element={<PublicLayout><AxxBiashara /></PublicLayout>} />
      <Route
        path="/business/create"
        element={
          <DashboardLayout>
            <ProtectedRoute>
              <BusinessForm />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/business/edit/:id"
        element={
          <DashboardLayout>
            <ProtectedRoute>
              <BusinessForm />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route path="/business/:id" element={<PublicLayout><BusinessDetail /></PublicLayout>} />

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
          <PublicLayout>
            <ProtectedRoute><Upload /></ProtectedRoute>
          </PublicLayout>
        }
      />
      <Route
        path="/premium-plans"
        element={
          <PublicLayout>
            <ProtectedRoute><PremiumPlans /></ProtectedRoute>
          </PublicLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <PublicLayout>
            <ProtectedRoute><Checkout /></ProtectedRoute>
          </PublicLayout>
        }
      />
      <Route path="/leave-review" element={<PublicLayout><LeaveReview /></PublicLayout>} />

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
          </PublicLayout>
        }
      />
    </Routes>
  );
}

export default App;