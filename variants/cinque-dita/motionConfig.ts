export const easeOutQuart: [number, number, number, number] = [0.165, 0.84, 0.44, 1];
export const easeOutQuint: [number, number, number, number] = [0.23, 1, 0.32, 1];

export const screenTransition = {
  duration: 0.26,
  ease: easeOutQuart,
};

// Casella che diventa titolo, mano che va al centro: lento abbastanza da godersela.
export const neonSpring = {
  type: 'spring' as const,
  duration: 0.9,
  bounce: 0.16,
};

// Anello che diventa titolo (e ritorno): parte morbido, scorre, si posa. Durata fissa, niente rimbalzo
// (una molla senza rimbalzo impiega molto a fermarsi del tutto e il contenuto riapparirebbe in ritardo).
export const morphTransition = {
  duration: 0.7,
  ease: [0.45, 0, 0.2, 1] as [number, number, number, number],
};

// Accensione di un tubo al neon: due incertezze e poi luce piena.
export const IGNITION = {
  opacity: [0, 0.9, 0.15, 1, 0.55, 1],
  transition: { duration: 0.5, times: [0, 0.12, 0.26, 0.42, 0.6, 1] },
};
