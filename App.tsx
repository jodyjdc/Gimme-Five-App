import React, { useState } from 'react';
import { MainView } from './components/MainView';
import { DetailView } from './components/DetailView';
import { SetupWizard } from './components/SetupWizard';
import { Ranking } from './types';
import { INITIAL_RANKINGS } from './constants';
import { ScreensaverView } from './components/ScreensaverView';

const App: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [guestName, setGuestName] = useState<string>('');
  const [rankings, setRankings] = useState<Ranking[]>(INITIAL_RANKINGS);
  const [activeRankingId, setActiveRankingId] = useState<number | null>(null);
  const [isScreensaverActive, setIsScreensaverActive] = useState<boolean>(false);

  const handleSetupComplete = (name: string, newRankings: Ranking[]) => {
    setGuestName(name);
    setRankings(newRankings);
    setIsConfigured(true);
  };

  const handleSelectRanking = (id: number) => {
    setActiveRankingId(id);
  };

  const handleSaveRanking = (id: number, newEntries: string[]) => {
    setRankings(prevRankings =>
      prevRankings.map(ranking =>
        ranking.id === id
          ? { ...ranking, entries: newEntries, completed: true }
          : ranking
      )
    );
    setActiveRankingId(null);
  };
  
  const handleGoBack = () => {
    setActiveRankingId(null);
  }

  const handleToggleScreensaver = () => {
    setIsScreensaverActive(prev => !prev);
  };

  const activeRanking = rankings.find(r => r.id === activeRankingId);
  
  return (
    <>
      {/* Screensaver SEMPRE renderizzato */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          opacity: isScreensaverActive ? 1 : 0,
          pointerEvents: isScreensaverActive ? 'auto' : 'none',
          transition: 'opacity 0.4s ease-in-out',
        }}
      >
        <ScreensaverView onExit={handleToggleScreensaver} />
      </div>

      {/* Main app */}
      <div 
        className="bg-black text-gray-100 min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-500 relative overflow-hidden"
        style={{
          opacity: isScreensaverActive ? 0 : 1,
          pointerEvents: isScreensaverActive ? 'none' : 'auto',
          transition: 'opacity 0.4s ease-in-out',
        }}
      >
        {/* Neon glow SINISTRO - metà fuori dallo schermo */}
        <div 
          className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          style={{
            transform: 'translate(-50%, -50%)',
            animation: 'glowPulse 2.5s ease-in-out infinite',
          }}
        ></div>
        
        {/* Neon glow DESTRO - metà fuori dallo schermo */}
        <div 
          className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          style={{
            transform: 'translate(50%, -25%)',
            animation: 'glowPulse 2.5s ease-in-out 1.25s infinite',
          }}
        ></div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          {!isConfigured ? (
            <SetupWizard onSetupComplete={handleSetupComplete} />
          ) : activeRanking ? (
              <DetailView
                ranking={activeRanking}
                onSave={handleSaveRanking}
                onBack={handleGoBack}
              />
          ) : (
              <MainView
                guestName={guestName}
                setGuestName={setGuestName}
                rankings={rankings}
                onSelectRanking={handleSelectRanking}
                onLogoClick={handleToggleScreensaver}
              />
          )}
        </div>
      </div>
    </>
  );
};

export default App;
