import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Ranking } from '../types';
import { printSpring, quickTransition } from '../motionConfig';

interface MainSettingsMenuProps {
  guestNameSize: number;
  onClose: () => void;
  onGuestNameSizeChange: (size: number) => void;
  onRankingMetaChange: (id: number, field: 'fullTitle' | 'keyword', value: string) => void;
  rankings: Ranking[];
  guestName: string;
  onGuestNameChange: (name: string) => void;
  onResetRanking: (id: number) => void;
  onNewEpisode: () => void;
}

export const MainSettingsMenu: React.FC<MainSettingsMenuProps> = ({
  guestNameSize,
  onClose,
  onGuestNameSizeChange,
  onRankingMetaChange,
  rankings,
  guestName,
  onGuestNameChange,
  onResetRanking,
  onNewEpisode,
}) => {
  // "Nuova puntata" cancella tutto: serve un secondo clic entro 4 secondi per confermare.
  const [isConfirmingNewEpisode, setIsConfirmingNewEpisode] = useState(false);
  useEffect(() => {
    if (!isConfirmingNewEpisode) return;
    const timeout = window.setTimeout(() => setIsConfirmingNewEpisode(false), 4000);
    return () => window.clearTimeout(timeout);
  }, [isConfirmingNewEpisode]);
  const handleNewEpisode = () => (isConfirmingNewEpisode ? onNewEpisode() : setIsConfirmingNewEpisode(true));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.aside
      className="fixed right-4 top-4 z-[60] flex max-h-[calc(100vh-2rem)] w-[min(28rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-md border border-[var(--ink-white)]/15 bg-[var(--paper-raised)] text-[var(--ink-white)] shadow-[8px_8px_0_0_var(--ink-cyan)]"
      // Il foglio arriva leggermente storto e si posa, come appoggiato sul banco.
      initial={{ opacity: 0, y: -14, rotate: 2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, y: -10, rotate: 1 }}
      transition={printSpring}
    >
      <div className="flex items-center justify-between border-b-2 border-dashed border-[var(--ink-white)]/15 px-5 py-4">
        <h2
          className="ink font-anybody text-2xl uppercase leading-none"
          data-text="Impostazioni"
          style={{ fontVariationSettings: "'wdth' 70, 'wght' 850", '--reg': '1px' } as React.CSSProperties}
        >
          Impostazioni
        </h2>
        <motion.button
          type="button"
          onClick={onClose}
          className="font-anybody px-2 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-white)]/60 underline decoration-2 underline-offset-4 transition-colors hover:text-[var(--ink-white)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-white)]"
          whileTap={{ scale: 0.98 }}
          transition={quickTransition}
        >
          Chiudi
        </motion.button>
      </div>

      <div className="space-y-6 overflow-y-auto px-5 py-5">
        <section>
          <label htmlFor="guest-name" className="font-anybody text-xs font-bold uppercase tracking-[0.25em] text-[var(--ink-white)]/60 mb-2 block">
            Nome ospite
          </label>
          <input
            id="guest-name"
            type="text"
            value={guestName}
            onChange={(event) => onGuestNameChange(event.target.value)}
            className="w-full border-b-2 border-dashed border-[var(--ink-white)]/20 bg-transparent px-1 py-1.5 text-base text-[var(--ink-white)] placeholder-[var(--ink-white)]/25 outline-none transition-colors focus:border-solid focus:border-[var(--ink-white)]/70"
            placeholder="Nome ospite..."
          />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <label htmlFor="guest-name-size" className="font-anybody text-xs font-bold uppercase tracking-[0.25em] text-[var(--ink-white)]/60">
              Grandezza nome
            </label>
            <span className="font-anybody text-lg font-bold tabular-nums text-[var(--ink-pink)]">{guestNameSize}%</span>
          </div>
          <input
            id="guest-name-size"
            type="range"
            min="70"
            max="130"
            step="5"
            value={guestNameSize}
            onChange={(event) => onGuestNameSizeChange(Number(event.target.value))}
            className="w-full accent-[var(--ink-pink)]"
          />
          <div className="mt-2 flex justify-between text-xs text-[var(--ink-white)]/40">
            <span>Più piccolo</span>
            <span>Più grande</span>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-anybody text-xs font-bold uppercase tracking-[0.25em] text-[var(--ink-white)]/60">Classifiche</h3>
          {rankings.map((ranking, index) => (
            <div key={ranking.id} className="border-t-2 border-dashed border-[var(--ink-white)]/10 pt-3">
              <p className="font-anybody mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: index % 2 === 0 ? 'var(--ink-pink)' : 'var(--ink-cyan)' }}>
                Top 5 · N°{index + 1}
              </p>
              <label className="mb-1 block text-xs font-semibold text-[var(--ink-white)]/45" htmlFor={`ranking-title-${ranking.id}`}>
                Titolo
              </label>
              <input
                id={`ranking-title-${ranking.id}`}
                type="text"
                value={ranking.fullTitle}
                onChange={(event) => onRankingMetaChange(ranking.id, 'fullTitle', event.target.value)}
                className="mb-3 w-full border-b-2 border-dashed border-[var(--ink-white)]/20 bg-transparent px-1 py-1.5 text-base text-[var(--ink-white)] placeholder-[var(--ink-white)]/25 outline-none transition-colors focus:border-solid focus:border-[var(--ink-white)]/70"
                placeholder="Titolo esteso..."
              />
              <label className="mb-1 block text-xs font-semibold text-[var(--ink-white)]/45" htmlFor={`ranking-keyword-${ranking.id}`}>
                Parola in casella
              </label>
              <input
                id={`ranking-keyword-${ranking.id}`}
                type="text"
                value={ranking.keyword}
                onChange={(event) => onRankingMetaChange(ranking.id, 'keyword', event.target.value)}
                className="w-full border-b-2 border-dashed border-[var(--ink-white)]/20 bg-transparent px-1 py-1.5 text-base text-[var(--ink-white)] placeholder-[var(--ink-white)]/25 outline-none transition-colors focus:border-solid focus:border-[var(--ink-white)]/70"
                placeholder="Keyword..."
              />
            </div>
          ))}
        </section>

        {rankings.some(ranking => ranking.completed) && (
          <section className="space-y-3">
            <p className="font-anybody text-xs font-bold uppercase tracking-[0.25em] text-[var(--ink-white)]/60">Classifiche completate</p>
            {rankings.filter(ranking => ranking.completed).map(ranking => (
              <div key={ranking.id} className="flex items-center justify-between gap-4">
                <span className="min-w-0 break-words text-sm">{ranking.fullTitle}</span>
                <button type="button" onClick={() => onResetRanking(ranking.id)} className="font-anybody px-2 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-white)]/60 underline decoration-2 underline-offset-4 transition-colors hover:text-[var(--ink-white)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-white)] shrink-0">
                  Svuota
                </button>
              </div>
            ))}
          </section>
        )}

        <section>
          <button type="button" onClick={handleNewEpisode} className="font-anybody px-2 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-white)]/60 underline decoration-2 underline-offset-4 transition-colors hover:text-[var(--ink-white)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-white)] w-full">
            {isConfirmingNewEpisode ? 'Sicuro? Clicca ancora per ricominciare' : 'Nuova puntata'}
          </button>
          {/* Torna alla pagina di scelta della versione (la puntata in corso non viene salvata). */}
          <a href="/" className="font-anybody px-2 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-white)]/60 underline decoration-2 underline-offset-4 transition-colors hover:text-[var(--ink-white)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-white)] mt-3 block w-full text-center">
            Cambia versione
          </a>
        </section>
      </div>
    </motion.aside>
  );
};
