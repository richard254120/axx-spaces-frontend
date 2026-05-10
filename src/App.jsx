import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import LandlordDashboard from "./pages/LandlordDashboard";
import MoverDashboard from "./pages/MoverDashboard"; 
import Movers from "./pages/Movers"; // ✅ ADD THIS IMPORT

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
        <Route path="/movers" element={<Movers />} /> {/* ✅ ADD THIS ROUTE */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<Upload />} />
        
        {/* LANDLORD ROUTES */}
        <Route path="/dashboard" element={<LandlordDashboard />} />
        
        {/* MOVER ROUTES */}
        <Route path="/mover-dashboard" element={<MoverDashboard />} /> 
        
        {/* PREMIUM ROUTES */}
        <Route path="/premium-plans" element={<PremiumPlans />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </>
  );
}

export default App;