import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import './index.css'

// Optional: Add global error handler to reduce console spam / info leaking
window.addEventListener('error', (event) => {
  if (import.meta.env.PROD) {
    event.preventDefault(); // Prevent some errors from showing in console
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)