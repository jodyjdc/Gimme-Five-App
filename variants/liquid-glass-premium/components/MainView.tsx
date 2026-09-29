import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking, RankingBox } from '../types';
import { Logo } from './Logo';
import { MainSettingsMenu } from './MainSettingsMenu';
import { broadcastTransition, liquidGlassSpring, liquidMorphSpring, quickTransition, screenTransition } from '../motionConfig';

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
}

const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.18,
    },
  },
};

const bubbleVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: broadcastTransition },
};

const bubbleStateVariants = {
  idle: { opacity: 1, scale: 1 },
  selected: { opacity: 1, scale: 1.06 },
  dimmed: { opacity: 0.3, scale: 0.95 },
};

// Raggio in px (non %) così si interpola con quello del pannello titolo nel dettaglio.
const bubbleShape = { borderRadius: 200 };
const bubbleTransition = { ...liquidGlassSpring, layout: liquidMorphSpring };

// Luce sul vetro che segue il puntatore (le variabili CSS hanno una transizione, quindi insegue con un filo di ritardo).
const trackGlassLight = (event: React.PointerEvent<HTMLElement>) => {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--glass-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
  event.currentTarget.style.setProperty('--glass-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
};

const resetGlassLight = (event: React.PointerEvent<HTMLElement>) => {
  event.currentTarget.style.removeProperty('--glass-x');
  event.currentTarget.style.removeProperty('--glass-y');
};

// ponytail: flag di modulo, l'ingresso a cascata parte solo la prima volta; tornando dal dettaglio la griglia è già lì.
let hasPlayedGridIntro = false;

const Bubble: React.FC<{
  box: RankingBox;
  isDimmed: boolean;
  isInteractionLocked: boolean;
  isSelected: boolean;
  onSelect: (boxId: number) => void;
}> = ({ box, isDimmed, isInteractionLocked, isSelected, onSelect }) => {
  const baseClasses = "group relative isolate w-full aspect-square flex flex-col items-center justify-center overflow-hidden p-4 text-center cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black";
  const ranking = box.ranking;
  const visualState = isSelected ? 'selected' : isDimmed ? 'dimmed' : 'idle';
  const handleClick = () => {
    if (isInteractionLocked) {
      return;
    }

    onSelect(box.boxId);
  };
  // Mentre la casella si trasforma (layoutId) niente hover/tap: Motion somma lo zoom due volte e a fine corsa scatta.
  const [isMorphing, setIsMorphing] = useState(false);
  const isGestureOff = isInteractionLocked || isMorphing;
  const hover = isGestureOff ? undefined : { scale: 1.04 };
  const tap = isGestureOff ? undefined : { scale: 0.97 };
  const sharedProps = {
    type: 'button' as const,
    layoutId: `box-${box.boxId}`,
    onClick: handleClick,
    onPointerMove: trackGlassLight,
    onPointerLeave: resetGlassLight,
    style: bubbleShape,
    variants: bubbleStateVariants,
    animate: visualState,
    transition: bubbleTransition,
    whileHover: hover,
    whileTap: tap,
    onLayoutAnimationStart: () => setIsMorphing(true),
    onLayoutAnimationComplete: () => setIsMorphing(false),
  };

  return (
    <motion.div layout className="relative" variants={bubbleVariants}>
      {isSelected && (
        <motion.span
          layoutId="stage-spot"
          className="pointer-events-none absolute inset-[-55%] -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),rgba(103,232,249,0.12)_40%,transparent_68%)]"
          transition={liquidMorphSpring}
        />
      )}
      {ranking?.completed ? (
        <motion.button
          {...sharedProps}
          aria-label={`Apri ${ranking.keyword}`}
          className={`${baseClasses} glass glass-tint`}
        >
          <motion.h3
            key={ranking.keyword}
            className={`${keywordSizeClass(ranking.keyword)} relative font-display font-semibold leading-tight tracking-tight text-white break-words [text-shadow:0_1px_12px_rgba(8,47,73,0.55)]`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...broadcastTransition, delay: 0.15 }}
          >
            {ranking.keyword}
          </motion.h3>
        </motion.button>
      ) : (
        <motion.button
          {...sharedProps}
          aria-label={`Apri casella ${box.boxId}`}
          className={`${baseClasses} glass`}
        >
          <motion.h2
            className="relative bg-gradient-to-b from-white to-white/45 bg-clip-text font-display text-6xl font-extralight leading-none tabular-nums text-transparent sm:text-8xl"
            initial={false}
            animate={{ opacity: isSelected ? 1 : 0.85 }}
            transition={quickTransition}
          >
            {box.boxId}
          </motion.h2>
        </motion.button>
      )}
    </motion.div>
  );
};

const keywordSizeClass = (keyword: string) => {
  if (keyword.length > 12) return 'text-base sm:text-xl';
  if (keyword.length > 8) return 'text-lg sm:text-2xl';
  if (keyword.length > 5) return 'text-xl sm:text-3xl';
  return 'text-2xl sm:text-4xl';
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
}) => {
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const selectTimeoutRef = useRef<number | null>(null);
  const guestNameScale = guestNameSize / 100;
  const [playGridIntro] = useState(() => !hasPlayedGridIntro);

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
        className="fixed right-0 top-0 z-[45] flex h-24 w-24 items-center justify-center border border-cyan-300/0 bg-black/0 text-cyan-100 opacity-0 shadow-[0_0_22px_rgba(34,211,238,0)] backdrop-blur transition-all duration-150 hover:border-cyan-300/35 hover:bg-black/55 hover:opacity-100 hover:shadow-[0_0_22px_rgba(34,211,238,0.18)] focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-cyan-300"
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
          />
        )}
      </AnimatePresence>

      <motion.div
        onClick={onLogoClick}
        className="z-10 w-full max-w-[min(52rem,76vh)] cursor-pointer px-4 drop-shadow-[0_0_30px_rgba(34,211,238,0.24)]"
        initial={{ opacity: 0, y: -12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...screenTransition, delay: 0.04 }}
        whileHover={{ scale: 1.012 }}
        whileTap={{ opacity: 0.84 }}
      >
        <Logo />
      </motion.div>
      
      <motion.header
        className="z-20 mt-2 mb-8 w-full sm:mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...screenTransition, delay: 0.1 }}
      >
         <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full bg-transparent text-white placeholder-gray-500 text-4xl sm:text-7xl lg:text-8xl xl:text-9xl leading-none font-display font-semibold tracking-tight text-center py-3 px-6 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:rounded-lg transition-all"
            style={{
              fontSize: `clamp(${2.25 * guestNameScale}rem, ${8 * guestNameScale}vh, ${7 * guestNameScale}rem)`,
            }}
            placeholder="Nome Ospite"
        />
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
            className="pointer-events-none absolute inset-x-[4%] inset-y-[-30%] -z-10 rounded-full bg-[radial-gradient(ellipse,rgba(255,255,255,0.07),rgba(103,232,249,0.05)_40%,transparent_66%)]"
            transition={liquidMorphSpring}
          />
        )}
        {rankingBoxes.map((box) => (
          <Bubble
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
