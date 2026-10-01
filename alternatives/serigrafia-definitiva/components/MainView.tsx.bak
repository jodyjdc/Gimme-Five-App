import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking, RankingBox } from '../types';
import { Logo } from './Logo';
import { MainSettingsMenu } from './MainSettingsMenu';
import { PrintedText } from './PrintedText';
import { printSpring, quickTransition, screenTransition, stageMorphSpring } from '../motionConfig';

interface MainViewProps {
  guestName: string;
  guestNameSize: number;
  setGuestName: (name: string) => void;
  setGuestNameSize: (size: number) => void;
  rankings: Ranking[];
  rankingBoxes: RankingBox[];
  onRankingMetaChange: (id: number, field: 'fullTitle' | 'keyword', value: string) => void;
  onSelectRanking: (boxId: number) => void;
  onLogoClick: () => void;
  onResetRanking: (id: number) => void;
  onNewEpisode: () => void;
  onExportEpisode: () => void;
  onImportEpisode: () => void;
}

const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.25,
    },
  },
};

// I biglietti arrivano "fuori registro" e vanno a registro, come un foglio appena stampato.
const ticketVariants = {
  hidden: { opacity: 0, y: 24, rotate: -3 },
  visible: { opacity: 1, y: 0, rotate: 0, transition: printSpring },
};

const ticketStateVariants = {
  idle: { opacity: 1, scale: 1, rotate: 0 },
  selected: { opacity: 1, scale: 1.06, rotate: -2 },
  dimmed: { opacity: 0.22, scale: 0.95, rotate: 0 },
};

// Raggio identico al pannello titolo del dettaglio: la trasformazione cambia solo le proporzioni.
const ticketShape = { borderRadius: 10 };
const ticketTransition = { ...printSpring, layout: stageMorphSpring };

const inkFor = (boxId: number) => (boxId % 2 === 1 ? 'var(--ink-pink)' : 'var(--ink-cyan)');

// ponytail: flag di modulo, l'ingresso a cascata parte solo la prima volta; tornando dal dettaglio la griglia è già lì.
let hasPlayedGridIntro = false;

const Ticket: React.FC<{
  box: RankingBox;
  isDimmed: boolean;
  isInteractionLocked: boolean;
  isSelected: boolean;
  onSelect: (boxId: number) => void;
}> = ({ box, isDimmed, isInteractionLocked, isSelected, onSelect }) => {
  const baseClasses = "ticket relative isolate flex aspect-square w-full flex-col items-center justify-center overflow-hidden p-4 text-center cursor-pointer focus:outline-none focus-visible:shadow-[inset_0_0_0_3px_var(--ink-white)]";
  const ranking = box.ranking;
  const visualState = isSelected ? 'selected' : isDimmed ? 'dimmed' : 'idle';
  const handleClick = () => {
    if (isInteractionLocked) {
      return;
    }

    onSelect(box.boxId);
  };
  // Mentre il biglietto si trasforma (layoutId) niente hover/tap: Motion somma lo zoom due volte e a fine corsa scatta.
  const [isMorphing, setIsMorphing] = useState(false);
  const isGestureOff = isInteractionLocked || isMorphing;
  const sharedProps = {
    type: 'button' as const,
    layoutId: `box-${box.boxId}`,
    onClick: handleClick,
    style: ticketShape,
    variants: ticketStateVariants,
    animate: visualState,
    transition: ticketTransition,
    whileHover: isGestureOff ? undefined : { y: -8, rotate: -1.5 },
    whileTap: isGestureOff ? undefined : { scale: 0.94, rotate: 0 },
    onLayoutAnimationStart: () => setIsMorphing(true),
    onLayoutAnimationComplete: () => setIsMorphing(false),
  };

  return (
    <motion.div layout className="relative" variants={ticketVariants}>
      {isSelected && (
        <motion.span
          layoutId="stage-spot"
          className="halftone halftone-fade pointer-events-none absolute inset-[-60%] -z-10 text-[var(--ink-pink)]"
          transition={stageMorphSpring}
        />
      )}
      {ranking?.completed ? (
        <motion.button
          {...sharedProps}
          aria-label={`Apri ${ranking.keyword}`}
          className={baseClasses}
          style={{ ...ticketShape, backgroundColor: inkFor(box.boxId) }}
        >
          <span className="halftone pointer-events-none absolute inset-0 text-black/15" />
          <span className="font-anybody pointer-events-none absolute top-4 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-black/60">
            Top 5 · N°{box.boxId}
          </span>
          <PrintedText
            text={ranking.keyword}
            className={`${keywordSizeClass(ranking.keyword)} ink-on-color relative break-words leading-none`}
            delay={0.25}
          />
        </motion.button>
      ) : (
        <motion.button
          {...sharedProps}
          aria-label={`Apri casella ${box.boxId}`}
          className={`${baseClasses} bg-[var(--paper-raised)]`}
        >
          <span className="font-anybody pointer-events-none absolute top-4 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[var(--ink-white)]/45">
            Top 5
          </span>
          <span className="pointer-events-none absolute inset-x-6 bottom-8 border-t-2 border-dashed border-[var(--ink-white)]/15" />
          <motion.span
            className="ink ink-outline font-anybody text-7xl leading-none sm:text-8xl"
            data-text={box.boxId}
            style={{ fontVariationSettings: "'wdth' 62, 'wght' 900" }}
            initial={false}
            animate={{ '--reg': isSelected ? '10px' : '4px' }}
            transition={printSpring}
          >
            {box.boxId}
          </motion.span>
        </motion.button>
      )}
    </motion.div>
  );
};

const keywordSizeClass = (keyword: string) => {
  if (keyword.length > 12) return 'text-xl sm:text-2xl';
  if (keyword.length > 8) return 'text-2xl sm:text-3xl';
  if (keyword.length > 5) return 'text-3xl sm:text-4xl';
  return 'text-4xl sm:text-5xl';
};

export const MainView: React.FC<MainViewProps> = ({
  guestName,
  guestNameSize,
  setGuestName,
  setGuestNameSize,
  rankings,
  rankingBoxes,
  onRankingMetaChange,
  onSelectRanking,
  onLogoClick,
  onResetRanking,
  onNewEpisode,
  onExportEpisode,
  onImportEpisode,
}) => {
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const selectTimeoutRef = useRef<number | null>(null);
  const guestNameScale = guestNameSize / 100;
  const [playGridIntro] = useState(() => !hasPlayedGridIntro);
  const guestNameStyle = {
    fontSize: `clamp(${2.25 * guestNameScale}rem, ${8 * guestNameScale}vh, ${7 * guestNameScale}rem)`,
  };

  useEffect(() => {
    hasPlayedGridIntro = true;
    return () => {
      if (selectTimeoutRef.current !== null) {
        window.clearTimeout(selectTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectBox = (boxId: number) => {
    if (selectedBoxId !== null) {
      return;
    }

    setSelectedBoxId(boxId);
    selectTimeoutRef.current = window.setTimeout(() => {
      onSelectRanking(boxId);
    }, 650);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center py-8">
      {/* Tasto invisibile nell'angolo in alto a destra dello schermo: si vede solo passandoci sopra. */}
      <motion.button
        type="button"
        aria-label="Apri impostazioni"
        title="Impostazioni"
        onClick={() => setIsSettingsOpen(true)}
        className="fixed right-0 top-0 z-[45] flex h-24 w-24 items-center justify-center border border-[var(--ink-white)]/0 bg-[var(--paper-raised)]/0 text-[var(--ink-white)] opacity-0 transition-all duration-150 hover:border-[var(--ink-white)]/25 hover:bg-[var(--paper-raised)] hover:opacity-100 hover:shadow-[4px_4px_0_0_var(--ink-cyan)] focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-white)]"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={quickTransition}
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .9l-.03.08a2 2 0 0 1-3.76 0l-.03-.08a1.7 1.7 0 0 0-1-.9 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.9-1l-.08-.03a2 2 0 0 1 0-3.76l.08-.03a1.7 1.7 0 0 0 .9-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.9l.03-.08a2 2 0 0 1 3.76 0l.03.08a1.7 1.7 0 0 0 1 .9 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.33.12.65.42.9 1l.08.03a2 2 0 0 1 0 3.76l-.08.03a1.7 1.7 0 0 0-.9 1Z" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isSettingsOpen && (
          <MainSettingsMenu
            guestNameSize={guestNameSize}
            onClose={() => setIsSettingsOpen(false)}
            onGuestNameSizeChange={setGuestNameSize}
            onRankingMetaChange={onRankingMetaChange}
            rankings={rankings}
            guestName={guestName}
            onGuestNameChange={setGuestName}
            onResetRanking={onResetRanking}
            onNewEpisode={onNewEpisode}
            onExportEpisode={onExportEpisode}
            onImportEpisode={onImportEpisode}
          />
        )}
      </AnimatePresence>

      <motion.div
        onClick={onLogoClick}
        className="z-10 w-full max-w-[min(52rem,76vh)] cursor-pointer px-4"
        initial={{ opacity: 0, y: -12, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ ...printSpring, delay: 0.04 }}
        whileHover={{ rotate: -1 }}
        whileTap={{ scale: 0.97 }}
      >
        <Logo />
      </motion.div>

      <motion.header
        className="z-20 mt-2 mb-8 flex w-full justify-center sm:mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...screenTransition, delay: 0.1 }}
      >
        {isEditingName || !guestName ? (
          <input
            type="text"
            value={guestName}
            autoFocus={isEditingName}
            onChange={(e) => setGuestName(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="font-anybody w-full bg-transparent px-6 py-3 text-center leading-none text-[var(--ink-white)] placeholder-[var(--ink-white)]/30 focus:outline-none"
            style={{ ...guestNameStyle, fontVariationSettings: "'wdth' 78, 'wght' 500" }}
            placeholder="Nome Ospite"
          />
        ) : (
          <button
            type="button"
            title="Clicca per modificare"
            onClick={() => setIsEditingName(true)}
            className="px-6 py-3 leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-white)]"
            style={guestNameStyle}
          >
            <PrintedText text={guestName} delay={0.15} stagger={0.045} />
          </button>
        )}
      </motion.header>

      <motion.main
        className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-8 lg:grid-cols-5"
        variants={gridVariants}
        initial={playGridIntro ? 'hidden' : false}
        animate="visible"
        layout
      >
        {selectedBoxId === null && (
          <motion.span
            layoutId="stage-spot"
            className="halftone halftone-fade pointer-events-none absolute inset-x-[10%] inset-y-[-25%] -z-10 text-[var(--ink-white)]/[0.07]"
            transition={stageMorphSpring}
          />
        )}
        {rankingBoxes.map((box) => (
          <Ticket
            key={box.boxId}
            box={box}
            isDimmed={selectedBoxId !== null && selectedBoxId !== box.boxId}
            isInteractionLocked={selectedBoxId !== null}
            isSelected={selectedBoxId === box.boxId}
            onSelect={handleSelectBox}
          />
        ))}
      </motion.main>
    </div>
  );
};
