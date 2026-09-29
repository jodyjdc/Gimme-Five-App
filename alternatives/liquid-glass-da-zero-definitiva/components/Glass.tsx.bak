import React, { forwardRef, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { HTMLMotionProps, motion } from 'motion/react';

// Liquid Glass: vetro che RIFRANGE davvero lo sfondo (non solo lo sfoca).
// Ogni lastra ha il suo filtro SVG: una mappa di spostamento grande quanto la lastra, neutra al centro e
// inclinata verso i bordi → lo sfondo si piega lungo il contorno come in una lente spessa.
// Usato come backdrop-filter (Chrome/Edge). Altrove resta la sfocatura: il vetro c'è, senza la curvatura.

const displacementMap = (w: number, h: number, r: number) => {
  const edge = Math.max(8, Math.min(w, h) * 0.2);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><defs>`
    + `<linearGradient id='x' x2='1'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#f00'/></linearGradient>`
    + `<linearGradient id='y' y2='1'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#0f0'/></linearGradient>`
    + `<filter id='b'><feGaussianBlur stdDeviation='${edge / 2.2}'/></filter></defs>`
    + `<rect width='${w}' height='${h}' fill='#000'/>`
    + `<rect width='${w}' height='${h}' rx='${r}' fill='url(#x)'/>`
    + `<rect width='${w}' height='${h}' rx='${r}' fill='url(#y)' style='mix-blend-mode:screen'/>`
    + `<rect x='${edge}' y='${edge}' width='${w - edge * 2}' height='${h - edge * 2}' rx='${Math.max(0, r - edge)}' fill='rgb(128,128,0)' filter='url(#b)'/>`
    + `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

type GlassProps = HTMLMotionProps<'div'> & {
  /** Raggio degli angoli in px (anche per la mappa della lente). */
  radius?: number;
  /** Intensità della rifrazione (px di spostamento ai bordi). */
  depth?: number;
  /** Sfocatura residua dietro il vetro (px): bassa = vetro limpido. */
  frost?: number;
};

export const Glass = forwardRef<HTMLDivElement, GlassProps>(({
  radius = 36,
  depth = 70,
  frost = 3,
  className = '',
  style,
  children,
  ...rest
}, forwardedRef) => {
  const id = `lens${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const localRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const element = localRef.current;
    if (!element) return;
    // offsetWidth/Height ignorano le trasformazioni: la mappa resta quella della lastra "a riposo".
    const measure = () => setSize(prev => (prev.w === element.offsetWidth && prev.h === element.offsetHeight ? prev : { w: element.offsetWidth, h: element.offsetHeight }));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const map = useMemo(() => (size.w > 0 && size.h > 0 ? displacementMap(size.w, size.h, Math.min(radius, size.w / 2, size.h / 2)) : ''), [size.w, size.h, radius]);
  const backdrop = map
    ? `url(#${id}) blur(${frost}px) saturate(1.35)`
    : `blur(${frost + 12}px) saturate(1.8)`;

  return (
    <motion.div
      ref={(element) => {
        localRef.current = element;
        if (typeof forwardedRef === 'function') forwardedRef(element);
        else if (forwardedRef) forwardedRef.current = element;
      }}
      className={`lg-glass ${/\b(fixed|absolute)\b/.test(className) ? '' : 'relative'} ${className}`}
      style={{ borderRadius: radius, backdropFilter: backdrop, WebkitBackdropFilter: backdrop, ...style }}
      {...rest}
    >
      {map && (
        <svg aria-hidden="true" width="0" height="0" className="pointer-events-none absolute">
          <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feImage href={map} x="0" y="0" width={size.w} height={size.h} preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={depth} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      {children}
    </motion.div>
  );
});

Glass.displayName = 'Glass';

/** Luce sul vetro che segue il puntatore (usata sui pulsanti di vetro). */
export const trackGlassLight = (event: React.PointerEvent<HTMLElement>) => {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--lx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
  event.currentTarget.style.setProperty('--ly', `${((event.clientY - rect.top) / rect.height) * 100}%`);
};

// Sfondo: tre grandi luci colorate (i due colori del logo + un viola) che derivano lentissime nel buio.
// È ciò che il vetro rifrange: senza qualcosa dietro, il vetro non si vedrebbe.
export const LightField: React.FC = () => (
  <div aria-hidden="true" className="lg-field">
    <span className="lg-light lg-light-cyan" />
    <span className="lg-light lg-light-pink" />
    <span className="lg-light lg-light-violet" />
  </div>
);
