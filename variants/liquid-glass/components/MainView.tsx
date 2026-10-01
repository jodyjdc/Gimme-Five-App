import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking, RankingBox } from '../types';
import { Logo } from './Logo';
import { MainSettingsMenu } from './MainSettingsMenu';
import { Glass, trackGlassLight } from './Glass';
import { easeOutQuint, liquidMorphSpring } from '../motionConfig';

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
      staggerChildren: 0.09,
      delayChildren: 0.35,
    },
  },
};

// Le lastre emergono dal buio: salgono appena e si "posano" (molla liquida).
const tileVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: liquidMorphSpring },
};

// Logo del format: grande (inchiostro ~500px a 1080p). Il disegno ha il 18,6% di vuoto sopra e sotto:
// i margini negativi lo recuperano, così nome e caselle non vengono spinti giù.
const LOGO_WIDTH = 'min(71rem, 106vh, 94vw)';


// ponytail: flag di modulo, l'ingresso a cascata parte solo la prima volta; tornando dal dettaglio la griglia è già lì.
let hasPlayedGridIntro = false;

const Tile: React.FC<{
  box: RankingBox;
  isDimmed: boolean;
  isInteractionLocked: boolean;
  isSelected: boolean;
  onSelect: (boxId: number) => void;
}> = ({ box, isDimmed, isInteractionLocked, isSelected, onSelect }) => {
  const ranking = box.ranking;
  // Mentre la lastra si trasforma (layoutId) niente hover/tap: Motion somma lo zoom e a fine corsa scatta.
  const [isMorphing, setIsMorphing] = useState(false);
  const isGestureOff = isInteractionLocked || isMorphing;

  return (
    <motion.div className="relative" variants={tileVariants}>
      <Glass
        layoutId={`box-${box.boxId}`}
        // Casella tonda: lente circolare; trasformandosi nel titolo gli angoli passano da tondi a quelli del pannello.
        round
        depth={120}
        frost={0}
        role="button"
        tabIndex={0}
        aria-label={ranking?.completed ? `Apri ${ranking.keyword}` : `Apri casella ${box.boxId}`}
        onClick={() => !isInteractionLocked && onSelect(box.boxId)}
        onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && !isInteractionLocked && onSelect(box.boxId)}
        onPointerMove={trackGlassLight}
        className="flex aspect-square w-full cursor-pointer items-center justify-center p-4 text-center text-[var(--lg-ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
        style={ranking?.completed ? { backgroundColor: 'rgba(255,255,255,0.1)' } : undefined}
        initial={false}
        animate={{ opacity: isDimmed ? 0.25 : 1, scale: isSelected ? 1.06 : isDimmed ? 0.94 : 1 }}
        transition={{ ...liquidMorphSpring, layout: liquidMorphSpring }}
        whileHover={isGestureOff ? undefined : { scale: 1.05, y: -6 }}
        whileTap={isGestureOff ? undefined : { scale: 0.96 }}
        onLayoutAnimationStart={() => setIsMorphing(true)}
        onLayoutAnimationComplete={() => setIsMorphing(false)}
      >
        {ranking?.completed ? (
          <span className={`${keywordSizeClass(ranking.keyword)} font-tight lg-text-glow break-words font-semibold leading-[1.05] tracking-tight`}>
            {ranking.keyword}
          </span>
        ) : (
          <span className="font-tight lg-text-glow text-[8.5rem] font-bold leading-none tracking-tight">{box.boxId}</span>
        )}
      </Glass>
    </motion.div>
  );
};

const keywordSizeClass = (keyword: string) => {
  // Su TV da 53" nel totale: il più grande possibile dentro la casella (va a capo tra parole).
  if (keyword.length > 12) return 'text-2xl sm:text-3xl';
  if (keyword.length > 8) return 'text-3xl sm:text-4xl';
  if (keyword.length > 5) return 'text-4xl sm:text-5xl';
  return 'text-5xl sm:text-6xl';
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
  // Il nome dell'ospite è il protagonista della schermata (TV da 53" ripreso nel totale).
  const guestNameStyle = {
    fontSize: `calc(clamp(3.5rem, min(15vh, 9vw), 13rem) * ${guestNameScale})`,
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
    }, 550);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center py-2">
      {/* Tasto invisibile nell'angolo in alto a destra dello schermo: si vede solo passandoci sopra. */}
      <motion.button
        type="button"
        aria-label="Apri impostazioni"
        title="Impostazioni"
        onClick={() => setIsSettingsOpen(true)}
        className="fixed right-0 top-0 z-[45] flex h-24 w-24 items-center justify-center text-white opacity-0 transition-opacity duration-150 hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 24 24">
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
        className="z-10 cursor-pointer"
        style={{ width: LOGO_WIDTH, marginBlock: `calc(${LOGO_WIDTH} * -0.093)` }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: easeOutQuint }}
      >
        <Logo />
      </motion.div>

      {/* Respiro attorno al nome (~70-80px a 1080p), proporzionato all'altezza dello schermo. */}
      <header className="z-20 mt-[clamp(2.5rem,6.5vh,5rem)] mb-[clamp(3rem,7.5vh,6rem)] flex w-full flex-col items-center">
        {isEditingName || !guestName ? (
          <input
            type="text"
            value={guestName}
            autoFocus={isEditingName}
            onChange={(e) => setGuestName(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="font-tight lg-text-glow w-full bg-transparent px-6 text-center font-bold leading-none tracking-tight text-white caret-[var(--lg-cyan)] placeholder-white/25 focus:outline-none"
            style={guestNameStyle}
            placeholder="Nome Ospite"
          />
        ) : (
          <button
            type="button"
            title="Clicca per modificare"
            onClick={() => setIsEditingName(true)}
            className="font-tight lg-text-glow max-w-full px-6 text-center font-bold leading-[1.02] tracking-tight text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={guestNameStyle}
          >
            {/* Il nome emerge dal buio e si mette a fuoco (solo trasformazioni: il layout non si muove). */}
            <motion.span
              key={guestName}
              className="inline-block"
              initial={{ opacity: 0, y: 24, filter: 'blur(18px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, ease: easeOutQuint, delay: 0.15 }}
            >
              {guestName}
            </motion.span>
          </button>
        )}
      </header>

      <motion.main
        className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-8 lg:grid-cols-5"
        variants={gridVariants}
        initial={playGridIntro ? 'hidden' : false}
        animate="visible"
      >
        {rankingBoxes.map((box) => (
          <Tile
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
