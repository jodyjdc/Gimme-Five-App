import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking } from '../types';
import { Glass, trackGlassLight } from './Glass';
import { FitInput } from './FitInput';
import { easeOutQuint, liquidMorphSpring } from '../motionConfig';

interface DetailViewProps {
  ranking: Ranking;
  boxId: number | null;
  onTitleChange: (title: string) => void;
  onSave: (id: number, entries: string[]) => void;
  onBack: () => void;
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

export const DetailView: React.FC<DetailViewProps> = ({ ranking, boxId, onTitleChange, onSave, onBack }) => {
  const [entries, setEntries] = useState<string[]>(['', '', '', '', '']);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const saveButtonRef = useRef<HTMLDivElement>(null);

  // Solo al cambio di classifica: modificare il titolo cambia `ranking` e cancellerebbe le voci non salvate.
  useEffect(() => {
    setEntries(ranking.entries);
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
    setEntries(prevEntries =>
      prevEntries.map((entry, entryIndex) => entryIndex === index ? value : entry)
    );
  };

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
                layout="position"
                className={`${titleClasses} cursor-text`}
                title="Doppio click per modificare"
                onDoubleClick={() => setIsEditingTitle(true)}
                initial={{ opacity: 0, filter: 'blur(12px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                // Uscita rapida: il campo di modifica compare solo dopo (mode="wait").
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.8, ease: easeOutQuint, delay: 0.35 }}
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
      <motion.main
        className="mx-auto grid w-fit grid-cols-[auto_min(42rem,70vw)] items-center gap-x-10 gap-y-5"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {entries.map((entry, index) => {
          const isFocused = focusedIndex === index;
          const fillDelay = (entries.length - 1 - index) * FILL_STEP;

          return (
            <React.Fragment key={index}>
              <motion.div variants={rowVariants}>
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
              <motion.div variants={rowVariants} className="relative">
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
      </motion.div>

      <footer className="mt-14 flex w-full items-center justify-between">
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
          aria-disabled={isSaving}
          onClick={handleSaveClick}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && handleSaveClick()}
          onPointerMove={trackGlassLight}
          className="font-tight lg-text-glow cursor-pointer px-16 py-6 text-3xl font-semibold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
          whileHover={isSaving ? undefined : { scale: 1.05 }}
          whileTap={isSaving ? undefined : { scale: 0.95 }}
          transition={liquidMorphSpring}
        >
          Salva
        </Glass>
      </footer>

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
