# Liquid Glass — rifatta da zero — versione definitiva

Creata il 2026-09-29. Diversa da `liquid-glass-premium-definitiva` (che resta come archivio): lì il vetro era
solo sfocato; qui RIFRANGE davvero lo sfondo, come una lente spessa.

Ripristino (copia ogni file al suo posto togliendo `.bak`):

    cd alternatives/liquid-glass-da-zero-definitiva
    for f in $(find . -name '*.bak'); do cp "$f" "../../${f%.bak}"; done

Pezzi:
- `components/Glass.tsx`: <Glass> = lastra con filtro SVG proprio (mappa di spostamento grande quanto la
  lastra, neutra al centro, inclinata ai bordi) usato come backdrop-filter → lo sfondo si piega lungo il bordo.
  Funziona in Chrome/Edge; altrove ripiega sulla sfocatura. Misurato: 120 fps su Mac M2 con scheda grafica.
  <LightField> = sfondo: tre grandi luci (ciano, rosa, viola) che derivano lente + increspature concentriche
  sottili che si allargano come una goccia nell'acqua (la "trama" che il vetro piega)
- font: Inter Tight, bianco puro
- principale: logo grande, nome ~162px che emerge dal buio, caselle di vetro con numeri sottili; la casella
  scelta si trasforma nella lastra del titolo (layoutId, molla liquida) e viceversa
- classifica: numeri in lenti di vetro rotonde; salvataggio: le lenti si riempiono di luce 5→1, le luci di
  sfondo salgono e le increspature accelerano, le righe si ritirano e arriva la lastra "Classifica completata"
- configurazione: tutta dentro una lastra, avanzamento a goccia di luce, pulsante bianco
- impostazioni: lastra che scende e si posa
- salvaschermo: logo grande davanti alle luci, una grande lente attraversa lentamente lo schermo piegando
  tutto ciò che ha dietro; a rotazione le classifiche completate
- regole TV 53" rispettate, posizioni con numeri, fix mantenuti
- sfondo attenuato: luci al 24% (viola 16%) e più lente, bordi scuriti (vignettatura), increspature al 7% e più lente; al salvataggio le luci salgono solo al 50%
- vetro più limpido: tolto il velo biancastro uniforme (sui pannelli grandi sembrava un rettangolo lattiginoso),
  restano solo riflessi sui bordi e una lucentezza morbida dall'alto; configurazione senza pannello
- riga selezionata: anello di luce SOPRA la lente (dietro veniva rifratto in macchie); niente dischetto interno
- righe della classifica senza filtro residuo a fine ingresso (un filter, anche blur(0px), toglie lo sfondo al vetro);
  al salvataggio spariscono del tutto dietro la lastra finale
- voci lunghe: `components/FitInput.tsx` (FitInput per i campi, FitText per il salvaschermo). Il testo si
  rimpicciolisce per stare tutto nel campo fino al 55%; oltre, i caratteri non vengono accettati (limite invisibile
  basato sulla larghezza reale del testo, un incollato troppo lungo viene tagliato). Misurato: 0px nascosti,
  righe di altezza costante, ~54 caratteri di testo normale
- impostazioni: tasto invisibile fisso nell'angolo in alto a destra dello schermo (96×96, quadrato); nel pannello anche nome ospite, "Svuota" per le classifiche completate e "Nuova puntata" con doppia conferma (App: handleResetRanking, handleNewEpisode)
