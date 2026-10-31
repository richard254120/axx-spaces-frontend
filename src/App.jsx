// App.jsx
import { lazy, Suspense } from "react";
import { Routes, Route, useNavigate, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useDevToolsProtection } from "./hooks/useDevToolsProtection";

import Navbar from "./components/Navbar";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import AppUpdateNotifier from "./components/AppUpdateNotifier";
import DownloadNotification from "./components/DownloadNotification";

// ── Eager: only the landing page and the shell ship in the entry bundle ──
import Home from "./pages/Home";

// ── Everything else is split per route ──
// A visitor landing on /listings should not download the admin dashboard,
// the upload wizard or the accommodation portal before the page paints.
const Listings = lazy(() => import("./pages/Listings"));
const PropertyDetailPage = lazy(() => import("./pages/PropertyDetailPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const UserLogin = lazy(() => import("./pages/UserLogin"));
const Upload = lazy(() => import("./pages/Upload"));
const LandlordDashboard = lazy(() => import("./pages/LandlordDashboard"));
const MemberDashboard = lazy(() => import("./pages/MemberDashboard"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const QuickSalesLogin = lazy(() => import("./pages/QuickSalesLogin"));
const QuickSalesDashboard = lazy(() => import("./pages/QuickSalesDashboard"));
const PremiumPlans = lazy(() => import("./pages/PremiumPlans"));
const Checkout = lazy(() => import("./pages/Checkout"));
const QuickSales = lazy(() => import("./pages/QuickSales"));
const QuickSaleDetailPage = lazy(() => import("./pages/QuickSaleDetailPage"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const TermsAndPrivacy = lazy(() => import("./pages/TermsAndPrivacy"));
const LeaveReview = lazy(() => import("./pages/LeaveReview"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminVerification = lazy(() => import("./pages/AdminVerification"));
const Settings = lazy(() => import("./pages/Settings"));

// ─── User Account Pages ──────────────────────────────────────────────────────
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const WalletPage = lazy(() => import("./pages/WalletPage"));
const AxxWallet = lazy(() => import("./pages/AxxWallet"));
const SavedListingsPage = lazy(() => import("./pages/SavedListingsPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

// ─── New Accommodation Booking Pages ──────────────────────────────────────────
const AccommodationSearch = lazy(() => import("./pages/AccommodationSearch"));
const AccommodationBookingDetail = lazy(() => import("./pages/AccommodationBookingDetail"));
const AccommodationGuestDashboard = lazy(() => import("./pages/AccommodationGuestDashboard"));
const AccommodationLeaveReview = lazy(() => import("./pages/AccommodationLeaveReview"));

// ─── Accommodation Pages ───────────────────────────────────────────────────────────
const AccommodationPage = lazy(() => import("./pages/accommodation/AccommodationPage"));
const AccommodationListingsPage = lazy(() => import("./pages/accommodation/AccommodationListingsPage"));
const AccommodationDetailPage = lazy(() => import("./pages/accommodation/AccommodationDetailPage"));
const AccommodationLogin = lazy(() => import("./pages/accommodation/AccommodationLogin"));
const RegisterPropertyPage = lazy(() => import("./pages/accommodation/RegisterPropertyPage"));
const ProviderDashboard = lazy(() => import("./pages/accommodation/ProviderDashboard"));
const EditPropertyPage = lazy(() => import("./pages/accommodation/EditPropertyPage"));
const AccommodationDashboardLayout = lazy(() => import("./components/AccommodationDashboardLayout"));
const BecomeAgentPage = lazy(() => import("./pages/BecomeAgentPage"));
const AgentRegister = lazy(() => import("./pages/AgentRegister"));
const AgentLogin = lazy(() => import("./pages/AgentLogin"));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const AgentProfilePage = lazy(() => import("./pages/AgentProfilePage"));
const RegisterAgencyPage = lazy(() => import("./pages/RegisterAgencyPage"));
const AgencyDashboard = lazy(() => import("./pages/AgencyDashboard"));

// ─── AxxBiashara Business Directory Pages ─────────────────────────────────────
const AxxBiashara = lazy(() => import("./pages/AxxBiashara"));
const BusinessForm = lazy(() => import("./pages/BusinessForm"));
const BusinessDetail = lazy(() => import("./pages/BusinessDetail"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const BusinessLogin = lazy(() => import("./pages/BusinessLogin"));
const BusinessRegister = lazy(() => import("./pages/BusinessRegister"));
const MobileAppDownload = lazy(() => import("./pages/MobileAppDownload"));

// ─── Layouts ────────────────────────────────────────────────────────────────

import ProtectedRoute from "./components/ProtectedRoute";
import AccountLayout from "./components/AccountLayout";

// Public pages get the Navbar + WhatsApp button + App Update Notifier
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <DownloadNotification />
      {children}
      <FloatingWhatsApp />
      <AppUpdateNotifier />
    </>
  );
}

// Dashboard / account pages — role-focused nav only, no public site links
function DashboardLayout({ children, preferSeller = false }) {
  return (
    <AccountLayout preferSeller={preferSeller}>
      {children}
      <AppUpdateNotifier />
    </AccountLayout>
  );
}

// Auth / standalone pages — no nav shell
function BareLayout({ children }) {
  return <>{children}</>;
}

function LegacyRedirect({ to }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const qs = searchParams.toString();
  const path = id ? `${to}/${id}` : to;
  return <Navigate to={`${path}${qs ? `?${qs}` : ""}`} replace />;
}

// Shown for the split-second a route chunk is still downloading. Kept in the
// site's own palette so navigating between pages never flashes white.
function RouteFallback() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f1729",
      }}
      role="status"
      aria-live="polite"
    >
      <span
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          border: "3px solid rgba(251,191,36,0.25)",
          borderTopColor: "#fbbf24",
          animation: "axxRouteSpin 0.8s linear infinite",
        }}
      />
      <style>{"@keyframes axxRouteSpin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  useDevToolsProtection();

  return (
    <Suspense fallback={<RouteFallback />}>
    <Routes>

      {/* ── PUBLIC ROUTES (have Navbar) ── */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/listings" element={<PublicLayout><Listings /></PublicLayout>} />
      <Route path="/listings/:id" element={<PublicLayout><PropertyDetailPage /></PublicLayout>} />

      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/user-login" element={<BareLayout><UserLogin /></BareLayout>} />
      <Route path="/user-register" element={<BareLayout><UserLogin defaultTab="register" /></BareLayout>} />
      <Route path="/about" element={<PublicLayout><AboutUs /></PublicLayout>} />
      <Route path="/reset-password/:token" element={<PublicLayout><ResetPassword /></PublicLayout>} />
      <Route path="/verify-email/:token" element={<PublicLayout><VerifyEmail /></PublicLayout>} />
      <Route path="/seller-login" element={<LegacyRedirect to="/quicksales-login" />} />
      <Route path="/quicksales-login" element={<PublicLayout><QuickSalesLogin /></PublicLayout>} />
      <Route path="/materials" element={<LegacyRedirect to="/quicksales" />} />
      <Route path="/materials/:id" element={<LegacyRedirect to="/quicksales" />} />
      <Route path="/quicksales" element={<PublicLayout><QuickSales /></PublicLayout>} />
      <Route path="/quicksales/:id" element={<PublicLayout><QuickSaleDetailPage /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/mobile-app" element={<PublicLayout><MobileAppDownload /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><TermsAndPrivacy /></PublicLayout>} />
      {/* Users page removed */}

      {/* ── NEW ACCOMMODATION BOOKING ROUTES ── */}
      <Route path="/accommodation-booking-search" element={<PublicLayout><AccommodationSearch /></PublicLayout>} />
      <Route path="/accommodation-booking-detail/:id" element={<PublicLayout><AccommodationBookingDetail /></PublicLayout>} />
      <Route
        path="/my-bookings"
        element={
          <DashboardLayout>
            <ProtectedRoute><AccommodationGuestDashboard /></ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/accommodation-leave-review"
        element={
          <DashboardLayout>
            <ProtectedRoute><AccommodationLeaveReview /></ProtectedRoute>
          </DashboardLayout>
        }
      />

      {/* ── ACCOMMODATION ROUTES (have Navbar) ── */}
      {/* IMPORTANT: specific /accommodation/* paths must come before /accommodation/:id */}
      <Route path="/accommodation" element={<PublicLayout><AccommodationPage /></PublicLayout>} />
      <Route path="/accommodation/login" element={<BareLayout><AccommodationLogin defaultTab="login" /></BareLayout>} />
      <Route path="/accommodation/register" element={<BareLayout><AccommodationLogin defaultTab="register" /></BareLayout>} />
      <Route path="/host-login" element={<BareLayout><AccommodationLogin defaultTab="login" /></BareLayout>} />
      <Route path="/host-register" element={<BareLayout><AccommodationLogin defaultTab="register" /></BareLayout>} />
      <Route path="/host-portal" element={<BareLayout><AccommodationLogin defaultTab="login" /></BareLayout>} />
      <Route path="/accommodation/listings" element={<PublicLayout><AccommodationListingsPage /></PublicLayout>} />
      <Route
        path="/accommodation/register-property"
        element={
          <BareLayout>
            <ProtectedRoute allowedRoles={["host", "agent", "admin"]} loginPath="/accommodation/login">
              <RegisterPropertyPage />
            </ProtectedRoute>
          </BareLayout>
        }
      />
      <Route
        path="/accommodation/dashboard"
        element={
          <AccommodationDashboardLayout>
            <ProtectedRoute allowedRoles={["host", "agent"]}>
              <ProviderDashboard />
            </ProtectedRoute>
          </AccommodationDashboardLayout>
        }
      />
      <Route
        path="/accommodation/dashboard/property/:id"
        element={
          <AccommodationDashboardLayout>
            <ProtectedRoute allowedRoles={["host", "agent"]}>
              <EditPropertyPage />
            </ProtectedRoute>
          </AccommodationDashboardLayout>
        }
      />
      <Route path="/accommodation/:id" element={<PublicLayout><AccommodationDetailPage /></PublicLayout>} />
      {/* Legacy alias: old links that used /accommodation/property/:id */}
      <Route path="/accommodation/property/:id" element={<PublicLayout><AccommodationDetailPage /></PublicLayout>} />
      <Route path="/become-agent" element={<PublicLayout><BecomeAgentPage /></PublicLayout>} />
      <Route path="/register-agency" element={<PublicLayout><RegisterAgencyPage /></PublicLayout>} />

      {/* ── AGENT ROUTES ── */}
      <Route path="/agent/register" element={<BareLayout><AgentRegister /></BareLayout>} />
      <Route path="/agent/login" element={<BareLayout><AgentLogin /></BareLayout>} />
      <Route path="/agent/profile/:id" element={<PublicLayout><AgentProfilePage /></PublicLayout>} />
      <Route
        path="/agent/dashboard"
        element={
          <BareLayout>
            <ProtectedRoute loginPath="/agent/login" allowedRoles={["agent"]}>
              <AgentDashboard />
            </ProtectedRoute>
          </BareLayout>
        }
      />

      {/* ── AGENCY ROUTES ── */}
      <Route
        path="/agency/dashboard"
        element={
          <BareLayout>
            <ProtectedRoute loginPath="/login" allowedRoles={["agency_admin"]}>
              <AgencyDashboard />
            </ProtectedRoute>
          </BareLayout>
        }
      />

      {/* ── AXXBIASHARA BUSINESS DIRECTORY ROUTES (have Navbar) ── */}
      <Route path="/axxbiashara" element={<PublicLayout><AxxBiashara /></PublicLayout>} />
      <Route path="/business-login" element={<BareLayout><BusinessLogin /></BareLayout>} />
      <Route path="/business-register" element={<BareLayout><BusinessRegister /></BareLayout>} />
      <Route
        path="/business/create"
        element={
          <DashboardLayout>
            <ProtectedRoute loginPath="/business-login" allowedRoles={["business", "admin"]}>
              <BusinessForm />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/business/edit/:id"
        element={
          <DashboardLayout>
            <ProtectedRoute loginPath="/business-login" allowedRoles={["business", "admin"]}>
              <BusinessForm />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route path="/business/:id" element={<PublicLayout><BusinessDetail /></PublicLayout>} />
      <Route
        path="/business-dashboard"
        element={
          <DashboardLayout>
            <ProtectedRoute loginPath="/business-login" allowedRoles={["business", "admin"]}>
              <UserDashboard />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />

      {/* ── DASHBOARD ROUTES (no Navbar) ── */}
      <Route
        path="/seller-dashboard"
        element={<LegacyRedirect to="/quicksales-dashboard" />}
      />
      <Route
        path="/quicksales-dashboard"
        element={
          <DashboardLayout preferSeller>
            <ProtectedRoute allowedRoles={["seller"]} loginPath="/quicksales-login" preferSeller>
              <QuickSalesDashboard />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/member"
        element={
          <PublicLayout>
            <ProtectedRoute loginPath="/user-login" allowedRoles={["member", "user"]}>
              <MemberDashboard />
            </ProtectedRoute>
          </PublicLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            <ProtectedRoute allowedRoles={["landlord", "provider"]}>
              <LandlordDashboard />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />


      <Route
        path="/upload"
        element={
          <DashboardLayout>
            <ProtectedRoute allowedRoles={["landlord", "agent"]}>
              <Upload />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/property/edit/:id"
        element={
          <DashboardLayout>
            <ProtectedRoute allowedRoles={["landlord", "agent", "admin"]}>
              <Upload />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/premium-plans"
        element={
          <DashboardLayout>
            <ProtectedRoute allowedRoles={["landlord"]}>
              <PremiumPlans />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <DashboardLayout>
            <ProtectedRoute allowedRoles={["landlord", "user", "seller"]}>
              <Checkout />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route path="/leave-review" element={<PublicLayout><LeaveReview /></PublicLayout>} />

      {/* ── USER ACCOUNT ROUTES (role-focused nav when logged in) ── */}
      <Route
        path="/profile"
        element={
          <DashboardLayout>
            <ProtectedRoute loginPath="/user-login"><ProfilePage /></ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <DashboardLayout>
            <ProtectedRoute loginPath="/user-login"><Settings /></ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/wallet"
        element={
          <DashboardLayout>
            <ProtectedRoute loginPath="/user-login"><WalletPage /></ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/verification"
        element={<Navigate to="/settings" replace />}
      />
      <Route
        path="/axxwallet"
        element={
          <PublicLayout>
            <AxxWallet />
          </PublicLayout>
        }
      />
      <Route
        path="/saved"
        element={
          <DashboardLayout>
            <ProtectedRoute loginPath="/user-login"><SavedListingsPage /></ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/messages"
        element={
          <DashboardLayout>
            <ProtectedRoute loginPath="/user-login"><MessagesPage /></ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/notifications"
        element={
          <DashboardLayout>
            <ProtectedRoute loginPath="/user-login"><NotificationsPage /></ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/payment-history"
        element={
          <DashboardLayout>
            <ProtectedRoute loginPath="/user-login"><PaymentHistory /></ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <DashboardLayout>
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />
      <Route
        path="/admin/verification"
        element={
          <DashboardLayout>
            <ProtectedRoute allowedRoles={["admin", "team"]}>
              <AdminVerification />
            </ProtectedRoute>
          </DashboardLayout>
        }
      />

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
              <div style={{ fontSize: "64px", marginBottom: "16px" }}></div>
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
    </Routes >
    </Suspense>
  );
}

export default App;