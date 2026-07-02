// src/main.jsx - ADVANCED VERSION
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import "./axiosSetup";

// ✅ SMART AUTO LOGOUT - Tab close par logout, Refresh par nahi
let isRefreshing = false;

// Detect refresh
window.addEventListener('beforeunload', () => {
  // Check if this is a refresh using performance API
  const navigation = performance?.getEntriesByType?.('navigation')?.[0];
  const isRefresh = navigation?.type === 'reload';
  
  if (!isRefresh && !isRefreshing) {
    const rememberMe = localStorage.getItem('remember_me');
    
    if (rememberMe !== 'true') {
      // Sirf tab close par clear karo
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});

window.addEventListener('pagehide', () => {
  isRefreshing = true;
  setTimeout(() => {
    isRefreshing = false;
  }, 100);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)