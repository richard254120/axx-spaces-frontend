import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import FloatingWhatsApp from "./components/FloatingWhatsApp"; // ✅ Floating WhatsApp button

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

// Premium pages
import PremiumPlans from "./pages/PremiumPlans";
import Checkout from "./pages/Checkout";

import "leaflet/dist/leaflet.css";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/movers" element={<Movers />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/about" element={<AboutUs />} />

        {/* LANDLORD ROUTES */}
        <Route path="/dashboard" element={<LandlordDashboard />} />

        {/* MOVER ROUTES */}
        <Route path="/mover-dashboard" element={<MoverDashboard />} />

        {/* PREMIUM ROUTES */}
        <Route path="/premium-plans" element={<PremiumPlans />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* PASSWORD RESET ROUTE */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 404 CATCH-ALL */}
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
            <a href="/" style={{
              padding: "12px 28px",
              background: "#3b82f6",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 700,
            }}>
              Go Home
            </a>
          </div>
        } />
      </Routes>

      {/* ✅ Floating WhatsApp — visible on every page */}
      <FloatingWhatsApp />
    </>
  );
}

export default App;