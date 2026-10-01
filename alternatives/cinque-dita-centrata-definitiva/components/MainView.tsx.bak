import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking, RankingBox } from '../types';
import { Logo } from './Logo';
import { MainSettingsMenu } from './MainSettingsMenu';
import { FitText } from './FitInput';
import { neonTube } from './neon';
import { IGNITION, easeOutQuint, morphTransition, neonSpring } from '../motionConfig';

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

// Accensione in sequenza: prima il logo, poi il nome, poi gli anelli da 1 a 5.
const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.9 } },
};

const tileVariants = {
  hidden: { opacity: 0 },
  visible: IGNITION,
};

// Logo del format: grande (inchiostro ~500px a 1080p). Il disegno ha il 18,6% di vuoto sopra e sotto:
// i margini negativi lo recuperano, così nome e anelli non vengono spinti giù.
const LOGO_WIDTH = 'min(71rem, 106vh, 94vw)';

// Anelli al neon (come i tubi piegati a cerchio). Il raggio è "tutto tondo" anche nel titolo: cambia solo la forma.
const RADIUS = 9999;

// ponytail: flag di modulo, l'accensione in sequenza parte solo la prima volta; tornando dalla classifica è già tutto acceso.
let hasPlayedIntro = false;

const Ring: React.FC<{
  box: RankingBox;
  playIntro: boolean;
  isDimmed: boolean;
  isInteractionLocked: boolean;
  isSelected: boolean;
  onSelect: (boxId: number) => void;
}> = ({ box, playIntro, isDimmed, isInteractionLocked, isSelected, onSelect }) => {
  const ranking = box.ranking;
  const isDone = Boolean(ranking?.completed);
  // Mentre l'anello si trasforma (layoutId) niente hover/tap: Motion somma lo zoom e a fine corsa scatta.
  const [isMorphing, setIsMorphing] = useState(false);
  const isGestureOff = isInteractionLocked || isMorphing;
  const color = isDimmed ? null : isDone ? 'magenta' : 'cyan';

  return (
    <motion.div className="relative" variants={playIntro ? tileVariants : undefined}>
      <motion.div
        layoutId={`box-${box.boxId}`}
        role="button"
        tabIndex={0}
        aria-label={isDone ? `Apri ${ranking?.keyword}` : `Apri casella ${box.boxId}`}
        onClick={() => !isInteractionLocked && onSelect(box.boxId)}
        onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && !isInteractionLocked && onSelect(box.boxId)}
        className="flex aspect-square w-full cursor-pointer items-center justify-center px-6 text-center text-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-white"
        style={{ borderRadius: RADIUS }}
        // Tornando dalla classifica gli anelli partono "in viaggio" (filo sottile) e si riaccendono pieni.
        initial={playIntro ? false : { boxShadow: neonTube(color, true) }}
        // Scelto un anello: gli altri si spengono, il suo si avvicina appena e poi si allarga nel titolo.
        animate={{
          boxShadow: neonTube(color, isMorphing),
          scale: isSelected ? 1.06 : 1,
        }}
        transition={{ ...neonSpring, boxShadow: { duration: isMorphing ? 0.12 : 0.35 }, layout: morphTransition }}
        // Niente dissolvenza tra il titolo che se ne va e l'anello che arriva: si vede un solo tubo.
        layoutCrossfade={false}
        exit={{ opacity: 0, transition: { duration: 0 } }}
        whileHover={isGestureOff ? undefined : { scale: 1.05 }}
        whileTap={isGestureOff ? undefined : { scale: 0.96 }}
        onLayoutAnimationStart={() => setIsMorphing(true)}
        onLayoutAnimationComplete={() => setIsMorphing(false)}
      >
        {/* Il numero sparisce prima che l'anello si allarghi (e riappare solo a trasformazione finita):
            dentro una forma che si stira verrebbe deformato. */}
        <motion.span
          className="flex w-full justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isSelected || isMorphing ? 0 : isDimmed ? 0.3 : 1 }}
          transition={{ duration: isSelected || isMorphing ? 0.15 : 0.4 }}
        >
          {isDone && ranking ? (
            <FitText text={ranking.keyword} minScale={0.4} className="cd-glow-magenta w-full justify-center text-6xl font-semibold leading-none" />
          ) : (
            <span className="cd-glow text-[8.5rem] font-extralight leading-none">{box.boxId}</span>
          )}
        </motion.span>
      </motion.div>
    </motion.div>
  );
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
  const [isEditingName, setIsEditingName] = useState(false);
  const selectTimeoutRef = useRef<number | null>(null);
  const [playIntro] = useState(() => !hasPlayedIntro);
  // Il nome dell'ospite è il protagonista della schermata (TV da 53" ripreso nel totale).
  const guestNameStyle = {
    fontSize: `calc(clamp(3.5rem, min(15vh, 9vw), 13rem) * ${guestNameSize / 100})`,
  };

  useEffect(() => {
    hasPlayedIntro = true;
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
    }, 320);
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center py-2">
      {/* Tasto invisibile nell'angolo in alto a destra dello schermo: si vede solo passandoci sopra. */}
      <button
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
      </button>

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

      {/* Il logo è già un'insegna al neon: si accende per primo, con un alone morbido. */}
      <motion.div
        onClick={onLogoClick}
        className="z-10 cursor-pointer"
        style={{
          width: LOGO_WIDTH,
          marginBlock: `calc(${LOGO_WIDTH} * -0.093)`,
          filter: 'drop-shadow(0 0 10px rgba(0, 208, 255, 0.35)) drop-shadow(0 0 28px rgba(255, 100, 196, 0.18))',
        }}
        initial={playIntro ? { opacity: 0 } : false}
        animate={playIntro ? IGNITION : undefined}
      >
        <Logo />
      </motion.div>

      {/* Respiro attorno al nome (~70-80px a 1080p), proporzionato all'altezza dello schermo. */}
      <header className="z-20 mb-[clamp(3rem,7.5vh,6rem)] mt-[clamp(2.5rem,6.5vh,5rem)] flex w-full flex-col items-center">
        {isEditingName || !guestName ? (
          <input
            type="text"
            value={guestName}
            autoFocus={isEditingName}
            onChange={(e) => setGuestName(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="cd-glow w-full bg-transparent px-6 text-center font-bold leading-none text-white caret-[rgb(0,208,255)] placeholder-white/25 focus:outline-none"
            style={guestNameStyle}
            placeholder="Nome Ospite"
          />
        ) : (
          <button
            type="button"
            title="Clicca per modificare"
            onClick={() => setIsEditingName(true)}
            className="cd-glow max-w-full px-6 text-center font-bold leading-[1.02] text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={guestNameStyle}
          >
            <motion.span
              key={guestName}
              className="inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, ease: easeOutQuint, delay: playIntro ? 0.45 : 0 }}
            >
              {guestName}
            </motion.span>
          </button>
        )}
      </header>

      <motion.main
        className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-8 lg:grid-cols-5"
        variants={playIntro ? gridVariants : undefined}
        initial={playIntro ? 'hidden' : false}
        animate="visible"
      >
        {rankingBoxes.map((box) => (
          <Ring
            key={box.boxId}
            box={box}
            playIntro={playIntro}
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
