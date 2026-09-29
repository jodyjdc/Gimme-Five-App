import React from 'react';
import ReactDOM from 'react-dom/client';
import { Logo } from '../variants/liquid-glass/components/Logo';
import { VERSIONS } from './versions';
import './launcher.css';

// Pagina di scelta: si apre quando l'indirizzo non indica una versione (?v=...).
// Ogni scheda è un link normale: la versione si avvia in una pagina pulita, con solo i suoi stili.
const Launcher: React.FC = () => (
  <main className="launcher">
    <div className="launcher-logo">
      <Logo />
    </div>
    <h1>Scegli la versione</h1>
    <ul className="launcher-grid">
      {VERSIONS.map((version) => (
        <li key={version.key}>
          <a className="launcher-card" href={`?v=${version.key}`}>
            <img src={`/previews/${version.key}.jpg`} alt="" loading="lazy" />
            <span className="launcher-name">{version.name}</span>
            <span className="launcher-description">{version.description}</span>
          </a>
        </li>
      ))}
    </ul>
  </main>
);

export const mount = (rootElement: HTMLElement) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400..800&display=swap';
  document.head.appendChild(link);
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Launcher />
    </React.StrictMode>
  );
};
