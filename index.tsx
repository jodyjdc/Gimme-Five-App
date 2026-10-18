// Punto d'ingresso: ?v=<versione> avvia quella versione, altrimenti si apre la pagina di scelta.
// Ogni versione è caricata da sola (import dinamico), così stili e font non si mescolano.
const variants = import.meta.glob<{ mount: (root: HTMLElement) => void }>('./variants/*/main.tsx');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const requested = new URLSearchParams(window.location.search).get('v');
const loadVariant = requested ? variants[`./variants/${requested}/main.tsx`] : undefined;

// Dopo una pubblicazione su Vercel i file della versione precedente spariscono: una pagina aperta (o caricata
// a metà aggiornamento) non li trova più e si bloccherebbe. In quel caso si ricarica da sola, una volta sola
// per minuto per non entrare in un giro infinito se il problema è un altro (es. rete assente).
const reloadAfterUpdate = () => {
  const last = Number(window.sessionStorage.getItem('gimme-five:ricarica') ?? 0);
  if (Date.now() - last < 60_000) return;
  window.sessionStorage.setItem('gimme-five:ricarica', String(Date.now()));
  window.location.reload();
};
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  reloadAfterUpdate();
});

(loadVariant ?? (() => import('./launcher/Launcher')))().then(({ mount }) => mount(rootElement), reloadAfterUpdate);
