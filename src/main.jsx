import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import './index.css'

// ✅ StrictMode removed — it caused useEffect to fire twice in dev,
// which made the FloatingWhatsApp cleanup remove itself on mount.
// StrictMode only affects development, not production builds.
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)