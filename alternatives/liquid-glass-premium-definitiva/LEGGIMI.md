# Liquid Glass Premium — versione definitiva

Salvata il 2026-09-29. Evoluzione di `liquid-glass-premium.patch` (l'originale resta come archivio),
costruita sulla struttura di `game-show-neon-definitiva` (stessa trasformazione casella → titolo e stessi bugfix).

Ripristino (copia ogni file al suo posto togliendo `.bak`):

    cd alternatives/liquid-glass-premium-definitiva
    for f in $(find . -name '*.bak'); do cp "$f" "../../${f%.bak}"; done

Caratteristiche:
- materiale vetro in CSS (`.glass`, `.glass-tint` in styles.css): riflesso interno, bordo iridescente 1px,
  ombra morbida; niente backdrop-filter (lo sfondo è già sfocato, costerebbe GPU senza vedersi)
- luce sul vetro che segue il puntatore (variabili CSS --glass-x/--glass-y con transizione)
- molla "liquida" per la trasformazione (liquidMorphSpring, rimbalzo 0.22)
- numeri sottili (Inter 200) con sfumatura bianca, titoli semibold
- palette fredda: bianco e ciano, il rosa dello sfondo diventa indaco
- salvataggio: lama di luce che attraversa le righe dalla 5 alla 1
- pulsanti: "Salva" bianco pieno, "Indietro" in vetro
- fix: nessun puntino residuo della linea di focus quando il salvataggio disattiva i campi
- voci lunghe: FitInput (components/FitInput.tsx) — testo rimpicciolito fino al 70%, poi limite invisibile; campo ad altezza fissa
- impostazioni: tasto invisibile fisso nell'angolo in alto a destra dello schermo (96×96, quadrato); nel pannello anche nome ospite, "Svuota" per le classifiche completate e "Nuova puntata" con doppia conferma (App: handleResetRanking, handleNewEpisode)
