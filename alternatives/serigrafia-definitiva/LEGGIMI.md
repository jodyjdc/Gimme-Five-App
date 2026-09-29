# Serigrafia — versione definitiva

Creata il 2026-09-29. Concept: l'app è un poster serigrafico stampato dal vivo su carta nera,
con i due inchiostri del logo (ciano #00d0ff, rosa #ff64c4) più il bianco.

Ripristino (copia ogni file al suo posto togliendo `.bak`):

    cd alternatives/serigrafia-definitiva
    for f in $(find . -name '*.bak'); do cp "$f" "../../${f%.bak}"; done

Tecniche:
- registro di stampa: ogni testo grande è tre lastre (classe `.ink`, pseudo-elementi con content: attr(data-text));
  la variabile --reg è quanto sono fuori registro, animata da Motion
- tipografia viva: font variabile Anybody (assi wdth/wght); `PrintedText` stampa lettera per lettera,
  da larga/sottile/fuori registro a stretta/nera/a registro; si ristampano solo le lettere cambiate
- faro a retino (halftone) al posto dei bagliori; grana carta statica (SVG feTurbulence)
- biglietti con tacche (mask CSS); il biglietto scelto si trasforma nel pannello titolo (layoutId)
- salvataggio: timbro "TOP 5 ✓" con bordi d'inchiostro irregolari (feDisplacementMap) che si schianta,
  esplosione di retino e contraccolpo del foglio
- voci: si scrive in chiaro, a fine riga (Invio o click altrove) la voce viene "stampata"; Invio passa alla riga dopo
- tiene tutti i fix: flushSync nei cambi schermata, niente hover durante la trasformazione,
  focus del titolo, voci non salvate conservate
- configurazione iniziale, menu impostazioni e salvaschermo nello stesso stile:
  titolo di ogni passo stampato, avanzamento a biglietti, campi a riga tratteggiata, pannello impostazioni
  con ombra ciano sfalsata; salvaschermo con due retini che girano (moiré) e nastro "Gimme Five ✦ Top 5"
- testo stampato a due strati: la copia invisibile finale tiene lo spazio, niente salti di layout durante la stampa
- voci lunghe: FitInput (components/FitInput.tsx), misurato sulla versione stampata (più larga); il testo si rimpicciolisce fino al 75%, poi limite invisibile; la voce stampata segue la stessa scala
- impostazioni: tasto invisibile fisso nell'angolo in alto a destra dello schermo (96×96, quadrato); nel pannello anche nome ospite, "Svuota" per le classifiche completate e "Nuova puntata" con doppia conferma (App: handleResetRanking, handleNewEpisode)
