import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking } from '../types';
import { Logo } from './Logo';
import { PixelFitText, PixelText } from './Pixel';
import { ARCADE_COLORS, arcadeColor, pixelSteps } from '../arcade';

interface ScreensaverViewProps {
  rankings: Ranking[];
  onExit: () => void;
}

const SLIDE_MS = 6000;
const RANK_LABELS = ['1°', '2°', '3°', '4°', '5°'];

// Campo di stelle a pixel (sparatutto da cabinato): quadratini che scendono lenti su tre piani di
// profondità, qualcuno lampeggia a scatti. Luminosità bassa: sta dietro il logo senza rubare la scena.
// Posizioni agganciate a una griglia di 4px, così resta "a pixel" anche in movimento.
const PIXEL = 4;
const STAR_COUNT = 150;

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const layers = [
      { speed: 14, size: 1, alpha: 0.35 },
      { speed: 28, size: 1, alpha: 0.55 },
      { speed: 52, size: 2, alpha: 0.8 },
    ];
    const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      layer: layers[i % layers.length],
      color: ARCADE_COLORS[i % ARCADE_COLORS.length],
      twinkle: Math.random() < 0.25 ? 0.4 + Math.random() * 1.2 : 0,
      phase: Math.random() * Math.PI * 2,
    }));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const star of stars) {
        if (!reduceMotion) {
          star.y += star.layer.speed * dt;
          if (star.y > canvas.height) {
            star.y = -PIXEL * 2;
            star.x = Math.random() * canvas.width;
          }
        }
        // Lampeggio a due stati (acceso/spento), niente sfumature.
        const on = star.twinkle === 0 || Math.sin(now / 1000 * star.twinkle * Math.PI * 2 + star.phase) > -0.3;
        if (!on) continue;
        const size = star.layer.size * PIXEL;
        ctx.globalAlpha = star.layer.alpha;
        ctx.fillStyle = star.color;
        ctx.fillRect(Math.round(star.x / PIXEL) * PIXEL, Math.round(star.y / PIXEL) * PIXEL, size, size);
      }
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50" />;
};

// "Attract mode" dei cabinati: si alternano il logo e le classifiche già completate, sopra il campo di stelle.
// Si accende e si spegne come un televisore a tubo: una riga luminosa che si apre / si chiude.
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
      className="crt relative flex h-screen w-screen cursor-pointer items-center justify-center overflow-hidden bg-[var(--crt-bg)]"
      onClick={onExit}
      initial={{ scaleY: 0.004, scaleX: 0.7, filter: 'brightness(4)' }}
      animate={{ scaleY: 1, scaleX: 1, filter: 'brightness(1)' }}
      exit={{ scaleY: 0.004, scaleX: 0.7, filter: 'brightness(4)' }}
      transition={{ duration: 0.32, ease: pixelSteps(6) }}
    >
      <Starfield />
      {/* Deriva lentissima: niente resta fermo abbastanza da imprimersi sul proiettore. */}
      <motion.div
        className="relative z-10 flex w-full flex-col items-center"
        animate={{ x: [0, 24, -18, 0], y: [0, -14, 10, 0] }}
        transition={{ duration: 40, ease: 'easeInOut', repeat: Infinity }}
      >
        <AnimatePresence mode="wait">
          {ranking ? (
            <motion.div
              key={`ranking-${ranking.id}`}
              className="flex w-full max-w-6xl flex-col items-center gap-16 px-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: pixelSteps(3) }}
            >
              <h2 className="w-full text-center text-6xl text-[var(--phosphor)] sm:text-7xl">
                <PixelText text={ranking.fullTitle} stagger={0.03} />
              </h2>
              {/* Tabella centrata come blocco, righe allineate a sinistra tra loro. */}
              <ol className="mx-auto flex w-fit max-w-full flex-col gap-7">
                {ranking.entries.map((entry, index) => (
                  <li key={index} className="grid grid-cols-[8rem_minmax(0,1fr)] items-end gap-8 text-5xl sm:text-6xl" style={{ color: arcadeColor(index) }}>
                    <PixelText text={RANK_LABELS[index]} delay={0.4 + index * 0.25} />
                    <PixelFitText minScale={0.5} text={entry || '..........'} delay={0.45 + index * 0.25} stagger={0.03} />
                  </li>
                ))}
              </ol>
            </motion.div>
          ) : (
            <motion.div
              key="logo"
              className="flex w-full flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: pixelSteps(3) }}
            >
              <div className="w-[min(90vw,120vh)]">
                <Logo />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
