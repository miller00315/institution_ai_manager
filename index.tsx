import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize i18n before rendering the app
import './i18n';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Prevent page reload on visibility change in production
if (typeof window !== 'undefined') {
  let isReloading = false;
  
  // Prevent reload when tab becomes visible
  window.addEventListener('pageshow', (event) => {
    // If page was loaded from cache (back/forward), don't reload
    if (event.persisted) {
      isReloading = false;
    }
  });
  
  // Prevent reload on focus
  window.addEventListener('focus', () => {
    isReloading = false;
  });
  
  // Override any potential reload attempts
  const originalReload = window.location.reload;
  window.location.reload = function(forcedReload?: boolean) {
    if (isReloading) {
      return;
    }
    // Only allow reload if explicitly forced (like in setup screen)
    if (forcedReload === true) {
      isReloading = true;
      originalReload.call(window.location);
    }
  };
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
