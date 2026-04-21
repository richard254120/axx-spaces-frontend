#!/bin/bash

echo "🚀 Setting up Axx Spaces Frontend..."

# Create folders
mkdir -p src/pages src/components src/api src/layouts

# Create files
touch src/pages/Home.jsx
touch src/pages/Listings.jsx
touch src/api/api.js
touch src/App.jsx
touch src/main.jsx
touch src/index.css

# ------------------ FILE CONTENT ------------------

# main.jsx
cat > src/main.jsx <<EOL
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
EOL

# App.jsx
cat > src/App.jsx <<EOL
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Listings from "./pages/Listings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/listings" element={<Listings />} />
    </Routes>
  );
}

export default App;
EOL

# Home.jsx
cat > src/pages/Home.jsx <<EOL
export default function Home() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Axx Spaces 🏠</h1>
      <p>Find rental spaces in Kenya</p>
      <input placeholder="Search location..." />
    </div>
  );
}
EOL

# Listings.jsx
cat > src/pages/Listings.jsx <<EOL
export default function Listings() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Listings Page</h1>
      <p>Properties will appear here</p>
    </div>
  );
}
EOL

# API file
cat > src/api/api.js <<EOL
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default API;
EOL

# CSS
cat > src/index.css <<EOL
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #111;
  color: white;
}
EOL

echo "✅ Frontend setup complete!"
