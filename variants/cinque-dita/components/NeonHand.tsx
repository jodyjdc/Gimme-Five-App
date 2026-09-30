import React, { useId } from 'react';
import { motion } from 'motion/react';
import { FINGER_ZONES, HAND_PATH, HAND_VIEWBOX, PALM_ZONE, toPoints } from '../hand';
import { IGNITION } from '../motionConfig';
import { NeonColor } from './neon';

interface NeonHandProps {
  /** Dita accese, dal pollice (1) al mignolo (5). */
  lit: boolean[];
  palm: boolean;
  color: NeonColor;
  /** Zona "in preriscaldamento" (pulsa appena): il dito della posizione che si sta scrivendo, o il palmo. */
  warm?: number | 'palm' | null;
  className?: string;
  style?: React.CSSProperties;
  layoutId?: string;
}

const COLOR: Record<NeonColor, string> = {
  cyan: 'rgb(0, 208, 255)',
  magenta: 'rgb(255, 100, 196)',
};

type ZoneState = 'off' | 'warm' | 'on';

// Una zona della mano accesa: il nastro del logo ritagliato sulla zona, con l'alone fuori dal ritaglio.
const Zone: React.FC<{ clipId: string; state: ZoneState; level?: number }> = ({ clipId, state, level = 1 }) => (
  <motion.g
    initial={false}
    animate={
      state === 'on'
        ? { ...IGNITION, opacity: IGNITION.opacity.map(value => value * level) }
        : state === 'warm'
          ? { opacity: [0.12, 0.4, 0.12], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }
          : { opacity: 0, transition: { duration: 0.35 } }
    }
    style={{ filter: 'drop-shadow(0 0 6px currentColor) drop-shadow(0 0 20px currentColor)' }}
  >
    <path d={HAND_PATH} fill="currentColor" clipPath={`url(#${clipId})`} />
  </motion.g>
);

// La mano del logo come insegna: sotto il vetro spento, sopra le zone che si accendono.
export const NeonHand: React.FC<NeonHandProps> = ({ lit, palm, color, warm = null, className = '', style, layoutId }) => {
  const id = useId().replace(/:/g, '');
  const palmState: ZoneState = palm ? 'on' : warm === 'palm' ? 'warm' : 'off';

  return (
    <motion.div layoutId={layoutId} className={className} style={style} aria-hidden="true">
      <svg viewBox={HAND_VIEWBOX} className="block h-full w-full" overflow="visible" style={{ color: COLOR[color], transition: 'color 0.6s ease' }}>
        <defs>
          <clipPath id={`${id}-palm`} clipPathUnits="userSpaceOnUse">
            <polygon points={toPoints(PALM_ZONE)} />
          </clipPath>
          {FINGER_ZONES.map((zone, index) => (
            <clipPath key={index} id={`${id}-f${index}`} clipPathUnits="userSpaceOnUse">
              <polygon points={toPoints(zone)} />
            </clipPath>
          ))}
        </defs>
        <path d={HAND_PATH} fill="rgb(24, 32, 40)" />
        {/* Il palmo resta a mezza luce finché non si accendono tutte e cinque le dita: così il pollice si distingue. */}
        <Zone clipId={`${id}-palm`} state={palmState} level={lit.every(Boolean) ? 1 : 0.4} />
        {FINGER_ZONES.map((_, index) => (
          <Zone key={index} clipId={`${id}-f${index}`} state={lit[index] ? 'on' : warm === index ? 'warm' : 'off'} />
        ))}
      </svg>
    </motion.div>
  );
};
