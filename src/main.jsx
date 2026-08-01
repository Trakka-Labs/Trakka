import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

try {
  localStorage.removeItem('trakka_preview_deliveries')
  localStorage.removeItem('trakka_business_session')
} catch {
  // Storage may be unavailable in hardened browser contexts.
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
