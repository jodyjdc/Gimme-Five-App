// Punto d'ingresso: ?v=<versione> avvia quella versione, altrimenti si apre la pagina di scelta.
// Ogni versione è caricata da sola (import dinamico), così stili e font non si mescolano.
const variants = import.meta.glob<{ mount: (root: HTMLElement) => void }>('./variants/*/main.tsx');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const requested = new URLSearchParams(window.location.search).get('v');
const loadVariant = requested ? variants[`./variants/${requested}/main.tsx`] : undefined;

(loadVariant ?? (() => import('./launcher/Launcher')))().then(({ mount }) => mount(rootElement));
