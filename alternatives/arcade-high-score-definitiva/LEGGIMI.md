# Arcade — "High Score" — versione definitiva

Creata il 2026-09-29. Sostituisce nello spirito `arcade-power-up.patch` (che resta come archivio).
Concept: una Top 5 è già la classifica dei record dei cabinati anni '80; l'app è lo schermo di un cabinato.

Ripristino (copia ogni file al suo posto togliendo `.bak`):

    cd alternatives/arcade-high-score-definitiva
    for f in $(find . -name '*.bak'); do cp "$f" "../../${f%.bak}"; done

Pezzi:
- `pixelFont.ts` (+ test): font a pixel 5x7 disegnato a mano, con righe per gli accenti italiani
- `components/Pixel.tsx`: PixelText (lettere che si accendono con lampo bianco), PixelInput (input vero
  invisibile + testo a pixel con cursore a blocco nella posizione reale), PixelButton (menu che si inverte)
- `arcade.ts`: colori dei fosfori, easing a scatti, suoni 8-bit sintetizzati (blip, select, fanfara, gettone)
  con interruttore ON/OFF nelle impostazioni (salvato in localStorage)
- schermo CRT in CSS: righe del tubo, vignettatura, bagliore, cornici a pixel con angoli a gradino
- griglia "scegli il livello": freccia ► al passaggio, color cycling alla scelta, trasformazione riquadro →
  pagina in 8 fotogrammi a scatti
- dettaglio = tabella dei record: righe colorate, ► sulla riga attiva, salvataggio con righe che si invertono
  dalla 5 alla 1, "NUOVO RECORD!" a colori ciclici e fanfara
- salvaschermo = attract mode: accensione/spegnimento da tubo catodico, logo + INSERT COIN, poi le
  classifiche completate che si riscrivono da sole; deriva lenta anti-bruciatura
- tiene i fix: flushSync nei cambi schermata, niente tap durante la trasformazione, focus del titolo,
  voci non salvate conservate quando si cambia il titolo

Aggiornamento per il TV da 53" del podcast (ripresa nel totale):
- nome ospite protagonista (fino a ~160px a 1080p), logo ridotto
- tolte le micro-etichette in onda ("OSPITE", "TOP 5", "N°", "POS/NOME", "tocca per continuare", "MIGLIORI 5")
- classifica e salvaschermo con testi grandi; "NUOVO RECORD!" → "CLASSIFICA COMPLETATA!"
- testo a pixel centrato davvero: righe accenti fuori dal box, contenitore flex (niente riga di testo del
  browser), compensazione delle colonne vuote di prima/ultima lettera, spazi tra parole come column-gap
  (misurato: pulsanti e caselle entro 1px dal centro)
- logo del format 3 volte più grande (inchiostro ~516px a 1080p), vuoti del disegno recuperati con margini negativi
- salvaschermo: tolto "INSERT COIN", campo di stelle a pixel (canvas, 3 piani, lampeggio a scatti) dietro logo e classifiche
- più respiro attorno al nome (~70px dal logo, ~84px dalle caselle a 1080p), margine verticale dell'app ridotto per non scorrere con nomi su due righe
- voci lunghe: PixelInput con 'fit' (Pixel.tsx) — una riga sola, testo rimpicciolito fino al 60% (calcolo esatto: font monospaziato), poi limite invisibile; PixelFitText nel salvaschermo; colonne con minmax(0,1fr)
- impostazioni: tasto invisibile fisso nell'angolo in alto a destra dello schermo (96×96, quadrato); nel pannello anche nome ospite, "Svuota" per le classifiche completate e "Nuova puntata" con doppia conferma (App: handleResetRanking, handleNewEpisode)
