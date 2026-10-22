import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { MainView } from './components/MainView';
import { DetailView } from './components/DetailView';
import { SetupWizard } from './components/SetupWizard';
import { BoxAssignments, Ranking } from './types';
import { openEpisodeFile, readAutosave, saveEpisodeFile, writeAutosave, type Episode } from '../../shared/episodeFile';
import { INITIAL_RANKINGS } from './constants';
import { ScreensaverView } from './components/ScreensaverView';
import { LightField } from './components/Glass';
import { assignRankingToBox, buildRankingBoxes, selectRankingForBox } from './rankingFlow';
import { easeOutQuart, screenTransition } from './motionConfig';

// Solo opacità: trasformazioni sul contenitore falserebbero la casella che si trasforma nel titolo.
const screenVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// I cambi di schermata arrivano anche da timer (dopo il faro, dopo il blocco del salvataggio).
// Fuori da un click React li rende in differita e Motion fotografa la forma sbagliata:
// la casella resta con gli angoli del pannello e scatta tonda alla fine. flushSync li rende subito.
const switchScreen = (update: () => void) => flushSync(update);

// Salvataggio automatico della puntata nel browser (vedi shared/episodeFile.ts).
const AUTOSAVE_KEY = 'gimme-five:liquid-glass';

const App: React.FC = () => {
  // Se la pagina era stata chiusa o ricaricata a metà, si riparte da lì.
  const [saved] = useState(() => readAutosave(AUTOSAVE_KEY));
  const [isConfigured, setIsConfigured] = useState<boolean>(saved?.isConfigured ?? false);
  const [guestName, setGuestName] = useState<string>(saved?.episode.guestName ?? '');
  const [rankings, setRankings] = useState<Ranking[]>(saved?.episode.rankings ?? INITIAL_RANKINGS);
  const [guestNameSize, setGuestNameSize] = useState<number>(saved?.episode.guestNameSize ?? 100);
  const [boxAssignments, setBoxAssignments] = useState<BoxAssignments>(saved?.episode.boxAssignments ?? {});
  const [activeRankingId, setActiveRankingId] = useState<number | null>(saved?.activeRankingId ?? null);
  const [activeBoxId, setActiveBoxId] = useState<number | null>(saved?.activeBoxId ?? null);
  // Posizioni della classifica aperta non ancora salvate: servono solo a riprenderle dopo una ricarica.
  const [draft, setDraft] = useState<string[] | null>(saved?.draft ?? null);
  const [isScreensaverActive, setIsScreensaverActive] = useState<boolean>(false);

  const handleSetupComplete = (name: string, newRankings: Ranking[]) => {
    setGuestName(name);
    setRankings(newRankings);
    setBoxAssignments({});
    setActiveRankingId(null);
    setActiveBoxId(null);
    setIsConfigured(true);
  };

  const handleSelectRanking = (boxId: number) => {
    const selectedRanking = selectRankingForBox(rankings, boxAssignments, boxId);
    if (!selectedRanking) {
      return;
    }

    switchScreen(() => {
      setActiveRankingId(selectedRanking.id);
      setActiveBoxId(boxId);
      setDraft(null);
    });
  };

  const handleSaveRanking = (id: number, newEntries: string[]) => {
    switchScreen(() => {
      setRankings(prevRankings =>
        prevRankings.map(ranking =>
          ranking.id === id
            ? { ...ranking, entries: newEntries, completed: true }
            : ranking
        )
      );
      setBoxAssignments(prevAssignments =>
        activeBoxId === null ? prevAssignments : assignRankingToBox(prevAssignments, activeBoxId, id)
      );
      setActiveRankingId(null);
      setActiveBoxId(null);
      setDraft(null);
    });
  };

  const handleUpdateRankingMeta = (id: number, field: 'fullTitle' | 'keyword', value: string) => {
    setRankings(prevRankings =>
      prevRankings.map(ranking =>
        ranking.id === id
          ? { ...ranking, [field]: value }
          : ranking
      )
    );
  };
  
  // Impostazioni: classifica alla cieca (con le sue 5 cose) oppure di nuovo normale.
  const handleRankingBlindChange = (id: number, blindItems: string[] | null) => {
    setRankings(prevRankings =>
      prevRankings.map(ranking => {
        if (ranking.id !== id) return ranking;
        const { mode: _mode, blindItems: _items, ...rest } = ranking;
        return blindItems ? { ...rest, mode: 'blind' as const, blindItems } : rest;
      })
    );
  };

  // Impostazioni: svuota una classifica già completata (torna "da fare" e libera la sua casella).
  const handleResetRanking = (id: number) => {
    setRankings(prevRankings =>
      prevRankings.map(ranking =>
        ranking.id === id ? { ...ranking, entries: ['', '', '', '', ''], completed: false } : ranking
      )
    );
    setBoxAssignments(prevAssignments => {
      const next: BoxAssignments = {};
      for (const [boxId, rankingId] of Object.entries(prevAssignments)) {
        if (typeof rankingId === 'number' && rankingId !== id) next[Number(boxId)] = rankingId;
      }
      return next;
    });
  };

  // Impostazioni: nuova puntata, si riparte dalla configurazione iniziale.
  const handleNewEpisode = () => {
    setGuestName('');
    setRankings(INITIAL_RANKINGS);
    setBoxAssignments({});
    setActiveRankingId(null);
    setActiveBoxId(null);
    setDraft(null);
    setIsConfigured(false);
  };

  // Ospite su file: esporta/importa ospite e classifiche (impostazioni e schermata del nome).
  const handleExportEpisode = () => saveEpisodeFile({ guestName, guestNameSize, rankings, boxAssignments });
  const applyEpisode = (episode: Episode) => {
    setGuestName(episode.guestName);
    setGuestNameSize(episode.guestNameSize);
    setRankings(episode.rankings);
    setBoxAssignments(episode.boxAssignments);
    setActiveRankingId(null);
    setActiveBoxId(null);
    setDraft(null);
    setIsConfigured(true);
  };
  // Archivio ospiti: dalle impostazioni un ospite salvato prende il posto della puntata in corso (con conferma).
  const handleLoadArchived = (episode: Episode) => {
    if (window.confirm(`Caricare ${episode.guestName || 'questo ospite'} dall'archivio? La puntata in corso verrà sostituita (salvala prima, se ti serve).`)) {
      applyEpisode(episode);
    }
  };
  // Dalle impostazioni sostituisce la puntata in corso: prima si chiede conferma.
  const handleImportEpisode = () => {
    if (window.confirm('Importare un ospite da file? La puntata in corso verrà sostituita (esportala prima, se ti serve).')) {
      openEpisodeFile(applyEpisode);
    }
  };

  const handleGoBack = () => {
    switchScreen(() => {
      setActiveRankingId(null);
      setActiveBoxId(null);
      setDraft(null);
    });
  }

  const handleToggleScreensaver = () => {
    setIsScreensaverActive(prev => !prev);
  };

  const activeRanking = rankings.find(r => r.id === activeRankingId);
  const rankingBoxes = buildRankingBoxes(rankings, boxAssignments);
  const screenKey = !isConfigured ? 'setup' : activeRanking ? `detail-${activeRanking.id}` : 'main';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [screenKey]);

  useEffect(() => {
    writeAutosave(AUTOSAVE_KEY, {
      episode: { guestName, guestNameSize, rankings, boxAssignments },
      isConfigured,
      activeRankingId,
      activeBoxId,
      draft,
    });
  }, [guestName, guestNameSize, rankings, boxAssignments, isConfigured, activeRankingId, activeBoxId, draft]);

  // Schermo sempre acceso finché la pagina è aperta (in una chiacchierata lunga non si tocca niente e il
  // computer andrebbe in standby). Il browser toglie il blocco quando la scheda va in secondo piano:
  // tornando in primo piano lo si richiede.
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const request = async () => {
      try {
        lock = await (navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request('screen') ?? null;
      } catch {
        // Non supportato o negato: lo schermo segue le impostazioni del computer.
      }
    };
    const onVisible = () => document.visibilityState === 'visible' && request();
    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release().catch(() => {});
    };
  }, []);
  
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isScreensaverActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOutQuart }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              pointerEvents: 'auto',
            }}
          >
            <ScreensaverView rankings={rankings} onExit={handleToggleScreensaver} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main app */}
      <motion.div
        className="text-gray-100 min-h-screen w-full flex flex-col items-center justify-start p-4 sm:px-8 sm:py-4 transition-colors duration-500 relative overflow-x-hidden overflow-y-auto"
        animate={{ opacity: isScreensaverActive ? 0 : 1 }}
        transition={{ duration: 0.35, ease: easeOutQuart }}
        style={{ pointerEvents: isScreensaverActive ? 'none' : 'auto' }}
      >
        <LightField />

        <div className="app-safe-center relative z-10 w-full min-h-[calc(100vh-2rem)] flex flex-col items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={screenKey}
              className="my-auto w-full"
              variants={screenVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={screenTransition}
            >
              {!isConfigured ? (
                <SetupWizard onSetupComplete={handleSetupComplete} onImportEpisode={() => openEpisodeFile(applyEpisode)} onLoadEpisode={applyEpisode} />
              ) : activeRanking ? (
                  <DetailView
                    ranking={activeRanking}
                    boxId={activeBoxId}
                    onTitleChange={(title) => handleUpdateRankingMeta(activeRanking.id, 'fullTitle', title)}
                    initialEntries={draft}
                    onDraftChange={setDraft}
                    onSave={handleSaveRanking}
                    onBack={handleGoBack}
                  />
              ) : (
                  <MainView
                    guestName={guestName}
                    guestNameSize={guestNameSize}
                    setGuestName={setGuestName}
                    setGuestNameSize={setGuestNameSize}
                    rankings={rankings}
                    rankingBoxes={rankingBoxes}
                    onRankingMetaChange={handleUpdateRankingMeta}
                    onRankingBlindChange={handleRankingBlindChange}
                    onSelectRanking={handleSelectRanking}
                    onLogoClick={handleToggleScreensaver}
                    onResetRanking={handleResetRanking}
                    onNewEpisode={handleNewEpisode}
                    onExportEpisode={handleExportEpisode}
                    onImportEpisode={handleImportEpisode}
                    getEpisode={() => ({ guestName, guestNameSize, rankings, boxAssignments })}
                    onLoadEpisode={handleLoadArchived}
                  />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  );
};

export default App;
