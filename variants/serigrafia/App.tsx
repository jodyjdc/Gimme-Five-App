import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { MainView } from './components/MainView';
import { DetailView } from './components/DetailView';
import { SetupWizard } from './components/SetupWizard';
import { BoxAssignments, Ranking } from './types';
import { INITIAL_RANKINGS } from './constants';
import { ScreensaverView } from './components/ScreensaverView';
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

const App: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [guestName, setGuestName] = useState<string>('');
  const [rankings, setRankings] = useState<Ranking[]>(INITIAL_RANKINGS);
  const [guestNameSize, setGuestNameSize] = useState<number>(100);
  const [boxAssignments, setBoxAssignments] = useState<BoxAssignments>({});
  const [activeRankingId, setActiveRankingId] = useState<number | null>(null);
  const [activeBoxId, setActiveBoxId] = useState<number | null>(null);
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
    setIsConfigured(false);
  };

  const handleGoBack = () => {
    switchScreen(() => {
      setActiveRankingId(null);
      setActiveBoxId(null);
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
            <ScreensaverView onExit={handleToggleScreensaver} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main app */}
      <motion.div
        className="paper-grain bg-[var(--paper)] text-gray-100 min-h-screen w-full flex flex-col items-center justify-start p-4 sm:p-8 transition-colors duration-500 relative overflow-x-hidden overflow-y-auto"
        animate={{ opacity: isScreensaverActive ? 0 : 1 }}
        transition={{ duration: 0.35, ease: easeOutQuart }}
        style={{ pointerEvents: isScreensaverActive ? 'none' : 'auto' }}
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(243,237,225,0.05),transparent_60%)]" />

        <div className="app-safe-center relative z-10 w-full min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-4rem)] flex flex-col items-center">
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
                <SetupWizard onSetupComplete={handleSetupComplete} />
              ) : activeRanking ? (
                  <DetailView
                    ranking={activeRanking}
                    boxId={activeBoxId}
                    onTitleChange={(title) => handleUpdateRankingMeta(activeRanking.id, 'fullTitle', title)}
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
                    onSelectRanking={handleSelectRanking}
                    onLogoClick={handleToggleScreensaver}
                    onResetRanking={handleResetRanking}
                    onNewEpisode={handleNewEpisode}
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
