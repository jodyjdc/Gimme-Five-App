// Le versioni grafiche di Gimme Five. `key` = cartella in variants/ e valore di ?v= nell'indirizzo.
export interface VersionInfo {
  key: string;
  name: string;
  description: string;
}

export const VERSIONS: VersionInfo[] = [
  { key: 'liquid-glass', name: 'Liquid Glass', description: 'Vetro che rifrange la luce, essenziale e scuro' },
  { key: 'serigrafia', name: 'Serigrafia', description: 'Poster stampato dal vivo, inchiostri sfalsati' },
  { key: 'arcade', name: 'Arcade', description: "Cabinato anni '80, font a pixel e suoni 8-bit" },
  { key: 'cinematic', name: 'Cinematic', description: 'Sala buia e pellicola, titoli di coda' },
  { key: 'tabellone', name: 'Tabellone luminoso', description: "Quiz TV anni '70, lettere di lampadine" },
  { key: 'game-show-neon', name: 'Game Show Neon', description: 'Studio TV al neon, prima versione' },
  { key: 'liquid-glass-premium', name: 'Liquid Glass Premium', description: 'Vetro sfocato, prima versione' },
];
