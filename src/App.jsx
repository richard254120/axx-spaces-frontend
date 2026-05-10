import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import LandlordDashboard from "./pages/LandlordDashboard";
import PremiumPlans from "./pages/PremiumPlans";
import Checkout from "./pages/Checkout";
import Movers from "./pages/Movers";
import MoverRegister from "./pages/MoverRegister";   // ← NEW

import "leaflet/dist/leaflet.css";

function App() {
  return (
    <AuthProvider>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/dashboard" element={<LandlordDashboard />} />
        <Route path="/premium-plans" element={<PremiumPlans />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/movers" element={<Movers />} />
        <Route path="/mover-register" element={<MoverRegister />} />   {/* ← NEW */}
      </Routes>
    </AuthProvider>
  );
}

export default App;