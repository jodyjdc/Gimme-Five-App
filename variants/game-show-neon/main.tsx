import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Avvio della versione: i suoi font e i suoi stili si caricano solo quando è stata scelta.
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap';

export const mount = (rootElement: HTMLElement) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = FONTS;
  document.head.appendChild(link);
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};
