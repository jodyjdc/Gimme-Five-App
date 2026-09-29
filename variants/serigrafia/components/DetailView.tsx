import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking } from '../types';
import { PrintedText } from './PrintedText';
import { FitInput } from './FitInput';
import { printSpring, quickTransition, stageMorphSpring, stampSpring } from '../motionConfig';

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
      staggerChildren: 0.09,
      delayChildren: 0.45,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -18, rotate: -1 },
  visible: { opacity: 1, x: 0, rotate: 0, transition: printSpring },
};

// Salvataggio: il timbro si schianta, il foglio incassa il colpo, poi si torna alla griglia.
const STAMP_IMPACT = 0.16;
const SAVE_DELAY_MS = 1450;

const inkFor = (boxId: number | null) => (boxId !== null && boxId % 2 === 1 ? 'var(--ink-pink)' : 'var(--ink-cyan)');

export const DetailView: React.FC<DetailViewProps> = ({ ranking, boxId, onTitleChange, onSave, onBack }) => {
  const [entries, setEntries] = useState<string[]>(['', '', '', '', '']);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [scales, setScales] = useState<number[]>([1, 1, 1, 1, 1]);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  // Solo al cambio di classifica: modificare il titolo cambia `ranking` e cancellerebbe le voci non salvate.
  useEffect(() => {
    setEntries(ranking.entries);
  }, [ranking.id]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (index: number, value: string) => {
    setEntries(prevEntries =>
      prevEntries.map((entry, entryIndex) => entryIndex === index ? value : entry)
    );
  };

  // Invio "stampa" la riga e passa alla successiva; dall'ultima va su Salva.
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
    saveTimeoutRef.current = window.setTimeout(() => {
      onSave(ranking.id, entries);
    }, SAVE_DELAY_MS);
  };

  const titleClasses = "text-5xl leading-none sm:text-7xl";

  return (
    <motion.div
      className="relative w-full max-w-3xl mx-auto flex flex-col items-center"
      initial={false}
      // Contraccolpo del timbro: il foglio incassa l'impatto.
      animate={isSaving ? { x: [0, -7, 6, -3, 2, 0], y: [0, 5, -4, 2, -1, 0] } : { x: 0, y: 0 }}
      transition={{ duration: 0.42, delay: STAMP_IMPACT, ease: 'easeOut' }}
    >
      <svg aria-hidden="true" className="absolute h-0 w-0">
        {/* Bordi d'inchiostro irregolari per il timbro. */}
        <filter id="ink-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
        </filter>
      </svg>

      <header className="relative w-full text-center mb-14">
        <motion.div
          layoutId={boxId === null ? undefined : `box-${boxId}`}
          style={{ borderRadius: 10 }}
          className="ticket relative w-full overflow-hidden bg-[var(--paper-raised)] px-10 pb-8 pt-10"
          transition={{ layout: stageMorphSpring }}
        >
          <span
            className="halftone pointer-events-none absolute inset-y-0 right-0 w-1/2 [mask-image:linear-gradient(to_left,#000,transparent)]"
            style={{ color: inkFor(boxId), opacity: 0.35 }}
          />
          <span className="font-anybody pointer-events-none absolute left-10 top-4 text-[0.7rem] font-bold uppercase tracking-[0.35em] text-[var(--ink-white)]/45">
            Top 5{boxId !== null && ` · N°${boxId}`}
          </span>
          <AnimatePresence mode="wait">
            {isEditingTitle ? (
              <motion.input
                key="title-input"
                // Il campo appare solo dopo l'uscita del titolo (mode="wait"): il focus va dato al montaggio.
                autoFocus
                onFocus={(event) => event.currentTarget.select()}
                type="text"
                value={ranking.fullTitle}
                onChange={(event) => onTitleChange(event.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={handleTitleKeyDown}
                className={`${titleClasses} font-anybody relative w-full bg-transparent px-3 py-1 text-center text-[var(--ink-white)] outline-none placeholder-white/30`}
                style={{ fontVariationSettings: "'wdth' 78, 'wght' 500" }}
                placeholder="Titolo classifica"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={quickTransition}
              />
            ) : (
              <motion.h1
                key="title-display"
                layout="position"
                className={`${titleClasses} relative cursor-text`}
                title="Doppio click per modificare"
                onDoubleClick={() => setIsEditingTitle(true)}
                // Uscita rapida: il campo di modifica compare solo dopo (mode="wait").
                exit={{ opacity: 0, transition: quickTransition }}
              >
                <PrintedText text={ranking.fullTitle || 'Titolo classifica'} delay={0.35} />
              </motion.h1>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {isSaving && (
            <>
              <motion.span
                className="halftone halftone-fade pointer-events-none absolute -bottom-28 -right-16 h-72 w-72"
                style={{ color: inkFor(boxId) }}
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: [0, 0.9, 0], scale: [0.3, 1.25, 1.5] }}
                transition={{ duration: 0.7, delay: STAMP_IMPACT, ease: 'easeOut' }}
              />
              <motion.div
                className="font-anybody pointer-events-none absolute -bottom-9 right-0 rounded-md border-[5px] px-5 pb-1 pt-2 text-5xl uppercase leading-none sm:-right-6"
                style={{
                  color: inkFor(boxId),
                  borderColor: inkFor(boxId),
                  fontVariationSettings: "'wdth' 60, 'wght' 900",
                  filter: 'url(#ink-rough)',
                }}
                initial={{ opacity: 0, scale: 2.8, rotate: -22 }}
                animate={{ opacity: 1, scale: 1, rotate: -8 }}
                transition={stampSpring}
              >
                Top 5 ✓
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <motion.main
        className="w-full flex flex-col space-y-4"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {entries.map((entry, index) => {
          const isPrinted = entry.trim() !== '' && focusedIndex !== index;

          return (
            <motion.div key={index} className="flex w-full items-end gap-6" variants={rowVariants}>
              <span
                className="ink ink-outline font-anybody w-16 shrink-0 text-center text-7xl leading-none"
                data-text={index + 1}
                style={{ fontVariationSettings: "'wdth' 62, 'wght' 900" }}
              >
                {index + 1}
              </span>
              <div className="relative flex-1 border-b-2 border-dashed border-[var(--ink-white)]/20 pb-2 transition-colors duration-300 focus-within:border-solid focus-within:border-[var(--ink-white)]/70">
                {/* Voci lunghe: si misura la versione "stampata" (più spessa e larga) così ci stanno entrambe;
                    la scritta si rimpicciolisce per stare nel campo, oltre il minimo non si scrive. */}
                <span className="flex min-h-[3.25rem] items-center" style={{ fontVariationSettings: "'wdth' 78, 'wght' 850" }}>
                  <FitInput
                    ref={(element) => { inputRefs.current[index] = element; }}
                    value={entry}
                    onValueChange={(value) => handleInputChange(index, value)}
                    onScaleChange={(scale) => setScales(prev => (prev[index] === scale ? prev : prev.map((s, i) => (i === index ? scale : s))))}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    onKeyDown={(event) => handleEntryKeyDown(index, event)}
                    placeholder={`Posizione #${index + 1}`}
                    disabled={isSaving}
                    aria-label={`Posizione ${index + 1}`}
                    minScale={0.75}
                    className="font-anybody w-full text-3xl text-[var(--ink-white)]"
                    inputClassName={`bg-transparent px-1 py-2 placeholder-[var(--ink-white)]/25 focus:outline-none ${isPrinted ? 'text-transparent caret-transparent' : ''}`}
                    style={{ fontVariationSettings: "'wdth' 78, 'wght' 500" }}
                  />
                </span>
                {isPrinted && (
                  <span className="pointer-events-none absolute bottom-4 left-1 text-3xl leading-none">
                    <span className="block" style={{ fontSize: `${scales[index]}em` }}>
                      <PrintedText text={entry} stagger={0.02} />
                    </span>
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.main>

      <footer className="w-full flex items-center justify-between mt-16 space-x-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="font-anybody px-2 py-3 text-xl font-semibold uppercase tracking-[0.2em] text-[var(--ink-white)]/60 underline decoration-2 underline-offset-8 transition-colors hover:text-[var(--ink-white)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-white)]"
        >
          ← Indietro
        </button>
        <motion.button
          ref={saveButtonRef}
          type="button"
          onClick={handleSaveClick}
          disabled={isSaving}
          className="font-anybody rounded-md px-10 py-5 text-2xl uppercase tracking-wide text-[var(--paper)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ink-white)] disabled:cursor-wait"
          style={{ backgroundColor: 'var(--ink-white)', fontVariationSettings: "'wdth' 70, 'wght' 850" }}
          // Bottone "stampato": l'ombra è la lastra colore sfalsata; premendo, il foglio scende sulla lastra.
          initial={false}
          animate={{ x: 0, y: 0, boxShadow: '6px 6px 0 0 #ff64c4' }}
          whileHover={isSaving ? undefined : { x: -2, y: -2, boxShadow: '9px 9px 0 0 #ff64c4' }}
          whileTap={isSaving ? undefined : { x: 6, y: 6, boxShadow: '0px 0px 0 0 #ff64c4' }}
          transition={printSpring}
        >
          Salva Classifica
        </motion.button>
      </footer>
    </motion.div>
  );
};
