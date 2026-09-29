import React, { useEffect, useRef } from 'react';

interface BackgroundGradientAnimationProps {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}

export const BackgroundGradientAnimation: React.FC<BackgroundGradientAnimationProps> = ({
  gradientBackgroundStart = 'rgb(0, 0, 0)',
  gradientBackgroundEnd = 'rgb(0, 7, 10)',
  firstColor = '0, 208, 255',
  secondColor = '0, 95, 130',
  thirdColor = '34, 211, 238',
  fourthColor = '0, 40, 60',
  fifthColor = '255, 100, 196',
  pointerColor = '0, 208, 255',
  size = '72%',
  blendingValue = 'screen',
  children,
  className = '',
  interactive = false,
  containerClassName = '',
}) => {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const currentPosition = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    if (!interactive) {
      return;
    }

    const move = () => {
      if (!interactiveRef.current) {
        return;
      }

      currentPosition.current = {
        x: currentPosition.current.x + (targetPosition.current.x - currentPosition.current.x) / 18,
        y: currentPosition.current.y + (targetPosition.current.y - currentPosition.current.y) / 18,
      };

      interactiveRef.current.style.transform = `translate3d(${Math.round(currentPosition.current.x)}px, ${Math.round(currentPosition.current.y)}px, 0)`;
      animationFrame.current = window.requestAnimationFrame(move);
    };

    animationFrame.current = window.requestAnimationFrame(move);

    return () => {
      if (animationFrame.current !== null) {
        window.cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [interactive]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveRef.current) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    targetPosition.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const cssVars = {
    '--gradient-background-start': gradientBackgroundStart,
    '--gradient-background-end': gradientBackgroundEnd,
    '--first-color': firstColor,
    '--second-color': secondColor,
    '--third-color': thirdColor,
    '--fourth-color': fourthColor,
    '--fifth-color': fifthColor,
    '--pointer-color': pointerColor,
    '--gradient-size': size,
    '--blending-value': blendingValue,
  } as React.CSSProperties;

  return (
    <div
      className={`gimme-gradient-background ${containerClassName}`}
      style={cssVars}
      onMouseMove={interactive ? handleMouseMove : undefined}
    >
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="gimme-gradient-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className={className}>{children}</div>
      <div className="gimme-gradients-container">
        <div className="gimme-gradient-orb gimme-gradient-first" />
        <div className="gimme-gradient-orb gimme-gradient-second" />
        <div className="gimme-gradient-orb gimme-gradient-third" />
        <div className="gimme-gradient-orb gimme-gradient-fourth" />
        <div className="gimme-gradient-orb gimme-gradient-fifth" />
        {interactive && <div ref={interactiveRef} className="gimme-gradient-pointer" />}
      </div>
    </div>
  );
};
