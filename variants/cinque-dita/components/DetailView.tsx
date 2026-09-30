import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking } from '../types';
import { FitInput } from './FitInput';
import { NeonHand } from './NeonHand';
import { HAND_ASPECT, HAND_VIEWBOX } from '../hand';
import { neonTube } from './neon';
import { easeOutQuint, neonSpring } from '../motionConfig';

interface DetailViewProps {
  ranking: Ranking;
  boxId: number | null;
  onTitleChange: (title: string) => void;
  onSave: (id: number, entries: string[]) => void;
  onBack: () => void;
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.45 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: easeOutQuint } },
};

// Mano accanto alle posizioni: alta quanto le cinque righe (a 1080p), più piccola su schermi stretti.
const HAND_HEIGHT = 'min(35rem, 30vw)';
const BLOCK_HEIGHT = '35rem'; // 5 righe da 6rem + 4 spazi da 1,25rem

// Salvataggio, il "batti cinque":
// 1. le dita ancora spente si accendono una dopo l'altra, dal pollice al mignolo;
// 2. tutta l'insegna passa al magenta e le righe si ritirano;
// 3. la mano va al centro, colpisce (scatto in avanti + raggi) e compare "Classifica completata!";
// 4. si torna al tabellone e il titolo ridiventa il suo anello.
const IGNITE_STEP_MS = 140;
const MAGENTA_AT_MS = 5 * IGNITE_STEP_MS + 150;
const CENTER_AT_MS = MAGENTA_AT_MS + 350;
const SAVE_AT_MS = CENTER_AT_MS + 3100;

type SavePhase = 'idle' | 'igniting' | 'magenta' | 'center';

// Raggi del colpo, attorno al palmo (coordinate del disegno del logo).
const BURST = Array.from({ length: 7 }, (_, index) => {
  const angle = ((198 + index * 24) * Math.PI) / 180;
  const [cx, cy, r1, r2] = [790, 470, 322, 384];
  return `M${(cx + Math.cos(angle) * r1).toFixed(1)} ${(cy + Math.sin(angle) * r1).toFixed(1)} L${(cx + Math.cos(angle) * r2).toFixed(1)} ${(cy + Math.sin(angle) * r2).toFixed(1)}`;
});

export const DetailView: React.FC<DetailViewProps> = ({ ranking, boxId, onTitleChange, onSave, onBack }) => {
  const [entries, setEntries] = useState<string[]>(['', '', '', '', '']);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<SavePhase>('idle');
  const [ignited, setIgnited] = useState(0);
  const timeoutsRef = useRef<number[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const isSaving = phase !== 'idle';
  const isMagenta = phase === 'magenta' || phase === 'center';

  // Solo al cambio di classifica: modificare il titolo cambia `ranking` e cancellerebbe le voci non salvate.
  useEffect(() => {
    setEntries(ranking.entries);
  }, [ranking.id]);

  useEffect(() => () => timeoutsRef.current.forEach(window.clearTimeout), []);

  const handleInputChange = (index: number, value: string) => {
    setEntries(prevEntries => prevEntries.map((entry, entryIndex) => entryIndex === index ? value : entry));
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

  const at = (ms: number, action: () => void) => timeoutsRef.current.push(window.setTimeout(action, ms));

  const handleSaveClick = () => {
    if (isSaving) {
      return;
    }

    (document.activeElement as HTMLElement | null)?.blur();
    setPhase('igniting');
    for (let finger = 1; finger <= 5; finger++) at(finger * IGNITE_STEP_MS, () => setIgnited(finger));
    at(MAGENTA_AT_MS, () => setPhase('magenta'));
    at(CENTER_AT_MS, () => setPhase('center'));
    at(SAVE_AT_MS, () => onSave(ranking.id, entries));
  };

  const lit = entries.map((entry, index) => entry.trim() !== '' || index < ignited);
  const warm = focusedIndex !== null && !lit[focusedIndex] ? focusedIndex : null;
  const titleClasses = 'text-6xl font-bold leading-tight text-white sm:text-7xl';

  return (
    <div className="relative mx-auto flex w-full flex-col items-center">
      <header className="mb-10 w-full max-w-[82rem]">
        <motion.div
          layoutId={boxId === null ? undefined : `box-${boxId}`}
          className="flex min-h-[10rem] w-full items-center justify-center px-16 py-8 text-center"
          style={{ borderRadius: 9999 }}
          initial={false}
          animate={{ boxShadow: neonTube(isMagenta ? 'magenta' : 'cyan') }}
          transition={{ layout: neonSpring, boxShadow: { duration: 0.5 } }}
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
                className={`${titleClasses} cd-glow w-full bg-transparent text-center caret-[rgb(0,208,255)] outline-none placeholder-white/25`}
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
                className={`${titleClasses} ${isMagenta ? 'cd-glow-magenta' : 'cd-glow'} cursor-text`}
                title="Doppio click per modificare"
                onDoubleClick={() => !isSaving && setIsEditingTitle(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                // Uscita rapida: il campo di modifica compare solo dopo (mode="wait").
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.7, ease: easeOutQuint, delay: 0.4 }}
              >
                {ranking.fullTitle || 'Titolo classifica'}
              </motion.h1>
            )}
          </AnimatePresence>
        </motion.div>
      </header>

      <div className="relative w-full" style={{ height: BLOCK_HEIGHT }}>
        <div className="mx-auto grid h-full w-fit grid-cols-[auto_auto] items-center gap-x-[min(7rem,6vw)]">
          {/* Posto della mano: resta anche quando la mano va al centro, così le righe non si spostano. */}
          <div style={{ height: HAND_HEIGHT, aspectRatio: HAND_ASPECT }}>
            {phase !== 'center' && (
              <NeonHand layoutId="cd-hand" lit={lit} palm color={isMagenta ? 'magenta' : 'cyan'} warm={warm} className="h-full w-full" />
            )}
          </div>

          <motion.div
            initial={false}
            animate={{ opacity: isMagenta ? 0 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.main
              className="grid w-fit grid-cols-[auto_min(42rem,44vw)] items-center gap-x-10 gap-y-5"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {entries.map((entry, index) => {
                const isFocused = focusedIndex === index;
                return (
                  <React.Fragment key={index}>
                    <motion.div variants={rowVariants}>
                      <motion.div
                        className="flex h-24 w-24 items-center justify-center rounded-full"
                        initial={false}
                        animate={{ boxShadow: neonTube(isFocused ? 'cyan' : 'ghost'), scale: isFocused ? 1.08 : 1 }}
                        transition={{ ...neonSpring, boxShadow: { duration: 0.35 } }}
                      >
                        <span className="cd-glow text-5xl font-medium tabular-nums text-white">{index + 1}</span>
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
                        className="cd-glow text-6xl font-semibold leading-tight text-white"
                        inputClassName="bg-transparent py-2 caret-[rgb(0,208,255)] placeholder-white/20 focus:outline-none"
                      />
                      {/* Riga che si sta scrivendo: sotto si accende un filo ciano. */}
                      <motion.span
                        aria-hidden="true"
                        className="absolute bottom-0 left-0 h-[3px] w-full origin-left rounded-full bg-[rgb(0,208,255)] shadow-[0_0_10px_2px_rgba(0,208,255,0.6)]"
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
        </div>

        {/* Il batti cinque: la mano al centro, lo scatto in avanti, i raggi, la scritta. */}
        {phase === 'center' && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6">
            <motion.div
              className="relative"
              style={{ height: 'min(30rem, 40vh)', aspectRatio: HAND_ASPECT }}
              animate={{ scale: [1, 1, 1.16, 1], rotate: [0, 0, -6, 0] }}
              transition={{ duration: 1.3, times: [0, 0.62, 0.74, 1], ease: 'easeOut' }}
            >
              <NeonHand layoutId="cd-hand" lit={[true, true, true, true, true]} palm color="magenta" className="h-full w-full" />
              <svg viewBox={HAND_VIEWBOX} overflow="visible" className="absolute inset-0 h-full w-full" fill="none" strokeLinecap="round" aria-hidden="true">
                {BURST.map((d, index) => (
                  <motion.path
                    key={index}
                    d={d}
                    stroke="rgb(255, 100, 196)"
                    strokeWidth={15}
                    style={{ filter: 'drop-shadow(0 0 6px rgb(255, 100, 196))' }}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.9, delay: 0.95, times: [0, 0.3, 1], ease: 'easeOut' }}
                  />
                ))}
              </svg>
            </motion.div>
            <motion.p
              className="cd-glow-magenta text-7xl font-bold leading-none text-white"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOutQuint, delay: 1.05 }}
            >
              Classifica completata!
            </motion.p>
          </div>
        )}
      </div>

      <motion.footer
        className="mt-12 flex w-full max-w-[82rem] items-center justify-between"
        initial={false}
        animate={{ opacity: isSaving ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="rounded-full px-8 py-4 text-2xl font-medium text-white/60 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          ← Indietro
        </button>
        <motion.button
          ref={saveButtonRef}
          type="button"
          onClick={handleSaveClick}
          disabled={isSaving}
          className="cd-glow rounded-full px-16 py-6 text-3xl font-semibold text-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-white"
          style={{ boxShadow: neonTube('cyan') }}
          whileHover={isSaving ? undefined : { scale: 1.05 }}
          whileTap={isSaving ? undefined : { scale: 0.95 }}
          transition={neonSpring}
        >
          Salva
        </motion.button>
      </motion.footer>
    </div>
  );
};
