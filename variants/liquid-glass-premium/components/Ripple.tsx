import React, { CSSProperties } from 'react';
import { motion } from 'motion/react';

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  circleSpacing?: number;
  className?: string;
}

export const Ripple: React.FC<RippleProps> = ({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  circleSpacing = 70,
  className,
}) => {
  return (
    <>
      <div
        className={`pointer-events-none absolute inset-0 select-none ${className}`}
        style={{
          maskImage: 'linear-gradient(to bottom, white, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, white, transparent)',
        }}
      >
        {Array.from({ length: numCircles }, (_, i) => {
          const size = mainCircleSize + i * circleSpacing;
          const opacity = mainCircleOpacity - i * 0.03;

          return (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                top: '50%',
                left: '50%',
                borderRadius: '9999px',
                border: '1px solid rgba(34, 211, 238, 0.5)', // cyan-400/50
                backgroundColor: 'rgba(34, 211, 238, 0.1)', // cyan-400/10
                boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)',
              } as CSSProperties}
              initial={{ x: '-50%', y: '-50%' }}
              animate={{ x: '-50%', y: '-50%', scale: [1, 0.9, 1] }}
              transition={{
                duration: 4,
                ease: 'easeInOut',
                repeat: Infinity,
                delay: i * 0.06,
              }}
            />
          );
        })}
      </div>
    </>
  );
};
