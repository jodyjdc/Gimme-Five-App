# Gimme Five

Web app per il podcast: cinque classifiche Top 5 dell'ospite, mostrate su un TV durante la registrazione.

## Versioni grafiche

All'apertura il sito mostra la **pagina di scelta**: si sceglie una delle 7 versioni e si avvia
all'indirizzo `/?v=<versione>` (ricaricando la pagina si resta sulla stessa versione).
Per cambiare versione: impostazioni → "Cambia versione", oppure aprire di nuovo l'indirizzo senza `?v=`.

| `?v=` | Versione |
|---|---|
| `liquid-glass` | Liquid Glass — vetro che rifrange la luce (rifrazione vera solo in Chrome/Edge) |
| `serigrafia` | Serigrafia — poster stampato dal vivo |
| `arcade` | Arcade — cabinato anni '80, font a pixel e suoni 8-bit |
| `cinematic` | Cinematic — sala buia e pellicola |
| `tabellone` | Tabellone luminoso — quiz TV anni '70 |
| `game-show-neon` | Game Show Neon — prima versione |
| `liquid-glass-premium` | Liquid Glass Premium — prima versione |

**Impostazioni** (in ogni versione): tasto invisibile nell'angolo in alto a destra della schermata
principale. Nome ospite, grandezza del nome, titoli e parole delle classifiche, "Svuota" per le
classifiche completate, "Nuova puntata", "Cambia versione".

## Struttura

- `index.tsx` — legge `?v=` e carica solo la versione scelta (import dinamico), oppure la pagina di scelta
- `launcher/` — pagina di scelta (`versions.ts` = elenco delle versioni)
- `variants/<versione>/` — ogni versione è una mini-app completa (App, componenti, stili, font in `main.tsx`)
- `public/previews/` — anteprime della pagina di scelta
- `alternatives/` — archivio storico delle varianti (patch originali e copie `.bak`)

## Sviluppo

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm test
npm run build
```
