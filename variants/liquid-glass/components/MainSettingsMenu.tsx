import React, { useEffect, useState } from 'react';
import type { Episode } from '../../../shared/episodeFile';
import { archiveLabel, useArchive } from '../../../shared/archive';
import { Ranking } from '../types';
import { Glass } from './Glass';
import { liquidMorphSpring } from '../motionConfig';

interface MainSettingsMenuProps {
  guestNameSize: number;
  onClose: () => void;
  onGuestNameSizeChange: (size: number) => void;
  onRankingMetaChange: (id: number, field: 'fullTitle' | 'keyword', value: string) => void;
  /** Classifica alla cieca: le 5 cose da svelare; null = torna classifica normale. */
  onRankingBlindChange: (id: number, blindItems: string[] | null) => void;
  rankings: Ranking[];
  guestName: string;
  onGuestNameChange: (name: string) => void;
  onResetRanking: (id: number) => void;
  onNewEpisode: () => void;
  onExportEpisode: () => void;
  onImportEpisode: () => void;
  /** Ospite e classifiche come sono ora (per salvarli nell'archivio). */
  getEpisode: () => Episode;
  onLoadEpisode: (episode: Episode) => void;
}

const fieldClasses = "font-tight w-full rounded-xl bg-white/[0.06] px-3 py-2 text-base text-white placeholder-white/30 outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition-colors focus:bg-white/[0.12]";

export const MainSettingsMenu: React.FC<MainSettingsMenuProps> = ({
  guestNameSize,
  onClose,
  onGuestNameSizeChange,
  onRankingMetaChange,
  onRankingBlindChange,
  rankings,
  guestName,
  onGuestNameChange,
  onResetRanking,
  onNewEpisode,
  onExportEpisode,
  onImportEpisode,
  getEpisode,
  onLoadEpisode,
}) => {
  // Archivio ospiti (stesso archivio per tutte le versioni): "Salvato" resta scritto due secondi.
  const archive = useArchive();
  const [isArchived, setIsArchived] = useState(false);
  const handleArchive = () => {
    archive.save(getEpisode());
    setIsArchived(true);
    window.setTimeout(() => setIsArchived(false), 2000);
  };
  const handleRemoveArchived = (id: string, name: string) => {
    if (window.confirm(`Eliminare ${name || 'questo ospite'} dall'archivio?`)) archive.remove(id);
  };

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
        // Il cursore esce dal campo: mentre il pannello sparisce, un tasto premuto subito dopo (es. 1-5 per aprire
        // una casella) finirebbe scritto nell'ultimo campo usato.
        (document.activeElement as HTMLElement | null)?.blur();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    // Lastra di vetro che scende e si posa con la molla liquida.
    <Glass
      radius={32}
      depth={70}
      className="fixed right-4 top-4 z-[60] flex max-h-[calc(100vh-2rem)] w-[min(30rem,calc(100vw-2rem))] flex-col text-white"
      // Vetro fumé: resta vetro ai bordi, ma dietro i campi è scuro, così si legge bene.
      style={{ backgroundColor: 'rgba(6, 7, 12, 0.82)' }}
      initial={{ opacity: 0, y: -30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={liquidMorphSpring}
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
        <h2 className="font-tight text-2xl font-bold tracking-tight">Impostazioni</h2>
        <button
          type="button"
          onClick={onClose}
          className="font-tight rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Chiudi
        </button>
      </div>

      <div className="space-y-6 overflow-y-auto px-6 py-5">
        <section>
          <label htmlFor="guest-name" className="font-tight text-sm font-medium text-white/65 mb-2 block">
            Nome ospite
          </label>
          <input
            id="guest-name"
            type="text"
            value={guestName}
            onChange={(event) => onGuestNameChange(event.target.value)}
            className={fieldClasses}
            placeholder="Nome ospite..."
          />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <label htmlFor="guest-name-size" className="font-tight text-sm font-medium text-white/65">
              Grandezza nome
            </label>
            <span className="font-tight text-lg font-semibold tabular-nums">{guestNameSize}%</span>
          </div>
          <input
            id="guest-name-size"
            type="range"
            min="70"
            max="130"
            step="5"
            value={guestNameSize}
            onChange={(event) => onGuestNameSizeChange(Number(event.target.value))}
            className="w-full accent-white"
          />
        </section>

        <section className="space-y-4">
          <h3 className="font-tight text-sm font-medium text-white/65">Classifiche</h3>
          {rankings.map((ranking, index) => (
            <div key={ranking.id} className="flex gap-4 border-t border-white/10 pt-4">
              <span className="font-tight flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-base font-semibold tabular-nums">{index + 1}</span>
              <div className="min-w-0 flex-1 space-y-2">
                <label className="block text-xs text-white/50" htmlFor={`ranking-title-${ranking.id}`}>
                  Titolo
                </label>
                <input
                  id={`ranking-title-${ranking.id}`}
                  type="text"
                  value={ranking.fullTitle}
                  onChange={(event) => onRankingMetaChange(ranking.id, 'fullTitle', event.target.value)}
                  className={fieldClasses}
                  placeholder="Titolo esteso..."
                />
                <label className="block text-xs text-white/50" htmlFor={`ranking-keyword-${ranking.id}`}>
                  Parola in casella
                </label>
                <input
                  id={`ranking-keyword-${ranking.id}`}
                  type="text"
                  value={ranking.keyword}
                  onChange={(event) => onRankingMetaChange(ranking.id, 'keyword', event.target.value)}
                  className={fieldClasses}
                  placeholder="Parola..."
                />
                {/* Classifica alla cieca: le 5 cose si svelano una alla volta e l'ospite le colloca negli slot. */}
                <button
                  type="button"
                  aria-pressed={ranking.mode === 'blind'}
                  onClick={() => onRankingBlindChange(ranking.id, ranking.mode === 'blind' ? null : ranking.blindItems ?? ['', '', '', '', ''])}
                  className={`font-tight rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${ranking.mode === 'blind' ? 'bg-white text-[#04050a]' : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'}`}
                >
                  {ranking.mode === 'blind' ? 'Alla cieca ✓' : 'Rendi alla cieca'}
                </button>
                {ranking.mode === 'blind' && (ranking.blindItems ?? []).map((item, index) => (
                  <input
                    key={index}
                    type="text"
                    value={item}
                    onChange={(event) => onRankingBlindChange(ranking.id, (ranking.blindItems ?? []).map((value, i) => (i === index ? event.target.value : value)))}
                    aria-label={`Cosa da svelare ${index + 1}`}
                    className={fieldClasses}
                    placeholder={`${index + 1}ª da svelare...`}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        {rankings.some(ranking => ranking.completed) && (
          <section className="space-y-3">
            <p className="font-tight text-sm font-medium text-white/65">Classifiche completate</p>
            {rankings.filter(ranking => ranking.completed).map(ranking => (
              <div key={ranking.id} className="flex items-center justify-between gap-4">
                <span className="min-w-0 break-words text-sm">{ranking.fullTitle}</span>
                <button type="button" onClick={() => onResetRanking(ranking.id)} className="font-tight rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0">
                  Svuota
                </button>
              </div>
            ))}
          </section>
        )}

        {/* Promemoria dei tasti rapidi (strumento dell'host, non va in onda). */}
        <section>
          <h3 className="font-tight mb-2 text-sm font-medium text-white/65">Tasti rapidi</h3>
          <dl className="font-tight grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-white/80">
            <dt className="font-semibold text-white">1 – 5</dt><dd>apre la casella; alla cieca: mette la cosa svelata in quello slot</dd>
            <dt className="font-semibold text-white">Spazio</dt><dd>alla cieca: svela la prossima</dd>
            <dt className="font-semibold text-white">S</dt><dd>salvaschermo (un tasto qualsiasi lo chiude)</dd>
            <dt className="font-semibold text-white">Invio</dt><dd>riga successiva, dall'ultima va su Salva</dd>
            <dt className="font-semibold text-white">⌘/Ctrl + Invio</dt><dd>salva la classifica</dd>
            <dt className="font-semibold text-white">Esc</dt><dd>esce dalla riga, di nuovo: torna indietro</dd>
          </dl>
        </section>

        <section>
          {/* Archivio ospiti: salvati in questo browser, si ricaricano da qui o dalla schermata iniziale. */}
          <div className="mb-4 space-y-2">
            <button type="button" onClick={handleArchive} className="font-tight rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white w-full">{isArchived ? 'Salvato nell\'archivio ✓' : 'Salva nell\'archivio'}</button>
            {archive.entries.map(entry => (
              <div key={entry.id} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm">{archiveLabel(entry)}</span>
                <button type="button" onClick={() => onLoadEpisode(entry.episode)} className="font-tight rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0">Carica</button>
                <button type="button" onClick={() => handleRemoveArchived(entry.id, entry.episode.guestName)} className="font-tight rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0">Elimina</button>
              </div>
            ))}
          </div>
          {/* Ospite su file: salva ospite e classifiche sul computer, o ricaricane uno salvato. */}
          <div className="mb-3 grid grid-cols-2 gap-3">
            <button type="button" onClick={onExportEpisode} className="font-tight rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white w-full">Esporta ospite</button>
            <button type="button" onClick={onImportEpisode} className="font-tight rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white w-full">Importa ospite</button>
          </div>
          <button type="button" onClick={handleNewEpisode} className="font-tight rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white w-full">
            {isConfirmingNewEpisode ? 'Sicuro? Clicca ancora per ricominciare' : 'Nuova puntata'}
          </button>
          {/* Torna alla pagina di scelta della versione (la puntata in corso non viene salvata). */}
          <a href="/" className="font-tight rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white mt-3 block w-full text-center">
            Cambia versione
          </a>
        </section>
      </div>
    </Glass>
  );
};
