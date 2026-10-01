import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking } from '../types';
import { broadcastTransition, easeOutQuart, quickTransition, screenTransition, softSpring } from '../motionConfig';

interface SetupWizardProps {
  onSetupComplete: (guestName: string, rankings: Ranking[]) => void;
  /** Ospite salvato su file: lo carica e salta la configurazione. */
  onImportEpisode: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onSetupComplete, onImportEpisode }) => {
  const [step, setStep] = useState(0); // 0: guest name, 1-5: rankings
  const [guestName, setGuestName] = useState('');
  const [rankingsData, setRankingsData] = useState<{ fullTitle: string; keyword: string }[]>(
    Array(5).fill(null).map(() => ({ fullTitle: '', keyword: '' }))
  );

  const guestNameInputRef = useRef<HTMLInputElement>(null);
  const fullTitleInputRef = useRef<HTMLInputElement>(null);
  const keywordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 0) {
      guestNameInputRef.current?.focus();
    } else {
      fullTitleInputRef.current?.focus();
    }
  }, [step]);

  const handleInputChange = (
    value: string,
    field: 'guestName' | 'fullTitle' | 'keyword'
  ) => {
    if (field === 'guestName') {
      setGuestName(value);
    } else {
      const rankingIndex = step - 1;
      if (rankingIndex >= 0 && rankingIndex < 5) {
        const newRankingsData = [...rankingsData];
        newRankingsData[rankingIndex] = {
          ...newRankingsData[rankingIndex],
          [field]: value
        };
        setRankingsData(newRankingsData);
      }
    }
  };

  const handleNext = () => {
    // Validation
    if (step === 0) {
      if (guestName.trim() === '') return;
    } else {
      const rankingIndex = step - 1;
      const currentRanking = rankingsData[rankingIndex];
      if (currentRanking.fullTitle.trim() === '' || currentRanking.keyword.trim() === '') {
        return;
      }
    }

    if (step < 5) {
      setStep(step + 1);
    } else {
      const finalRankings: Ranking[] = rankingsData.map((data, index) => ({
        id: index + 1,
        fullTitle: data.fullTitle,
        keyword: data.keyword,
        entries: ['', '', '', '', ''],
        completed: false,
      }));
      onSetupComplete(guestName, finalRankings);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentField: 'guestName' | 'fullTitle' | 'keyword') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentField === 'fullTitle') {
        keywordInputRef.current?.focus();
      } else { // 'guestName' or 'keyword'
        handleNext();
      }
    }
  };

  const isNextDisabled = () => {
    if (step === 0) {
      return guestName.trim() === '';
    }
    const rankingIndex = step - 1;
    const currentRanking = rankingsData[rankingIndex];
    return currentRanking.fullTitle.trim() === '' || currentRanking.keyword.trim() === '';
  };

  const totalSteps = 6;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center animate-fade-in">
      <motion.p
        className="text-cyan-400 font-semibold mb-2"
        key={`step-count-${step}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={quickTransition}
      >
        Passo {step + 1} di {totalSteps}
      </motion.p>
      <motion.h1
        className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-8"
        key={`step-title-${step}`}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={screenTransition}
      >
        {step === 0 ? "Come si chiama l'ospite di oggi?" : `Classifica #${step}`}
      </motion.h1>
      <motion.div
        className="mb-7 h-1 w-full max-w-sm overflow-hidden rounded-full bg-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={quickTransition}
      >
        <motion.div
          className="h-full rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.65)]"
          initial={false}
          animate={{ scaleX: (step + 1) / totalSteps }}
          style={{ transformOrigin: 'left center' }}
          transition={broadcastTransition}
        />
      </motion.div>

      <div className="w-full flex flex-col space-y-4">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 ? (
            <motion.div
              key="guest-name"
              className="w-full"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: easeOutQuart }}
            >
              <input
                ref={guestNameInputRef}
                type="text"
                value={guestName}
                onChange={(e) => handleInputChange(e.target.value, 'guestName')}
                onKeyDown={(e) => handleKeyDown(e, 'guestName')}
                className="w-full bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 text-2xl text-center text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                placeholder="Scrivi qui..."
              />
            </motion.div>
          ) : (
            <motion.div
              key={`ranking-${step}`}
              className="w-full flex flex-col space-y-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: easeOutQuart }}
            >
            <input
              ref={fullTitleInputRef}
              type="text"
              value={rankingsData[step - 1].fullTitle}
              onChange={(e) => handleInputChange(e.target.value, 'fullTitle')}
              onKeyDown={(e) => handleKeyDown(e, 'fullTitle')}
              className="w-full bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 text-2xl text-center text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
              placeholder="Titolo esteso..."
            />
            <input
              ref={keywordInputRef}
              type="text"
              value={rankingsData[step - 1].keyword}
              onChange={(e) => handleInputChange(e.target.value, 'keyword')}
              onKeyDown={(e) => handleKeyDown(e, 'keyword')}
              className="w-full bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 text-2xl text-center text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
              placeholder="Parola chiave (breve)..."
            />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        onClick={handleNext}
        disabled={isNextDisabled()}
        className="mt-10 px-12 py-4 bg-cyan-600 text-white font-bold text-lg rounded-lg shadow-lg shadow-cyan-500/30 dark:shadow-cyan-900/50 hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100"
        whileHover={isNextDisabled() ? undefined : { scale: 1.035 }}
        whileTap={isNextDisabled() ? undefined : { scale: 0.98 }}
        transition={softSpring}
      >
        {step < 5 ? 'Avanti' : 'Inizia!'}
      </motion.button>
      {step === 0 && (
        <button type="button" onClick={onImportEpisode} className="mt-8 rounded-md px-6 py-2 text-xl font-semibold text-white/50 transition-colors hover:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400">
          Importa ospite da file
        </button>
      )}
    </div>
  );
};
