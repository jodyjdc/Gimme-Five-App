import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking } from '../types';
import { Logo } from './Logo';
import { Glass, LightField } from './Glass';
import { FitText } from './FitInput';
import { easeOutQuint } from '../motionConfig';

interface ScreensaverViewProps {
  rankings: Ranking[];
  onExit: () => void;
}

const SLIDE_MS = 8000;

// Salvaschermo: logo grande davanti alle luci; una grande lente di vetro attraversa lentamente lo schermo
// e, passando sopra il logo, lo piega. Poco invasiva, ma viva. A rotazione, le classifiche completate.
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
    <motion.div
      className="relative flex h-screen w-screen cursor-pointer items-center justify-center overflow-hidden"
      onClick={onExit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: easeOutQuint }}
    >
      <LightField />

      <AnimatePresence mode="wait">
        {ranking ? (
          <motion.div
            key={`ranking-${ranking.id}`}
            className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-12 px-12"
            initial={{ opacity: 0, filter: 'blur(16px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(16px)' }}
            transition={{ duration: 1, ease: easeOutQuint }}
          >
            <h2 className="font-tight lg-text-glow text-center text-7xl font-bold tracking-tight text-white">{ranking.fullTitle}</h2>
            <div className="mx-auto grid w-fit grid-cols-[auto_min(42rem,70vw)] items-center gap-x-10 gap-y-5">
              {ranking.entries.map((entry, index) => (
                <React.Fragment key={index}>
                  <span className="font-tight flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-5xl font-semibold tabular-nums text-white shadow-[inset_0_1.5px_0_rgba(255,255,255,0.5)]">{index + 1}</span>
                  <FitText text={entry || '—'} className="font-tight lg-text-glow text-6xl font-semibold tracking-tight text-white" />
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="logo"
            className="relative z-10 w-[min(80vw,110vh)]"
            initial={{ opacity: 0, filter: 'blur(16px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(16px)' }}
            transition={{ duration: 1, ease: easeOutQuint }}
          >
            <Logo />
          </motion.div>
        )}
      </AnimatePresence>

      {/* La lente: attraversa lo schermo su un percorso lento e ampio (niente resta fermo: nessuna immagine impressa). */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-20"
        initial={{ x: '-40vmin', y: '20vh' }}
        animate={{ x: ['-40vmin', '70vw', '110vw', '30vw', '-40vmin'], y: ['20vh', '10vh', '55vh', '60vh', '20vh'] }}
        transition={{ duration: 60, ease: 'easeInOut', repeat: Infinity }}
      >
        <Glass radius={9999} depth={160} frost={0} className="h-[40vmin] w-[40vmin]" />
      </motion.div>
    </motion.div>
  );
};
