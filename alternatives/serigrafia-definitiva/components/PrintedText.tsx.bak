import React from 'react';
import { motion } from 'motion/react';
import { printSpring } from '../motionConfig';

interface PrintedTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Larghezza/peso finali del font variabile (Anybody). */
  width?: number;
  weight?: number;
}

// Ogni lettera arriva larga, sottile e fuori registro, poi si stringe e va a registro.
// Due strati: una copia invisibile già "stampata" occupa lo spazio finale, quella animata le sta sopra.
// Così le lettere larghe iniziali non fanno andare a capo il testo né allungano il contenitore.
// Le lettere sono raggruppate per parola (nowrap): si va a capo solo tra parole.
// La chiave include il carattere: modificando il testo si ristampano solo le lettere cambiate.
export const PrintedText: React.FC<PrintedTextProps> = ({
  text,
  className = '',
  delay = 0,
  stagger = 0.035,
  width = 78,
  weight = 850,
}) => {
  const words = text.split(/(\s+)/);
  const finalStyle = { fontVariationSettings: `'wdth' ${width}, 'wght' ${weight}` };
  let charIndex = 0;

  return (
    <span className={`font-anybody relative inline-block ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="invisible">
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-pre" style={finalStyle}>
            {Array.from(word).map((char, index) => (
              <span key={index} className="inline-block whitespace-pre">{char}</span>
            ))}
          </span>
        ))}
      </span>
      <span aria-hidden="true" className="absolute inset-0">
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-pre">
            {Array.from(word).map((char) => {
              const index = charIndex++;
              return (
                <motion.span
                  key={`${index}-${char}`}
                  className="ink whitespace-pre"
                  data-text={char}
                  style={{ fontVariationSettings: "'wdth' var(--w), 'wght' var(--g)" }}
                  initial={{ '--w': 150, '--g': 180, '--reg': '9px', opacity: 0, y: '-0.18em' }}
                  animate={{ '--w': width, '--g': weight, '--reg': '1.5px', opacity: 1, y: '0em' }}
                  transition={{ ...printSpring, delay: delay + index * stagger }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        ))}
      </span>
    </span>
  );
};
