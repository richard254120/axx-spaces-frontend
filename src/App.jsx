import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import Login from "./pages/Login";
import Upload from "./pages/Upload";
import LandlordDashboard from "./pages/LandlordDashboard";
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/dashboard" element={<LandlordDashboard />} />
      </Routes>
    </>
  );
}

export default App;