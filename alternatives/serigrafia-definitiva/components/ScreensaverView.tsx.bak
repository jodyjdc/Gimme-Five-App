import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { easeOutQuart, screenTransition } from '../motionConfig';

interface ScreensaverViewProps {
  onExit: () => void;
}

const TICKER = 'Gimme Five ✦ Top 5 ✦ '.repeat(6);

// Due lastre a retino che girano in senso opposto: passano lentamente dentro e fuori registro.
// Tutto si muove piano, così sul proiettore non resta impressa un'immagine fissa.
const plates = [
  { color: 'var(--ink-cyan)', offset: '-7%', duration: 70, direction: 1 },
  { color: 'var(--ink-pink)', offset: '7%', duration: 90, direction: -1 },
];

export const ScreensaverView: React.FC<ScreensaverViewProps> = ({ onExit }) => {
  return (
    <motion.div
      className="paper-grain relative flex h-screen w-screen cursor-pointer flex-col items-center justify-center overflow-hidden bg-[var(--paper)]"
      onClick={onExit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: easeOutQuart }}
    >
      {plates.map((plate) => (
        <motion.div
          key={plate.color}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 * plate.direction }}
          transition={{ duration: plate.duration, ease: 'linear', repeat: Infinity }}
        >
          <div
            className="halftone halftone-fade absolute inset-0 rounded-full opacity-40 mix-blend-screen"
            style={{ color: plate.color, transform: `translateX(${plate.offset})` }}
          />
        </motion.div>
      ))}

      <motion.div
        className="z-10 w-1/2 max-w-5xl animate-float-slow"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={screenTransition}
      >
        <Logo />
      </motion.div>

      <div className="pointer-events-none absolute bottom-10 left-0 w-full overflow-hidden" aria-hidden="true">
        <motion.div
          className="flex w-max whitespace-pre"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
        >
          {[0, 1].map((copy) => (
            <span
              key={copy}
              className="ink ink-outline font-anybody text-7xl uppercase leading-none opacity-60"
              data-text={TICKER}
              style={{ fontVariationSettings: "'wdth' 62, 'wght' 900" }}
            >
              {TICKER}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};
