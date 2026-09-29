import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking } from '../types';
import { PixelButton, PixelInput, PixelText } from './Pixel';
import { ARCADE_COLORS, arcadeColor, pixelSteps, sound } from '../arcade';

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
      staggerChildren: 0.12,
      delayChildren: 0.6,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: pixelSteps(2) } },
};

const RANK_LABELS = ['1°', '2°', '3°', '4°', '5°'];

// Salvataggio: le righe lampeggiano in cascata dalla 5 alla 1, poi "CLASSIFICA COMPLETATA!" e fanfara.
const ROW_FLASH_STEP = 0.1;
const ROWS_DONE = 4 * ROW_FLASH_STEP + 0.6;
const SAVE_DELAY_MS = 2500;
const bannerCycle = [...ARCADE_COLORS, ...ARCADE_COLORS, ...ARCADE_COLORS];
const holdEase = () => 1;

export const DetailView: React.FC<DetailViewProps> = ({ ranking, boxId, onTitleChange, onSave, onBack }) => {
  const [entries, setEntries] = useState<string[]>(['', '', '', '', '']);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const frameColor = arcadeColor((boxId ?? 1) - 1);

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

  const handleBack = () => {
    sound.back();
    onBack();
  };

  const handleSaveClick = () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    window.setTimeout(sound.fanfare, (ROWS_DONE - 0.1) * 1000);
    saveTimeoutRef.current = window.setTimeout(() => {
      onSave(ranking.id, entries);
    }, SAVE_DELAY_MS);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
      <header className="relative w-full text-center mb-10">
        <motion.div
          layoutId={boxId === null ? undefined : `box-${boxId}`}
          className="pixel-frame w-full p-1"
          style={{ backgroundColor: frameColor }}
          transition={{ layout: { duration: 0.56, ease: pixelSteps(8) } }}
        >
          <div className="pixel-frame flex flex-col items-center bg-[var(--crt-bg)] px-10 py-9">
            <AnimatePresence mode="wait">
              {isEditingTitle ? (
                <motion.div
                  key="title-input"
                  className="w-full text-5xl text-[var(--phosphor)] sm:text-6xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.08 }}
                >
                  <PixelInput
                    value={ranking.fullTitle}
                    onChange={(event) => onTitleChange(event.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={handleTitleKeyDown}
                    // Il campo appare solo dopo l'uscita del titolo (mode="wait"): il focus va dato al montaggio.
                    autoFocus
                    placeholder="TITOLO CLASSIFICA"
                    align="center"
                  />
                </motion.div>
              ) : (
                <motion.h1
                  key="title-display"
                  className="w-full cursor-text text-5xl text-[var(--phosphor)] sm:text-6xl"
                  title="Doppio click per modificare"
                  onDoubleClick={() => setIsEditingTitle(true)}
                  // Uscita rapida: il campo di modifica compare solo dopo (mode="wait").
                  exit={{ opacity: 0, transition: { duration: 0.08 } }}
                >
                  <PixelText text={ranking.fullTitle || 'TITOLO CLASSIFICA'} delay={0.45} stagger={0.04} />
                </motion.h1>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </header>

      <div className="relative w-full">
        <motion.main
          className="flex w-full flex-col gap-6"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {entries.map((entry, index) => {
            const color = arcadeColor(index);
            const isFocused = focusedIndex === index;
            const flashDelay = (entries.length - 1 - index) * ROW_FLASH_STEP;

            return (
              <motion.div key={index} className="relative flex w-full items-center" variants={rowVariants}>
                <span aria-hidden="true" className={`w-14 shrink-0 text-4xl ${isFocused ? 'arrow-bob' : 'invisible'}`} style={{ color }}>
                  <PixelText text="►" flash={false} />
                </span>
                <motion.div
                  className="grid flex-1 grid-cols-[7rem_minmax(0,1fr)] items-center gap-6 px-3 py-2"
                  style={{ color }}
                  initial={false}
                  // Salvataggio: la riga si inverte (sfondo colore, testo nero) tre volte, dalla 5 alla 1.
                  animate={isSaving
                    ? { backgroundColor: [color, 'rgba(0,0,0,0)', color, 'rgba(0,0,0,0)', color, 'rgba(0,0,0,0)'], color: ['#05070a', color, '#05070a', color, '#05070a', color] }
                    : { backgroundColor: 'rgba(0,0,0,0)', color }}
                  transition={isSaving ? { duration: 0.6, delay: flashDelay, ease: holdEase } : { duration: 0 }}
                >
                  <span className="text-5xl">
                    <PixelText text={RANK_LABELS[index]} delay={0.7 + index * 0.12} />
                  </span>
                  <PixelInput
                    ref={(element) => { inputRefs.current[index] = element; }}
                    value={entry}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    onKeyDown={(event) => handleEntryKeyDown(index, event)}
                    placeholder=".........."
                    disabled={isSaving}
                    aria-label={`Posizione ${index + 1}`}
                    fit
                    minScale={0.6}
                    className="text-5xl"
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.main>

        <AnimatePresence>
          {isSaving && (
            // Dopo la cascata delle righe: il cartello compare al centro della tabella, colori a ciclo.
            <motion.div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: 1, scale: [0.2, 1.15, 1] }}
              transition={{ duration: 0.3, delay: ROWS_DONE - 0.1, ease: pixelSteps(5) }}
            >
              <motion.span
                className="pixel-frame bg-current p-1.5"
                animate={{ color: bannerCycle }}
                transition={{ duration: 1.2, ease: holdEase, repeat: Infinity }}
              >
                <span className="pixel-frame block bg-[var(--crt-bg)] px-10 py-8 text-center text-6xl">
                  <PixelText text="CLASSIFICA COMPLETATA!" flash={false} />
                </span>
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="w-full flex items-center justify-between mt-14 space-x-4">
        <PixelButton label="◄ INDIETRO" onClick={handleBack} disabled={isSaving} color="#00d0ff" textClassName="text-2xl" />
        <PixelButton ref={saveButtonRef} label="SALVA ►" onClick={handleSaveClick} disabled={isSaving} color="#ffe14d" textClassName="text-3xl" />
      </footer>
    </div>
  );
};
