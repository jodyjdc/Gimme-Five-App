# Game Show Neon — versione definitiva ("regia da studio TV")

Salvata il 2026-09-29. È l'evoluzione di `game-show-neon.patch` (quella originale resta come archivio).

Contenuto: copie complete dei file che definiscono la variante, con estensione `.bak`
(così TypeScript non le compila). Per ripristinarla, copiare ogni file al suo posto togliendo `.bak`:

    cd alternatives/game-show-neon-definitiva
    for f in $(find . -name '*.bak'); do cp "$f" "../../${f%.bak}"; done

Caratteristiche:
- la casella scelta si trasforma nel pannello titolo (layoutId), e viceversa al ritorno/salvataggio
- un solo faro che si sposta sulla casella scelta, le altre si abbassano
- numeri 1–5 che girano come un tabellone, linea ciano sotto il campo attivo
- salvataggio: le righe si bloccano dalla 5 alla 1 con lampo rosa
- font Inter (variante con Big Shoulders Display provata e scartata)
- fix: cambi schermata con flushSync (forma fluida), niente hover durante la trasformazione,
  focus del titolo in modifica, voci non salvate conservate quando si cambia il titolo
- voci lunghe: FitInput (components/FitInput.tsx) — testo rimpicciolito fino al 70%, poi limite invisibile; campo ad altezza fissa
- impostazioni: tasto invisibile fisso nell'angolo in alto a destra dello schermo (96×96, quadrato); nel pannello anche nome ospite, "Svuota" per le classifiche completate e "Nuova puntata" con doppia conferma (App: handleResetRanking, handleNewEpisode)
