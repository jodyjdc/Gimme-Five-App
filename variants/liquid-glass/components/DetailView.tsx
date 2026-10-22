import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, animate, motion, useMotionValue } from 'motion/react';
import { Ranking } from '../types';
import { Glass, trackGlassLight } from './Glass';
import { FitInput, FitText } from './FitInput';
import { easeOutQuint, liquidMorphSpring } from '../motionConfig';

interface DetailViewProps {
  ranking: Ranking;
  boxId: number | null;
  onTitleChange: (title: string) => void;
  onSave: (id: number, entries: string[]) => void;
  onBack: () => void;
  /** Posizioni non salvate da riprendere (dopo una ricarica della pagina). */
  initialEntries?: string[] | null;
  /** Ogni modifica alle posizioni, per il salvataggio automatico. */
  onDraftChange?: (entries: string[]) => void;
}

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.45,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(10px)' },
  // A fine ingresso il filtro va tolto del tutto: anche "blur(0px)" impedirebbe alle lenti di vedere lo sfondo.
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: easeOutQuint }, transitionEnd: { filter: 'none' } },
};

// Stesso raggio della casella: la lastra cambia solo proporzioni mentre si trasforma.
const TILE_RADIUS = 40;

// Salvataggio: le lenti dei numeri si riempiono di luce 5→1, le luci di sfondo salgono,
// arriva la lastra "Classifica completata", poi si torna al tabellone (la lastra del titolo torna casella).
const FILL_STEP = 0.12;
const CARD_AT = 4 * FILL_STEP + 0.4;
const SAVE_DELAY_MS = (CARD_AT + 1.9) * 1000;

// Classifica alla cieca: lo slot sotto il puntatore mentre si trascina la cosa svelata.
const slotAt = (x: number, y: number) => {
  for (const element of document.elementsFromPoint(x - window.scrollX, y - window.scrollY)) {
    const slot = (element as HTMLElement).closest?.('[data-slot]');
    if (slot) return Number(slot.getAttribute('data-slot'));
  }
  return null;
};

// Cosa svelata sulla lastra: il più grande possibile (va a capo tra parole), leggibile nel totale.
const revealSizeClass = (text: string) => {
  if (text.length > 22) return 'text-4xl';
  if (text.length > 12) return 'text-5xl';
  return 'text-6xl';
};

// Il mazzo accanto agli slot: lastre ancora coperte impilate dietro quella in cima.
const DECK_SIZE = 'min(24rem, 24vw)';

export const DetailView: React.FC<DetailViewProps> = ({ ranking, boxId, onTitleChange, onSave, onBack, initialEntries, onDraftChange }) => {
  const [entries, setEntries] = useState<string[]>(['', '', '', '', '']);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const saveButtonRef = useRef<HTMLDivElement>(null);

  // Classifica alla cieca: le 5 cose escono nell'ordine scritto dall'host; quella svelata va messa in uno
  // slot libero (trascinandola o premendo 1-5) prima di svelare la successiva. Una volta messa resta lì.
  // (Se le 5 cose non sono tutte scritte, la classifica si comporta da normale: niente svelamenti a vuoto.)
  const isBlind = ranking.mode === 'blind' && ranking.blindItems?.length === 5 && ranking.blindItems.every(item => item.trim() !== '');
  const blindItems = ranking.blindItems ?? [];
  const placedCount = entries.filter(entry => entry.trim() !== '').length;
  const [isRevealed, setIsRevealed] = useState(false);
  const [hoverSlot, setHoverSlot] = useState<number | null>(null);
  const revealedItem = isBlind && isRevealed ? blindItems[placedCount] ?? null : null;
  const isBlindDone = isBlind && placedCount === 5;

  const handleReveal = () => {
    if (!isBlind || isRevealed || isSaving || placedCount >= 5) return;
    setIsRevealed(true);
  };

  const handlePlace = (slot: number) => {
    if (revealedItem === null || isSaving || entries[slot]?.trim()) return;
    const next = entries.map((entry, index) => (index === slot ? revealedItem : entry));
    setEntries(next);
    onDraftChange?.(next);
    setIsRevealed(false);
    setHoverSlot(null);
  };

  // Solo al cambio di classifica: modificare il titolo cambia `ranking` e cancellerebbe le voci non salvate.
  useEffect(() => {
    setEntries(initialEntries ?? ranking.entries);
  }, [ranking.id]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      document.documentElement.classList.remove('lg-surge');
    };
  }, []);

  const handleInputChange = (index: number, value: string) => {
    const next = entries.map((entry, entryIndex) => entryIndex === index ? value : entry);
    setEntries(next);
    onDraftChange?.(next);
  };

  // Tasti rapidi: Esc toglie il cursore dalla riga (un secondo Esc torna al tabellone), Cmd/Ctrl+Invio salva.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isSaving || isEditingTitle) return;
      if (event.key === 'Escape') {
        const active = document.activeElement;
        if (active instanceof HTMLElement && active !== document.body) active.blur();
        else onBack();
      } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (!isBlind || isBlindDone) handleSaveClick();
      } else if (isBlind && (event.key === ' ' || event.key === 'Enter')) {
        // Alla cieca: barra spaziatrice o Invio svelano la cosa successiva.
        event.preventDefault();
        handleReveal();
      } else if (isBlind && /^[1-5]$/.test(event.key)) {
        event.preventDefault();
        handlePlace(Number(event.key) - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Invio passa alla riga successiva; dall'ultima va su Salva.
  const handleEntryKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    const next = inputRefs.current[index + 1];
    if (next) {
      next.focus();
    } else {
      saveButtonRef.current?.focus();
    }
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();
      setIsEditingTitle(false);
    }
  };

  const handleSaveClick = () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    document.documentElement.classList.add('lg-surge');
    saveTimeoutRef.current = window.setTimeout(() => {
      document.documentElement.classList.remove('lg-surge');
      onSave(ranking.id, entries);
    }, SAVE_DELAY_MS);
  };

  const titleClasses = "font-tight lg-text-glow text-6xl font-bold leading-tight tracking-tight text-white sm:text-7xl";

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center">
      <header className="mb-12 w-full">
        <Glass
          layoutId={boxId === null ? undefined : `box-${boxId}`}
          radius={TILE_RADIUS}
          depth={120}
          frost={0}
          className="flex min-h-[10rem] w-full items-center justify-center px-14 py-10 text-center"
          transition={{ layout: liquidMorphSpring }}
          // Una lastra sola: niente dissolvenza tra pannello e casella, e tornando al tabellone questa sparisce
          // subito (al suo posto parte la casella).
          layoutCrossfade={false}
          exit={{ opacity: 0, transition: { duration: 0 } }}
        >
          <AnimatePresence mode="wait">
            {isEditingTitle ? (
              <motion.input
                key="title-input"
                // Il campo appare solo dopo l'uscita del titolo (mode="wait"): il focus va dato al montaggio.
                autoFocus
                type="text"
                value={ranking.fullTitle}
                onChange={(event) => onTitleChange(event.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={handleTitleKeyDown}
                className={`${titleClasses} w-full bg-transparent text-center caret-[var(--lg-cyan)] outline-none placeholder-white/25`}
                placeholder="Titolo classifica"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              />
            ) : (
              <motion.h1
                key="title-display"
                className={`${titleClasses} cursor-text`}
                title="Doppio click per modificare"
                onDoubleClick={() => setIsEditingTitle(true)}
                initial={{ opacity: 0, filter: 'blur(12px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                // Uscita rapida: il campo di modifica compare solo dopo (mode="wait").
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                // Entra quando la lastra ha quasi finito di allargarsi: dentro una forma che si stira verrebbe deformato.
                transition={{ duration: 0.6, ease: easeOutQuint, delay: 0.6 }}
              >
                {ranking.fullTitle || 'Titolo classifica'}
              </motion.h1>
            )}
          </AnimatePresence>
        </Glass>
      </header>

      {/* Blocco centrato: colonna delle lenti numerate + colonna delle voci a larghezza fissa. */}
      {/* Quando arriva la lastra finale le righe si ritirano: il vetro piega solo luci e increspature, la scritta resta nitida. */}
      <motion.div
        className="w-full"
        initial={false}
        animate={{ opacity: isSaving ? 0 : 1 }}
        transition={{ duration: 0.5, delay: isSaving ? CARD_AT - 0.2 : 0 }}
      >
      {/* Alla cieca: righe a sinistra e mazzo a destra; finito il mazzo, il mazzo si restringe fino a zero e le
          righe (blocco centrato) scivolano al centro in modo continuo, un fotogramma alla volta. */}
      <div className={isBlind ? 'mx-auto flex w-fit items-center' : ''}>
      <motion.main
        className={`mx-auto grid w-fit items-center gap-x-10 gap-y-5 ${isBlind ? 'grid-cols-[auto_min(36rem,40vw)]' : 'grid-cols-[auto_min(42rem,70vw)]'}`}
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {entries.map((entry, index) => {
          // Alla cieca la riga "si accende" quando ci si passa sopra con la cosa trascinata.
          const isFocused = focusedIndex === index || hoverSlot === index;
          const fillDelay = (entries.length - 1 - index) * FILL_STEP;

          return (
            <React.Fragment key={index}>
              <motion.div variants={rowVariants} data-slot={isBlind ? index : undefined}>
                {/* Riga selezionata: la lente si avvicina appena e un anello di luce le si accende SOPRA
                    (se fosse dietro, il vetro lo rifrangerebbe in macchie chiare). */}
                <motion.div
                  className="relative"
                  initial={false}
                  animate={{ scale: isFocused && !isSaving ? 1.1 : 1 }}
                  transition={liquidMorphSpring}
                >
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10 rounded-full shadow-[inset_0_0_0_2px_rgba(255,255,255,0.9),0_0_28px_rgba(255,255,255,0.3)]"
                    initial={false}
                    animate={{ opacity: isFocused && !isSaving ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <Glass radius={48} depth={40} className="relative flex h-24 w-24 items-center justify-center overflow-hidden">
                    {/* Salvataggio: la lente si riempie di luce bianca e il numero diventa scuro. */}
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-white"
                      initial={false}
                      animate={{ opacity: isSaving ? 1 : 0, scale: isSaving ? 1 : 0.6 }}
                      transition={isSaving ? { ...liquidMorphSpring, delay: fillDelay } : { duration: 0.3 }}
                    />
                    <motion.span
                      className="font-tight relative text-5xl font-semibold tabular-nums"
                      initial={false}
                      animate={{ color: isSaving ? '#04050a' : '#ffffff' }}
                      transition={{ duration: 0.2, delay: isSaving ? fillDelay + 0.1 : 0 }}
                    >
                      {index + 1}
                    </motion.span>
                  </Glass>
                </motion.div>
              </motion.div>
              <motion.div variants={rowVariants} className="relative" data-slot={isBlind ? index : undefined}>
                {isBlind ? (
                  // Slot alla cieca: non si scrive, si riceve la cosa svelata (che ci vola dentro dalla lastra).
                  <div className="flex min-h-[5.75rem] items-center py-2">
                    {entry ? (
                      // La pillola si dissolve dove l'ospite l'ha lasciata (sopra lo slot) e la scritta emerge qui, alla stessa
                      // grandezza: niente scritta "agganciata" tra pillola e riga, che verrebbe stirata fino alla colonna.
                      <motion.span
                        className="block w-full"
                        initial={{ opacity: 0, x: -16, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
                        transition={{ duration: 0.5, ease: easeOutQuint, delay: 0.1 }}
                      >
                        <FitText text={entry} className="font-tight lg-text-glow text-6xl font-semibold leading-tight tracking-tight text-white" />
                      </motion.span>
                    ) : (
                      <span className="font-tight text-6xl font-semibold leading-tight text-white/20">—</span>
                    )}
                  </div>
                ) : (
                <FitInput
                  ref={(element) => { inputRefs.current[index] = element; }}
                  value={entry}
                  onValueChange={(value) => handleInputChange(index, value)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  onKeyDown={(event) => handleEntryKeyDown(index, event)}
                  placeholder="—"
                  disabled={isSaving}
                  aria-label={`Posizione ${index + 1}`}
                  minScale={0.55}
                  className="font-tight lg-text-glow text-6xl font-semibold leading-tight tracking-tight text-white"
                  inputClassName="bg-transparent py-2 caret-[var(--lg-cyan)] placeholder-white/20 focus:outline-none"
                />
                )}
                <motion.span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-[2px] w-full origin-left rounded-full bg-gradient-to-r from-white via-white/60 to-transparent"
                  initial={false}
                  animate={{ scaleX: isFocused ? 1 : 0, opacity: isFocused ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: easeOutQuint }}
                />
              </motion.div>
            </React.Fragment>
          );
        })}
      </motion.main>
      {isBlind && (
        <BlindDeck
          collapsed={isBlindDone}
          itemIndex={placedCount}
          revealedItem={revealedItem}
          covered={5 - placedCount - (revealedItem === null ? 0 : 1)}
          isLocked={isSaving}
          onReveal={handleReveal}
          onDrag={(x, y) => setHoverSlot(slotAt(x, y))}
          onDrop={(x, y) => {
            const slot = slotAt(x, y);
            if (slot === null || entries[slot]?.trim()) {
              setHoverSlot(null);
              return false;
            }
            handlePlace(slot);
            return true;
          }}
        />
      )}
      </div>
      </motion.div>

      {/* Entra con le righe, non sopra la schermata che se ne va. */}
      <motion.footer
        className="mt-14 flex w-full items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="font-tight rounded-full px-8 py-4 text-2xl font-medium text-white/60 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          ← Indietro
        </button>
        <Glass
          ref={saveButtonRef}
          radius={40}
          depth={50}
          role="button"
          tabIndex={0}
          aria-disabled={isSaving || (isBlind && !isBlindDone && revealedItem !== null)}
          onClick={isBlind && !isBlindDone ? handleReveal : handleSaveClick}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            // Alla cieca questi tasti li gestisce già la schermata (svela): qui niente doppioni.
            if (isBlind) return;
            handleSaveClick();
          }}
          onPointerMove={trackGlassLight}
          className="font-tight lg-text-glow cursor-pointer px-16 py-6 text-3xl font-semibold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
          // Alla cieca, con una cosa svelata ancora da collocare, "Svela" si spegne finché non è messa in uno slot.
          animate={{ opacity: isBlind && !isBlindDone && revealedItem !== null ? 0.35 : 1 }}
          whileHover={isSaving ? undefined : { scale: 1.05 }}
          whileTap={isSaving ? undefined : { scale: 0.95 }}
          transition={liquidMorphSpring}
        >
          {isBlind && !isBlindDone ? 'Svela' : 'Salva'}
        </Glass>
      </motion.footer>

      {/* Lastra finale al centro: arriva come una goccia che si posa. */}
      <AnimatePresence>
        {isSaving && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: CARD_AT }}
          >
            <Glass
              radius={56}
              depth={120}
              className="px-24 py-16 text-center"
              initial={{ scale: 0.6, y: 60 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ ...liquidMorphSpring, delay: CARD_AT }}
            >
              <p className="font-tight lg-text-glow text-8xl font-bold leading-[1.05] tracking-tight text-white">Classifica completata</p>
            </Glass>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mazzo della classifica alla cieca: in cima la lastra coperta ("?", clic per svelare) o quella svelata
// (da trascinare su uno slot); dietro, una lastra per ogni cosa ancora coperta.
const BlindDeck: React.FC<{
  itemIndex: number;
  revealedItem: string | null;
  covered: number;
  isLocked: boolean;
  onReveal: () => void;
  onDrag: (x: number, y: number) => void;
  /** true = collocata in uno slot (la pillola si dissolve lì), false = torna al mazzo. */
  onDrop: (x: number, y: number) => boolean;
  /** Tutte e 5 collocate: il mazzo si dissolve e si restringe, lasciando il centro alle righe. */
  collapsed: boolean;
}> = ({ collapsed, itemIndex, revealedItem, covered, isLocked, onReveal, onDrag, onDrop }) => {
  const layersBehind = revealedItem === null ? covered - 1 : covered;
  const isEmpty = revealedItem === null && covered === 0;

  return (
    <motion.div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: DECK_SIZE, height: DECK_SIZE, marginLeft: '3rem' }}
      initial={{ opacity: 0, x: 40 }}
      animate={collapsed ? { opacity: 0, width: 0, marginLeft: 0, x: 0 } : { opacity: isEmpty ? 0 : 1, x: 0 }}
      transition={collapsed
        ? { opacity: { duration: 0.3 }, default: { duration: 0.9, ease: [0.45, 0, 0.2, 1], delay: 0.2 } }
        : { duration: 0.8, ease: easeOutQuint, delay: 0.5 }}
    >
      {Array.from({ length: Math.max(0, layersBehind) }, (_, index) => {
        const depth = layersBehind - index;
        return (
          <motion.div
            key={`layer-${index}`}
            aria-hidden="true"
            className="lg-glass absolute inset-0 rounded-[40px]"
            initial={false}
            animate={{ y: -depth * 14, scale: 1 - depth * 0.05, opacity: 0.55 - depth * 0.1 }}
            transition={liquidMorphSpring}
          />
        );
      })}
      <AnimatePresence mode="popLayout" initial={false}>
        {revealedItem !== null ? (
          <RevealedCard
            key={`face-${itemIndex}`}
            text={revealedItem}
            isLocked={isLocked}
            onDrag={onDrag}
            onDrop={onDrop}
          />
        ) : covered > 0 ? (
          <Glass
            key={`back-${itemIndex}`}
            radius={40}
            depth={110}
            frost={0}
            role="button"
            tabIndex={0}
            aria-label="Svela la prossima"
            onClick={onReveal}
            onPointerMove={trackGlassLight}
            className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
            initial={{ opacity: 0, y: -14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            // Il "?" sparisce in fretta, la scritta arriva subito dopo: niente "?" sfocato sopra la scritta.
            exit={{ opacity: 0, scale: 0.94, filter: 'blur(10px)', transition: { duration: 0.18 } }}
            whileHover={isLocked ? undefined : { scale: 1.04 }}
            whileTap={isLocked ? undefined : { scale: 0.96 }}
            transition={liquidMorphSpring}
          >
            <span className="font-tight lg-text-glow text-[10rem] font-bold leading-none text-white/90">?</span>
          </Glass>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

// Cosa svelata: ognuna ha la sua posizione di trascinamento, che parte da zero nel mazzo (se fosse condivisa,
// la scheda successiva comparirebbe dove era stata lasciata la precedente).
// Trascinando, la lastra quadrata si stringe in una pillola grande quanto la scritta (layout animato);
// lasciata fuori da uno slot torna quadrata nel mazzo. ref: serve ad AnimatePresence (popLayout).
const RevealedCard = React.forwardRef<HTMLDivElement, {
  text: string;
  isLocked: boolean;
  onDrag: (x: number, y: number) => void;
  onDrop: (x: number, y: number) => boolean;
}>(({ text, isLocked, onDrag, onDrop }, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  return (
    <Glass
      ref={ref}
      round={isDragging}
      radius={40}
      depth={isDragging ? 60 : 110}
      frost={0}
      role="button"
      aria-label={`Cosa svelata: ${text}. Trascinala su uno slot`}
      className={`relative z-10 flex cursor-grab items-center justify-center text-center active:cursor-grabbing ${isDragging ? 'px-10 py-4' : 'h-full w-full p-8'}`}
      layout
      drag={!isLocked}
      dragElastic={0.2}
      dragMomentum={false}
      style={{ x: dragX, y: dragY }}
      whileDrag={{ zIndex: 50 }}
      onDragStart={() => setIsDragging(true)}
      onDrag={(_, info) => onDrag(info.point.x, info.point.y)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        if (!onDrop(info.point.x, info.point.y)) {
          animate(dragX, 0, liquidMorphSpring);
          animate(dragY, 0, liquidMorphSpring);
        }
      }}
      onPointerMove={trackGlassLight}
      initial={{ opacity: 0, scale: 0.9, filter: 'blur(14px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' }, transition: { ...liquidMorphSpring, delay: 0.12 } }}
      // Collocata: la pillola di vetro si dissolve dove l'ospite l'ha lasciata.
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.3 } }}
      transition={liquidMorphSpring}
    >
      <motion.span
        // In pillola la scritta ha già la grandezza dello slot: atterrando non cambia misura.
        className={`${isDragging ? 'whitespace-nowrap text-6xl leading-tight' : `${revealSizeClass(text)} break-words leading-[1.05]`} font-tight lg-text-glow block font-semibold tracking-tight text-white`}
        transition={{ layout: liquidMorphSpring }}
      >
        {text}
      </motion.span>
    </Glass>
  );
});

RevealedCard.displayName = 'RevealedCard';
