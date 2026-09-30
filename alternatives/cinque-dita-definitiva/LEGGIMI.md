# Cinque dita — versione definitiva

Creata il 2026-09-30. Versione in `variants/cinque-dita/` (si apre con `?v=cinque-dita`).
Concept: sul nero pieno dello studio (la cornice del TV sparisce) restano solo insegne al neon.
La mano del logo diventa un'insegna: le 5 dita sono le 5 posizioni (si conta all'italiana, pollice = 1).

Ripristino (copia ogni file al suo posto togliendo `.bak`):

    cd alternatives/cinque-dita-definitiva
    for f in $(find . -name '*.bak'); do cp "$f" "../../variants/cinque-dita/${f%.bak}"; done

Pezzi:
- `hand.ts`: il tracciato della mano del logo, diviso in zone (pollice, indice, medio, anulare, mignolo, palmo)
  tagliate negli incavi tra le dita; usato anche da `components/Logo.tsx`
- `components/NeonHand.tsx`: vetro spento sotto, zone accese sopra (accensione con sfarfallio, dito "in
  preriscaldamento" che pulsa, palmo a mezza luce finché non sono accese tutte e cinque le dita)
- `components/neon.ts`: tubo al neon fatto con le ombre del bordo (stessa struttura acceso/spento, così si sfuma)
- colori: ciano = acceso / in corso, magenta = completato (i due colori del logo e delle tazze)
- principale: logo, nome, poi 5 anelli che si accendono in sequenza; l'anello scelto diventa il titolo
- classifica: mano accanto alle posizioni; Salva = "batti cinque" (dita accese in fila, tutto magenta, mano
  al centro con colpo e raggi, "Classifica completata!")
- configurazione: la mano fa da avanzamento (palmo = ospite, dita = classifiche)
- salvaschermo: logo e classifiche completate con la mano magenta, deriva lenta anti-bruciatura
- tiene i fix: flushSync nei cambi schermata, niente gesture durante la trasformazione, focus del titolo,
  voci lunghe che si rimpiccioliscono (FitInput, misura di layout e non a schermo)
