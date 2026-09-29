import React, { forwardRef, useCallback, useLayoutEffect, useRef, useState } from 'react';

type FitInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'className'> & {
  value: string;
  onValueChange: (value: string) => void;
  /** Font, grandezza piena, peso, colore: stanno sul contenitore e l'input li eredita. */
  className?: string;
  /** Classi del solo input (sfondo, padding verticale, cursore, placeholder…). */
  inputClassName?: string;
  /** Rimpicciolimento massimo (0.5 = metà della grandezza piena). */
  minScale?: number;
  /** Avvisa della scala corrente (per chi ridisegna il testo sopra il campo, es. Serigrafia). */
  onScaleChange?: (scale: number) => void;
};

// Campo di testo che non nasconde mai niente: la scritta si rimpicciolisce per stare tutta nella larghezza
// del campo; arrivata a `minScale` non accetta altri caratteri (limite invisibile, niente contatori).
// La misura è quella reale del testo (una "i" occupa meno di una "M"), fatta con uno span gemello invisibile.
export const FitInput = forwardRef<HTMLInputElement, FitInputProps>(({
  value,
  onValueChange,
  className = '',
  inputClassName = '',
  minScale = 0.5,
  onScaleChange,
  style,
  ...rest
}, forwardedRef) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  /** Scala necessaria perché `text` stia nel campo (1 = grandezza piena). */
  const scaleFor = useCallback((text: string) => {
    const input = inputRef.current;
    const mirror = mirrorRef.current;
    if (!input || !mirror || text === '') return 1;
    const style = getComputedStyle(input);
    // Margine per il cursore di scrittura e per l'arrotondamento dei pixel.
    const available = input.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 6;
    if (available <= 0) return 1;
    mirror.textContent = text;
    // Due passaggi: alcuni font (es. Bodoni) cambiano forma rimpicciolendo, quindi si rimisura alla scala trovata.
    let scale = 1;
    for (let pass = 0; pass < 2; pass++) {
      mirror.style.fontSize = `${scale}em`;
      const needed = mirror.getBoundingClientRect().width;
      if (needed <= 0) return 1;
      scale = Math.min(1, scale * (available / needed));
    }
    return scale;
  }, []);

  useLayoutEffect(() => {
    const update = () => {
      const next = Math.max(minScale, scaleFor(value));
      setScale(next);
      onScaleChange?.(next);
      if (inputRef.current) inputRef.current.scrollLeft = 0;
    };
    update();
    const observer = new ResizeObserver(update);
    if (inputRef.current) observer.observe(inputRef.current);
    return () => observer.disconnect();
  }, [value, minScale, scaleFor, onScaleChange]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    // Si può sempre cancellare; si aggiunge solo finché il testo, rimpicciolito al minimo, ci sta.
    // Un testo incollato troppo lungo viene tagliato al punto massimo che ci sta (ricerca binaria).
    if (next.length > value.length && scaleFor(next) < minScale) {
      let low = value.length;
      let high = next.length - 1;
      while (low < high) {
        const mid = Math.ceil((low + high) / 2);
        if (scaleFor(next.slice(0, mid)) >= minScale) low = mid;
        else high = mid - 1;
      }
      let clipped = next.slice(0, low);
      // Taglio pulito: se l'ultima parola resterebbe a metà, si ferma alla parola intera precedente.
      const lastSpace = clipped.lastIndexOf(' ');
      if (next[low] && next[low] !== ' ' && lastSpace > value.length) clipped = clipped.slice(0, lastSpace);
      clipped = clipped.trimEnd();
      event.target.value = clipped;
      if (clipped !== value) onValueChange(clipped);
      return;
    }
    onValueChange(next);
  };

  return (
    // Contenitore alto quanto la riga a grandezza piena: rimpicciolendo il testo la riga non cambia altezza.
    <span className={`relative flex min-h-[1.55em] items-center ${className}`}>
      <span ref={mirrorRef} aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre" />
      <input
        ref={(element) => {
          inputRef.current = element;
          if (typeof forwardedRef === 'function') forwardedRef(element);
          else if (forwardedRef) forwardedRef.current = element;
        }}
        type="text"
        value={value}
        onChange={handleChange}
        className={`w-full ${inputClassName}`}
        {...rest}
        style={{ ...style, fontSize: `${scale}em` }}
      />
    </span>
  );
});

FitInput.displayName = 'FitInput';

/** Solo lettura: stessa regola del campo (testo rimpicciolito per stare in una riga, mai sotto `minScale`). */
export const FitText: React.FC<{ text: string; className?: string; minScale?: number }> = ({ text, className = '', minScale = 0.55 }) => {
  const boxRef = useRef<HTMLSpanElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const update = () => {
      const box = boxRef.current;
      const mirror = mirrorRef.current;
      if (!box || !mirror) return;
      const needed = mirror.getBoundingClientRect().width;
      const available = box.clientWidth;
      setScale(needed > 0 && available > 0 ? Math.max(minScale, Math.min(1, available / needed)) : 1);
    };
    update();
    const observer = new ResizeObserver(update);
    if (boxRef.current) observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, [text, minScale]);

  return (
    <span ref={boxRef} className={`relative flex min-h-[1.25em] items-center ${className}`}>
      <span ref={mirrorRef} aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre">{text}</span>
      <span className="whitespace-nowrap" style={{ fontSize: `${scale}em` }}>{text}</span>
    </span>
  );
};

