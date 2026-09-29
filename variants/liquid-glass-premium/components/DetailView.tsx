import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking } from '../types';
import { FitInput } from './FitInput';
import { broadcastTransition, liquidGlassSpring, liquidMorphSpring, quickTransition } from '../motionConfig';

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
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: broadcastTransition },
};

// Salvataggio: una lama di luce attraversa le righe dalla 5 alla 1, poi si torna alla griglia.
const LOCK_STEP = 0.13;
const LOCK_FLASH = 0.55;
const SAVE_DELAY_MS = Math.round((4 * LOCK_STEP + LOCK_FLASH) * 1000) + 80;

// Stessa struttura (2 ombre) in ogni fotogramma, così Motion le interpola.
const rowGlowRest = '0 0 0 1px rgba(255,255,255,0), 0 0 0px rgba(103,232,249,0)';
const rowGlowLocked = [
  rowGlowRest,
  '0 0 0 1px rgba(255,255,255,0.7), 0 0 36px rgba(103,232,249,0.35)',
  '0 0 0 1px rgba(255,255,255,0.28), 0 0 0px rgba(103,232,249,0)',
];

export const DetailView: React.FC<DetailViewProps> = ({ ranking, boxId, onTitleChange, onSave, onBack }) => {
  const [entries, setEntries] = useState<string[]>(['', '', '', '', '']);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

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

  const titleClasses = "font-display text-5xl font-semibold leading-tight tracking-tight text-white sm:text-7xl";

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center">
      <header className="w-full text-center mb-12">
        <motion.div
          layoutId={boxId === null ? undefined : `box-${boxId}`}
          style={{ borderRadius: 28 }}
          className="glass glass-tint w-full overflow-hidden px-6 py-8"
          transition={{ layout: liquidMorphSpring }}
        >
          <AnimatePresence mode="wait" initial={false}>
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
                className={`${titleClasses} relative w-full bg-transparent px-3 py-1 text-center outline-none placeholder-white/30 focus:ring-2 focus:ring-cyan-300 rounded-lg`}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                // Uscita rapida: il campo di modifica compare solo dopo (mode="wait").
                exit={{ opacity: 0, transition: quickTransition }}
                transition={{ ...broadcastTransition, delay: 0.4 }}
              >
                {ranking.fullTitle || 'Titolo classifica'}
              </motion.h1>
            )}
          </AnimatePresence>
        </motion.div>
      </header>

      <motion.main
        className="w-full flex flex-col space-y-5"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {entries.map((entry, index) => {
          const lockDelay = (entries.length - 1 - index) * LOCK_STEP;
          const lockTransition = { duration: LOCK_FLASH, delay: lockDelay };

          return (
            <motion.div key={index} className="flex items-center space-x-4 w-full" variants={rowVariants}>
              <motion.span
                className="w-14 bg-gradient-to-b from-white to-white/45 bg-clip-text text-center font-display text-6xl font-extralight leading-none tabular-nums text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={isSaving
                  ? { opacity: [0.85, 1, 1], y: 0, scale: [1, 1.14, 1] }
                  : { opacity: 0.85, y: 0, scale: 1 }}
                transition={isSaving ? lockTransition : { ...liquidGlassSpring, delay: 0.5 + index * 0.1 }}
              >
                {index + 1}
              </motion.span>
              <motion.div
                className="relative flex-1 overflow-hidden rounded-2xl"
                initial={false}
                animate={isSaving
                  ? { scale: [1, 1.012, 1], boxShadow: rowGlowLocked }
                  : { scale: 1, boxShadow: rowGlowRest }}
                transition={lockTransition}
              >
                {/* Voci lunghe: la scritta si rimpicciolisce per stare nel campo; oltre il minimo non si scrive. */}
                <FitInput
                  value={entry}
                  onValueChange={(value) => handleInputChange(index, value)}
                  placeholder={`Posizione #${index + 1}`}
                  disabled={isSaving}
                  aria-label={`Posizione ${index + 1}`}
                  minScale={0.7}
                  className="peer text-2xl text-white"
                  inputClassName="h-[5.125rem] rounded-2xl border border-white/10 bg-white/[0.055] px-6 placeholder-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition-colors duration-300 hover:bg-white/[0.07] focus:border-white/25 focus:bg-white/[0.1] focus:outline-none"
                />
                <span className={`pointer-events-none absolute inset-x-6 bottom-0 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-white to-transparent transition-transform duration-500 ease-out peer-focus-within:scale-x-100 ${isSaving ? 'opacity-0' : ''}`} />
                {isSaving && (
                  <motion.span
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                    initial={{ x: '-120%' }}
                    animate={{ x: '360%' }}
                    transition={lockTransition}
                  />
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </motion.main>

      <footer className="w-full flex items-center justify-between mt-16 space-x-4">
        <motion.button
          onClick={onBack}
          disabled={isSaving}
          className="glass rounded-full px-12 py-5 text-xl font-medium text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={liquidGlassSpring}
        >
          Indietro
        </motion.button>
        <motion.button
          onClick={handleSaveClick}
          disabled={isSaving}
          className="rounded-full bg-white px-12 py-5 text-2xl font-semibold tracking-tight text-slate-950 shadow-[inset_0_-2px_0_rgba(15,23,42,0.12),0_12px_40px_-8px_rgba(255,255,255,0.35)] transition-colors duration-200 hover:bg-cyan-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200/60 disabled:cursor-wait"
          whileHover={isSaving ? undefined : { scale: 1.04, y: -2 }}
          whileTap={isSaving ? undefined : { scale: 0.97 }}
          transition={liquidGlassSpring}
        >
          Salva Classifica
        </motion.button>
      </footer>
    </div>
  );
};
