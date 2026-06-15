import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './components/NotificationSystem'
import ReactGA from 'react-ga4'
import { SpeedInsights } from '@vercel/speed-insights/react'
import 'leaflet/dist/leaflet.css'
import './index.css'

// Initialize Google Analytics
ReactGA.initialize('G-9J06HNJ4T1')

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <SpeedInsights />
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
)