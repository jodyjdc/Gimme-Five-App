// Tubo al neon disegnato con le ombre del bordo di una casella: il bordo è l'asse del tubo,
// un filo chiaro al centro, il colore intorno, l'alone fuori e dentro.
// Stessa struttura accesa e spenta, così Motion può sfumare dall'una all'altra
// (e correggere le ombre mentre la casella si trasforma nel titolo).

export type NeonColor = 'cyan' | 'magenta';

const RGB: Record<NeonColor, string> = {
  cyan: '0, 208, 255',
  magenta: '255, 100, 196',
};

// Vetro del tubo spento: si intuisce appena sul nero, come un'insegna di giorno.
// "ghost" = filo sottile chiaro, per le cornici che devono solo farsi vedere (numeri delle posizioni).
const OFF = '28, 38, 46';

// "travelling" = tubo in viaggio (anello che diventa titolo e ritorno): solo un filo con poco alone.
// Durante la trasformazione la forma si stira in modo diverso in larghezza e in altezza, e un alone spesso
// si deformerebbe (bordo doppio alle estremità); arrivato, il tubo si riaccende pieno.
export const neonTube = (color: NeonColor | 'ghost' | null, travelling = false) => {
  const lit = color === 'cyan' || color === 'magenta';
  const c = lit ? RGB[color] : color === 'ghost' ? '255, 255, 255' : OFF;
  const on = lit ? 1 : 0;
  const glow = travelling ? 0.25 : 1;
  const body = color === 'ghost' ? 0.2 : 1;
  const width = color === 'ghost' ? 1 : travelling ? 1.5 : 4;
  const core = travelling ? 0.75 : 1.5;
  return [
    `0 0 0 ${core}px rgba(238, 252, 255, ${0.9 * on})`,
    `inset 0 0 0 ${core}px rgba(238, 252, 255, ${0.9 * on})`,
    `0 0 0 ${width}px rgba(${c}, ${body})`,
    `inset 0 0 0 ${width}px rgba(${c}, ${body})`,
    `0 0 14px 4px rgba(${c}, ${0.6 * on * glow})`,
    `0 0 44px 6px rgba(${c}, ${0.28 * on * (travelling ? 0 : 1)})`,
    `inset 0 0 18px 4px rgba(${c}, ${0.3 * on * (travelling ? 0 : 1)})`,
  ].join(', ');
};
