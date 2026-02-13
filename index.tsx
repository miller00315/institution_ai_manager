import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize i18n before rendering the app
import './i18n';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Error boundary for production
const root = ReactDOM.createRoot(rootElement);

// Catch and log any rendering errors
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error rendering app:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Erro ao carregar aplicação</h1>
      <p>Por favor, recarregue a página.</p>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
