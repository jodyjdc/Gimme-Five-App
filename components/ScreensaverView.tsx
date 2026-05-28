import React from 'react';
import { Logo } from './Logo';
import { Ripple } from './Ripple';

interface ScreensaverViewProps {
  onExit: () => void;
}

export const ScreensaverView: React.FC<ScreensaverViewProps> = ({ onExit }) => {
  return (
    <div
      className="relative flex h-screen w-screen cursor-pointer flex-col items-center justify-center overflow-hidden bg-black"
      onClick={onExit}
    >
      <div className="z-10 w-1/2 max-w-5xl animate-float-slow">
        <Logo />
      </div>
      <Ripple 
        mainCircleSize={390}
        mainCircleOpacity={0.4}
        numCircles={10}
        circleSpacing={45}
      />
    </div>
  );
};