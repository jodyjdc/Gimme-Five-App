import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking } from '../types';
import { Logo } from './Logo';
import { NeonHand } from './NeonHand';
import { HAND_ASPECT } from '../hand';
import { FitText } from './FitInput';
import { neonTube } from './neon';
import { IGNITION } from '../motionConfig';

interface ScreensaverViewProps {
  rankings: Ranking[];
  onExit: () => void;
}

const SLIDE_MS = 9000;
const ALL_LIT = [true, true, true, true, true];

// Salvaschermo: nel buio restano solo le insegne. A rotazione il logo e le classifiche completate
// (ognuna con la sua mano accesa in magenta). Ogni cambio è un'accensione; tutto scivola piano
// per l'intero schermo, così niente resta fermo nello stesso punto.
export const ScreensaverView: React.FC<ScreensaverViewProps> = ({ rankings, onExit }) => {
  const completed = rankings.filter(ranking => ranking.completed);
  const slideCount = completed.length + 1;
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (slideCount < 2) return;
    const interval = window.setInterval(() => setSlide(current => (current + 1) % slideCount), SLIDE_MS);
    return () => window.clearInterval(interval);
  }, [slideCount]);

  const ranking = slide > 0 ? completed[slide - 1] : null;

  return (
    <div className="relative flex h-screen w-screen cursor-pointer items-center justify-center overflow-hidden bg-black" onClick={onExit}>
      <motion.div
        className="flex items-center justify-center"
        animate={{ x: ['-3vw', '3vw', '2vw', '-3vw'], y: ['-2vh', '1vh', '3vh', '-2vh'] }}
        transition={{ duration: 70, ease: 'easeInOut', repeat: Infinity }}
      >
        <AnimatePresence mode="wait">
          {ranking ? (
            <motion.div
              key={`ranking-${ranking.id}`}
              className="flex flex-col items-center gap-12 px-12"
              initial={{ opacity: 0 }}
              animate={IGNITION}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
            >
              <h2 className="cd-glow-magenta rounded-full px-16 py-8 text-center text-7xl font-bold text-white" style={{ boxShadow: neonTube('magenta') }}>
                {ranking.fullTitle}
              </h2>
              <div className="grid grid-cols-[auto_auto] items-center gap-x-[min(6rem,5vw)]">
                <NeonHand lit={ALL_LIT} palm color="magenta" style={{ height: 'min(30rem, 26vw)', aspectRatio: HAND_ASPECT }} />
                <div className="grid w-fit grid-cols-[auto_min(42rem,44vw)] items-center gap-x-10 gap-y-5">
                  {ranking.entries.map((entry, index) => (
                    <React.Fragment key={index}>
                      <span className="cd-glow flex h-24 w-24 items-center justify-center rounded-full text-5xl font-medium tabular-nums text-white" style={{ boxShadow: neonTube('ghost') }}>
                        {index + 1}
                      </span>
                      <FitText text={entry || '—'} className="cd-glow text-6xl font-semibold text-white" />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="logo"
              className="w-[min(80vw,110vh)]"
              style={{ filter: 'drop-shadow(0 0 12px rgba(0, 208, 255, 0.4)) drop-shadow(0 0 32px rgba(255, 100, 196, 0.2))' }}
              initial={{ opacity: 0 }}
              animate={IGNITION}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
            >
              <Logo />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
