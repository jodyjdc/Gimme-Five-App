import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking } from '../types';
import { FitInput } from './FitInput';
import { broadcastTransition, gameShowSpring, quickTransition, stageMorphSpring } from '../motionConfig';

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
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: broadcastTransition },
};

// Salvataggio: le righe si "bloccano" dalla 5 alla 1, poi si torna alla griglia.
const LOCK_STEP = 0.13;
const LOCK_FLASH = 0.45;
const SAVE_DELAY_MS = Math.round((4 * LOCK_STEP + LOCK_FLASH) * 1000) + 80;

const numberColor = '#67e8f9';
const lockPink = '#ff64c4';

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

  const titleClasses = "font-display text-5xl font-black leading-tight tracking-tight text-white sm:text-7xl";

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center">
      <header className="w-full text-center mb-12">
        <motion.div
          layoutId={boxId === null ? undefined : `box-${boxId}`}
          style={{ borderRadius: 28 }}
          className="relative w-full overflow-hidden border-2 border-cyan-200/40 bg-gradient-to-b from-cyan-500/25 to-cyan-950/40 px-6 py-8 shadow-[0_0_60px_rgba(34,211,238,0.16)]"
          transition={{ layout: stageMorphSpring }}
        >
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.16),transparent_60%)]" />
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
                className="w-12 text-center font-display text-5xl font-black leading-none tabular-nums"
                style={{ transformPerspective: 400 }}
                initial={{ opacity: 0, rotateX: -90, color: numberColor }}
                animate={isSaving
                  ? { opacity: 1, rotateX: 0, color: [numberColor, lockPink, '#ffffff'] }
                  : { opacity: 1, rotateX: 0, color: numberColor }}
                transition={isSaving ? lockTransition : { ...gameShowSpring, delay: 0.5 + index * 0.1 }}
              >
                {index + 1}
              </motion.span>
              <motion.div
                className="relative flex-1 rounded-lg"
                initial={false}
                animate={isSaving
                  ? { scale: [1, 1.015, 1], boxShadow: ['0 0 0 0px rgba(255,100,196,0)', '0 0 0 3px rgba(255,100,196,0.95)', '0 0 0 2px rgba(34,211,238,0.6)'] }
                  : { scale: 1, boxShadow: '0 0 0 0px rgba(255,100,196,0)' }}
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
                  inputClassName="h-[5.125rem] rounded-lg border border-white/10 bg-white/[0.05] px-6 placeholder-white/30 transition-colors duration-200 focus:bg-white/[0.08] focus:outline-none"
                />
                <span className="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] origin-left scale-x-0 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)] transition-transform duration-300 ease-out peer-focus-within:scale-x-100" />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.main>

      <footer className="w-full flex items-center justify-between mt-16 space-x-4">
        <motion.button
          onClick={onBack}
          disabled={isSaving}
          className="px-12 py-5 text-xl bg-white/10 text-white font-semibold rounded-lg hover:bg-white/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 transition-colors duration-200"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={gameShowSpring}
        >
          Indietro
        </motion.button>
        <motion.button
          onClick={handleSaveClick}
          disabled={isSaving}
          className="px-12 py-5 bg-cyan-600 text-white font-bold text-2xl rounded-lg shadow-lg shadow-cyan-500/30 hover:bg-cyan-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 transition-colors duration-200 disabled:cursor-wait"
          whileHover={isSaving ? undefined : { scale: 1.04, y: -2 }}
          whileTap={isSaving ? undefined : { scale: 0.98 }}
          transition={gameShowSpring}
        >
          Salva Classifica
        </motion.button>
      </footer>
    </div>
  );
};
