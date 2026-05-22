import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import 'leaflet/dist/leaflet.css'  // ← must come before index.css
import './index.css'

// Suppress error details from leaking in production
window.addEventListener('error', (event) => {
  if (import.meta.env.PROD) {
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)