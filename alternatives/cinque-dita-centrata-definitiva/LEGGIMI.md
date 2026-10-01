# Cinque dita centrata — versione definitiva

Creata il 2026-10-01. Versione in `variants/cinque-dita-centrata/` (si apre con `?v=cinque-dita-centrata`).
Uguale a Cinque dita (`alternatives/cinque-dita-definitiva`), con una differenza: nella classifica non c'è la
mano che si accende accanto alle posizioni, le 5 righe sono al centro. La mano del logo compare solo al
salvataggio, già tutta accesa, per il "batti cinque" e "Classifica completata!". Anche nel salvaschermo le
classifiche sono centrate e senza mano. La mano resta come avanzamento nella configurazione iniziale.

Ripristino (copia ogni file al suo posto togliendo `.bak`):

    cd alternatives/cinque-dita-centrata-definitiva
    for f in $(find . -name '*.bak'); do cp "$f" "../../variants/cinque-dita-centrata/${f%.bak}"; done
