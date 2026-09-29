import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { Ripple } from './Ripple';
import { easeOutQuart, screenTransition } from '../motionConfig';

interface ScreensaverViewProps {
  onExit: () => void;
}

export const ScreensaverView: React.FC<ScreensaverViewProps> = ({ onExit }) => {
  return (
    <motion.div
      className="relative flex h-screen w-screen cursor-pointer flex-col items-center justify-center overflow-hidden bg-black"
      onClick={onExit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: easeOutQuart }}
    >
      <motion.div
        className="z-10 w-1/2 max-w-5xl animate-float-slow"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={screenTransition}
      >
        <Logo />
      </motion.div>
      <Ripple 
        mainCircleSize={390}
        mainCircleOpacity={0.4}
        numCircles={10}
        circleSpacing={45}
      />
    </motion.div>
  );
};
