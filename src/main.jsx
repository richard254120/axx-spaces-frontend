import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import ReactGA from 'react-ga4'
import 'leaflet/dist/leaflet.css'
import './index.css'

// Initialize Google Analytics
ReactGA.initialize('G-9J06HNJ4T1')

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