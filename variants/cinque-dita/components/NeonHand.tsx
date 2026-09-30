import React, { useId } from 'react';
import { motion } from 'motion/react';
import { FINGER_ZONES, HAND_GRADIENT, HAND_PATH, HAND_VIEWBOX, JOINT_ZONES, PALM_ZONE, toPoints } from '../hand';
import { IGNITION } from '../motionConfig';

interface NeonHandProps {
  /** Dita accese, dal pollice (1) al mignolo (5). */
  lit: boolean[];
  palm: boolean;
  /** Zona "in preriscaldamento" (pulsa appena): il dito della posizione che si sta scrivendo, o il palmo.
   *  Il palmo, se spento, pulsa anche insieme al pollice (si accendono insieme). */
  warm?: number | 'palm' | null;
  className?: string;
  style?: React.CSSProperties;
  layoutId?: string;
}

type ZoneState = 'off' | 'warm' | 'on';

// Una zona della mano accesa: il nastro del logo, con la sua sfumatura, ritagliato sulla zona.
// L'alone è la stessa zona sfocata, quindi prende i colori del logo (azzurro sopra, rosa sotto).
const Zone: React.FC<{ clipId: string; glowId: string; fill: string; state: ZoneState }> = ({ clipId, glowId, fill, state }) => (
  <motion.g
    initial={false}
    animate={
      state === 'on'
        ? IGNITION
        : state === 'warm'
          ? { opacity: [0.12, 0.4, 0.12], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }
          : { opacity: 0, transition: { duration: 0.35 } }
    }
    filter={`url(#${glowId})`}
  >
    <path d={HAND_PATH} fill={fill} clipPath={`url(#${clipId})`} />
  </motion.g>
);

// La mano del logo come insegna: sotto il vetro spento, sopra le zone che si accendono con i colori del logo.
export const NeonHand: React.FC<NeonHandProps> = ({ lit, palm, warm = null, className = '', style, layoutId }) => {
  const id = useId().replace(/:/g, '');
  const fill = `url(#${id}-g)`;
  const glowId = `${id}-glow`;
  const palmState: ZoneState = palm ? 'on' : warm === 'palm' || warm === 0 ? 'warm' : 'off';

  return (
    <motion.div layoutId={layoutId} className={className} style={style} aria-hidden="true">
      <svg viewBox={HAND_VIEWBOX} className="block h-full w-full" overflow="visible">
        <defs>
          <linearGradient id={`${id}-g`} x1={HAND_GRADIENT.x1} y1={HAND_GRADIENT.y1} x2={HAND_GRADIENT.x2} y2={HAND_GRADIENT.y2} gradientUnits="userSpaceOnUse">
            {HAND_GRADIENT.stops.map(([offset, color], index) => <stop key={index} offset={offset} stopColor={color} />)}
          </linearGradient>
          {/* Alone in due strati (stretto e largo), in unità del disegno: cresce e cala con la mano. */}
          <filter id={glowId} filterUnits="userSpaceOnUse" x="430" y="70" width="725" height="800">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="near" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="13" result="far" />
            <feMerge>
              <feMergeNode in="far" />
              <feMergeNode in="near" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={`${id}-palm`} clipPathUnits="userSpaceOnUse">
            <polygon points={toPoints(PALM_ZONE)} />
          </clipPath>
          {FINGER_ZONES.map((zone, index) => (
            <clipPath key={index} id={`${id}-f${index}`} clipPathUnits="userSpaceOnUse">
              <polygon points={toPoints(zone)} />
            </clipPath>
          ))}
          {JOINT_ZONES.map(({ zone }, index) => (
            <clipPath key={index} id={`${id}-j${index}`} clipPathUnits="userSpaceOnUse">
              <polygon points={toPoints(zone)} />
            </clipPath>
          ))}
        </defs>
        <path d={HAND_PATH} fill="rgb(24, 32, 40)" />
        <Zone clipId={`${id}-palm`} glowId={glowId} fill={fill} state={palmState} />
        {FINGER_ZONES.map((_, index) => (
          <Zone key={index} clipId={`${id}-f${index}`} glowId={glowId} fill={fill} state={lit[index] ? 'on' : warm === index ? 'warm' : 'off'} />
        ))}
        {JOINT_ZONES.map(({ finger }, index) => (
          <Zone key={`j${index}`} clipId={`${id}-j${index}`} glowId={glowId} fill={fill} state={palm && lit[finger] ? 'on' : 'off'} />
        ))}
      </svg>
    </motion.div>
  );
};
