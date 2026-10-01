import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking, RankingBox } from '../types';
import { Logo } from './Logo';
import { MainSettingsMenu } from './MainSettingsMenu';
import { PixelInput, PixelText } from './Pixel';
import { ARCADE_COLORS, arcadeColor, pixelSteps, sound } from '../arcade';

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
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

// I riquadri "si accendono" a scatti, come uno schermo che disegna uno sprite alla volta.
const tileVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: pixelSteps(3) } },
};

const tileStateVariants = {
  idle: { opacity: 1 },
  selected: { opacity: 1 },
  dimmed: { opacity: 0.18, transition: { duration: 0.3, ease: pixelSteps(3) } },
};

// La trasformazione riquadro → pagina avviene in 8 fotogrammi a scatti, come uno sprite.
const tileTransition = { layout: { duration: 0.56, ease: pixelSteps(8) } };

// Quando si sceglie un riquadro la cornice passa per tutti i colori (color cycling dei vecchi giochi).
const paletteCycle = [...ARCADE_COLORS, ...ARCADE_COLORS, '#ffffff'];
const stepEase = () => 1;

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
  const color = arcadeColor(box.boxId - 1);
  const visualState = isSelected ? 'selected' : isDimmed ? 'dimmed' : 'idle';
  const handleClick = () => {
    if (isInteractionLocked) {
      return;
    }

    onSelect(box.boxId);
  };
  // Mentre il riquadro si trasforma (layoutId) niente tap: la pressione sommata alla trasformazione fa scattare la fine.
  const [isMorphing, setIsMorphing] = useState(false);
  const isGestureOff = isInteractionLocked || isMorphing;

  return (
    <motion.div layout className="group relative" variants={tileVariants}>
      {!isInteractionLocked && (
        <span aria-hidden="true" className="arrow-bob invisible absolute -left-9 top-1/2 -translate-y-1/2 text-2xl group-hover:visible" style={{ color }}>
          <PixelText text="►" flash={false} />
        </span>
      )}
      <motion.button
        type="button"
        layoutId={`box-${box.boxId}`}
        aria-label={ranking?.completed ? `Apri ${ranking.keyword}` : `Apri casella ${box.boxId}`}
        onClick={handleClick}
        className="pixel-frame relative flex aspect-square w-full cursor-pointer p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        style={{ backgroundColor: color }}
        variants={tileStateVariants}
        animate={isSelected ? { opacity: 1, backgroundColor: paletteCycle } : visualState}
        transition={isSelected ? { backgroundColor: { duration: 0.6, ease: stepEase }, ...tileTransition } : tileTransition}
        whileTap={isGestureOff ? undefined : { y: 3 }}
        onLayoutAnimationStart={() => setIsMorphing(true)}
        onLayoutAnimationComplete={() => setIsMorphing(false)}
      >
        <span
          className="pixel-frame relative flex h-full w-full flex-col items-center justify-center gap-3 p-3 text-center transition-colors duration-100"
          style={{ backgroundColor: ranking?.completed ? `color-mix(in srgb, ${color} 18%, var(--crt-bg))` : 'var(--crt-bg)', color }}
        >
          {ranking?.completed ? (
            <>
              <span className={`${keywordSizeClass(ranking.keyword)} break-words leading-tight text-[var(--phosphor)]`}>
                <PixelText text={ranking.keyword} delay={0.3} stagger={0.05} />
              </span>
              <span className="text-3xl">
                <PixelText text="★★★★★" delay={0.6} stagger={0.08} />
              </span>
            </>
          ) : (
            <span className="text-7xl sm:text-8xl">
              <PixelText text={String(box.boxId)} flash={false} />
            </span>
          )}
        </span>
      </motion.button>
    </motion.div>
  );
};

const keywordSizeClass = (keyword: string) => {
  // Su TV da 53" nel totale: il più grande possibile dentro la casella (va a capo tra parole).
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

    sound.select();
    setSelectedBoxId(boxId);
    selectTimeoutRef.current = window.setTimeout(() => {
      onSelectRanking(boxId);
    }, 650);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center py-2">
      {/* Tasto invisibile nell'angolo in alto a destra dello schermo: si vede solo passandoci sopra. */}
      <motion.button
        type="button"
        aria-label="Apri impostazioni"
        title="Impostazioni"
        onClick={() => setIsSettingsOpen(true)}
        className="fixed right-0 top-0 z-[45] flex h-24 w-24 items-center justify-center text-[var(--arc-cyan)] opacity-0 transition-opacity duration-100 hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--arc-cyan)]"
        whileTap={{ y: 2 }}
      >
        {/* Ingranaggio a pixel. */}
        <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 8 8" shapeRendering="crispEdges" fill="currentColor">
          <path d="M3 0h2v1h1v1h1v2h-1v1h1v2h-1v1h-1v-1H5v1H3v-1H2v1H1v-1H0V5h1V4H0V2h1V1h1V0h1zM3 3v2h2V3z" />
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
        // Logo del format: grande (inchiostro ~500px a 1080p). Il disegno ha il 18,6% di vuoto sopra e sotto:
        // i margini negativi lo recuperano, così nome e caselle non vengono spinti giù.
        style={{ width: LOGO_WIDTH, marginBlock: `calc(${LOGO_WIDTH} * -0.093)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: pixelSteps(4) }}
        whileTap={{ y: 3 }}
      >
        <Logo />
      </motion.div>

      {/* Respiro attorno al nome (~70-80px a 1080p), proporzionato all'altezza dello schermo. */}
      <header className="z-20 mt-[clamp(2.5rem,6.5vh,5rem)] mb-[clamp(3rem,7.5vh,6rem)] flex w-full flex-col items-center">
        {isEditingName || !guestName ? (
          <PixelInput
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
            autoFocus={isEditingName}
            placeholder="NOME OSPITE"
            align="center"
            className="w-full px-6 text-[var(--phosphor)]"
            style={guestNameStyle}
          />
        ) : (
          <button
            type="button"
            title="Clicca per modificare"
            onClick={() => setIsEditingName(true)}
            className="max-w-full px-6 text-center text-[var(--phosphor)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={guestNameStyle}
          >
            <PixelText text={guestName} delay={0.2} stagger={0.06} />
          </button>
        )}
      </header>

      <motion.main
        className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-8 lg:grid-cols-5"
        variants={gridVariants}
        initial={playGridIntro ? 'hidden' : false}
        animate="visible"
        layout
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
