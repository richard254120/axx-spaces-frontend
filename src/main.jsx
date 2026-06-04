import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import ReactGA from 'react-ga4'
import { SpeedInsights } from '@vercel/speed-insights/react'
import 'leaflet/dist/leaflet.css'
import './index.css'

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (GA_ID) ReactGA.initialize(GA_ID);

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
      <SpeedInsights />
    </AuthProvider>
  </BrowserRouter>
)