import React, { forwardRef, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ADVANCE, GLYPH_H, blankColumns, glyphPath } from '../pixelFont';
import { sound } from '../arcade';

interface PixelTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** Ritardo e cadenza della scrittura "a macchina" (secondi). */
  delay?: number;
  stagger?: number;
  /** Indice del primo carattere: mantiene stabili le chiavi quando il testo è spezzato in più pezzi. */
  startIndex?: number;
  /** false = compare subito, senza lampo di accensione. */
  flash?: boolean;
}

const em = (cells: number) => `${cells / GLYPH_H}em`;
// Le 2 righe in alto del glifo servono solo agli accenti: restano disegnate ma fuori dal box,
// così il centro visivo del testo coincide col centro del box (pulsanti e caselle centrati davvero).
const ACCENT_ROWS = GLYPH_H - 7;
const BODY_HEIGHT = em(GLYPH_H - ACCENT_ROWS);

// Testo nel font a pixel. Ogni parola è un <svg> (si va a capo solo tra parole);
// ogni lettera si accende con un lampo bianco, come un fosforo eccitato, poi resta del suo colore.
// Le chiavi includono il carattere: scrivendo si accendono solo le lettere nuove.
export const PixelText: React.FC<PixelTextProps> = ({
  text,
  className = '',
  style,
  delay = 0,
  stagger = 0,
  startIndex = 0,
  flash = true,
}) => {
  let charIndex = startIndex;
  // Centraggio ottico: il box abbraccia l'inchiostro, non le colonne vuote di prima e ultima lettera.
  const trimmed = text.trim();
  const [leadBlank] = blankColumns(trimmed.charAt(0));
  const [, trailBlank] = blankColumns(trimmed.charAt(trimmed.length - 1));

  return (
    // Spazi tra parole = column-gap: a fine riga sparisce, così le righe a capo restano centrate.
    // Spazi iniziali/finali restano come blocchi vuoti (servono mentre si scrive, prima del cursore).
    <span
      className={`pixel-text ${className}`}
      style={{ columnGap: em(ADVANCE), marginLeft: `-${em(leadBlank)}`, marginRight: `-${em(trailBlank)}`, ...style }}
    >
      <span className="sr-only">{text}</span>
      {text.split(/( +)/).map((word, wordIndex, parts) => {
        if (word === '') return null;
        if (word.trim() === '') {
          charIndex += word.length;
          const isEdge = parts.slice(0, wordIndex).every(part => part.trim() === '') || parts.slice(wordIndex + 1).every(part => part.trim() === '');
          // Spazio interno: lo fa già il column-gap (uno spazio in meno, perché il gap c'è comunque).
          const cells = isEdge ? word.length * ADVANCE - ADVANCE : (word.length - 1) * ADVANCE - ADVANCE;
          if (cells <= 0 && !isEdge) return null;
          return <span key={wordIndex} aria-hidden="true" className="inline-block" style={{ width: em(Math.max(cells, 0)), height: BODY_HEIGHT }} />;
        }

        const chars: string[] = [...word];
        return (
          <svg
            key={wordIndex}
            aria-hidden="true"
            className="inline-block overflow-visible align-bottom"
            viewBox={`0 0 ${chars.length * ADVANCE - 1} ${GLYPH_H}`}
            style={{ height: '1em', width: em(chars.length * ADVANCE - 1), marginTop: `-${em(ACCENT_ROWS)}` }}
          >
            {chars.map((char, index) => {
              const at = charIndex++;
              const path = glyphPath(char, index * ADVANCE);
              const appearAt = delay + (at - startIndex) * stagger;
              return (
                <g key={`${at}-${char}`}>
                  <motion.path
                    d={path}
                    fill="currentColor"
                    initial={flash ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.01, delay: appearAt }}
                  />
                  {flash && (
                    <motion.path
                      d={path}
                      fill="#ffffff"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.24, delay: appearAt, times: [0, 0.12, 1] }}
                    />
                  )}
                </g>
              );
            })}
          </svg>
        );
      })}
    </span>
  );
};

/** Cursore a blocco lampeggiante, alto quanto il corpo delle lettere. */
export const PixelCursor: React.FC = () => (
  <span aria-hidden="true" className="pixel-cursor inline-block align-bottom" style={{ width: em(5), height: BODY_HEIGHT, marginLeft: em(1) }} />
);

interface PixelInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  align?: 'left' | 'center';
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
  id?: string;
  /** Una sola riga: il testo si rimpicciolisce per starci, fino a minScale; oltre non si scrive. */
  fit?: boolean;
  minScale?: number;
}

/** Larghezza in em di un testo nel font a pixel (monospaziato: ogni carattere avanza di 6 celle su 9). */
const pixelWidthEm = (text: string, withCursor: boolean) =>
  (Math.max(0, text.length * ADVANCE - 1) + (withCursor ? ADVANCE : 0)) / GLYPH_H;

/** Scala che fa stare `text` su una riga dentro `box` (1 = grandezza piena). */
const useFitScale = () => {
  const boxRef = useRef<HTMLSpanElement>(null);
  const scaleFor = useCallback((text: string, withCursor = false) => {
    const box = boxRef.current;
    if (!box || text === '') return 1;
    const fontPx = parseFloat(getComputedStyle(box).fontSize);
    const needed = pixelWidthEm(text, withCursor) * fontPx;
    return needed > 0 && box.clientWidth > 0 ? Math.min(1, (box.clientWidth - 4) / needed) : 1;
  }, []);
  return { boxRef, scaleFor };
};

/** Testo a pixel in sola lettura su una riga, rimpicciolito per starci (mai sotto minScale). */
export const PixelFitText: React.FC<{ text: string; className?: string; minScale?: number; delay?: number; stagger?: number }> = ({ text, className = '', minScale = 0.6, delay, stagger }) => {
  const { boxRef, scaleFor } = useFitScale();
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const update = () => setScale(Math.max(minScale, scaleFor(text)));
    update();
    const observer = new ResizeObserver(update);
    if (boxRef.current) observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, [text, minScale, scaleFor, boxRef]);
  return (
    <span ref={boxRef} className={`flex min-w-0 items-end ${className}`}>
      <PixelText text={text} className="pixel-nowrap" style={{ fontSize: `${scale}em` }} delay={delay} stagger={stagger} />
    </span>
  );
};

// Campo di scrittura: l'input vero è invisibile sopra, si vede il testo a pixel col cursore a blocco
// nella posizione reale del cursore (anche tornando indietro a correggere). Ogni tasto fa "blip".
export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(({
  value,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  placeholder = '',
  align = 'left',
  className = '',
  style,
  autoFocus,
  disabled,
  id,
  'aria-label': ariaLabel,
  fit = false,
  minScale = 0.6,
}, ref) => {
  const [caret, setCaret] = useState<number | null>(null);
  const { boxRef, scaleFor } = useFitScale();
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    if (!fit) return;
    const update = () => setScale(Math.max(minScale, scaleFor(value, true)));
    update();
    const observer = new ResizeObserver(update);
    if (boxRef.current) observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, [fit, value, minScale, scaleFor, boxRef]);
  const syncCaret = (event: React.SyntheticEvent<HTMLInputElement>) =>
    setCaret(event.currentTarget.selectionStart ?? event.currentTarget.value.length);
  const split = caret ?? value.length;

  return (
    // Altezza della riga fissa (quella a grandezza piena): rimpicciolendo il testo la riga non si muove.
    <span ref={boxRef} className={`relative ${fit ? 'flex min-w-0 items-center' : 'block'} ${className}`} style={{ minHeight: fit ? BODY_HEIGHT : undefined, ...style }}>
      <input
        ref={ref}
        id={id}
        type="text"
        value={value}
        autoFocus={autoFocus}
        disabled={disabled}
        aria-label={ariaLabel ?? placeholder}
        onChange={(event) => {
          // Una riga sola: si cancella sempre, si aggiunge solo finché il testo ci sta al minimo.
          if (fit && event.target.value.length > value.length && scaleFor(event.target.value, true) < minScale) {
            let low = value.length;
            let high = event.target.value.length - 1;
            while (low < high) {
              const mid = Math.ceil((low + high) / 2);
              if (scaleFor(event.target.value.slice(0, mid), true) >= minScale) low = mid;
              else high = mid - 1;
            }
            const full = event.target.value;
            let clipped = full.slice(0, low);
            // Taglio pulito: niente parole a metà.
            const lastSpace = clipped.lastIndexOf(' ');
            if (full[low] && full[low] !== ' ' && lastSpace > value.length) clipped = clipped.slice(0, lastSpace);
            clipped = clipped.trimEnd();
            if (clipped === value) {
              event.target.value = value;
              return;
            }
            event.target.value = clipped;
          }
          onChange(event);
          syncCaret(event);
          sound.blip();
        }}
        onSelect={syncCaret}
        onKeyUp={syncCaret}
        onKeyDown={onKeyDown}
        onFocus={(event) => {
          syncCaret(event);
          onFocus?.();
        }}
        onBlur={() => {
          setCaret(null);
          onBlur?.();
        }}
        // Monospace con spaziatura simile al font a pixel: un click cade più o meno sulla lettera giusta.
        className="absolute inset-0 z-10 h-full w-full cursor-text bg-transparent font-mono opacity-0 disabled:cursor-default"
        style={{ letterSpacing: '0.067em', textAlign: align }}
      />
      <span
        aria-hidden="true"
        className={`flex items-end ${fit ? 'pixel-nowrap flex-nowrap' : 'flex-wrap'} ${align === 'center' ? 'justify-center text-center' : 'justify-start text-left'}`}
        style={{ minHeight: BODY_HEIGHT, fontSize: fit ? `${scale}em` : undefined }}
      >
        {value === '' && caret === null ? (
          <PixelText text={placeholder} className="opacity-25" flash={false} />
        ) : (
          <>
            <PixelText text={value.slice(0, split)} />
            {caret !== null && <PixelCursor />}
            <PixelText text={value.slice(split)} startIndex={split} />
          </>
        )}
      </span>
    </span>
  );
});

PixelInput.displayName = 'PixelInput';

interface PixelButtonProps {
  label: string;
  onClick?: () => void;
  color?: string;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

// Pulsante da menu arcade: cornice a pixel, al passaggio del mouse si inverte (sfondo colore, testo nero).
export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(({
  label,
  onClick,
  color = '#ffe14d',
  disabled,
  className = '',
  textClassName = 'text-xl',
}, ref) => (
  <motion.button
    ref={ref}
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`pixel-frame group p-[3px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-30 ${className}`}
    style={{ backgroundColor: color, '--c': color } as React.CSSProperties}
    whileTap={disabled ? undefined : { y: 3 }}
    transition={{ duration: 0.04 }}
  >
    <span className={`pixel-frame block bg-[var(--crt-bg)] px-6 py-3 text-center text-[var(--c)] group-hover:bg-transparent group-hover:text-[var(--crt-bg)] group-focus-visible:bg-transparent group-focus-visible:text-[var(--crt-bg)] group-disabled:bg-[var(--crt-bg)] group-disabled:text-[var(--c)] ${textClassName}`}>
      <PixelText text={label} flash={false} />
    </span>
  </motion.button>
));

PixelButton.displayName = 'PixelButton';
