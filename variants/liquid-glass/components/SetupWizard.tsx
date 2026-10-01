import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking } from '../types';
import { trackGlassLight } from './Glass';
import { easeOutQuint, liquidMorphSpring } from '../motionConfig';

interface SetupWizardProps {
  onSetupComplete: (guestName: string, rankings: Ranking[]) => void;
  /** Ospite salvato su file: lo carica e salta la configurazione. */
  onImportEpisode: () => void;
}

const inputClasses = "font-tight w-full rounded-full bg-white/[0.06] px-8 py-5 text-center text-3xl font-medium text-white caret-[var(--lg-cyan)] placeholder-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_0_0_1px_rgba(255,255,255,0.08)] transition-colors duration-300 focus:bg-white/[0.12] focus:outline-none";

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
  const isDisabled = isNextDisabled();

  return (
    // Niente pannello: domanda e campi stanno direttamente sul buio, sopra le increspature.
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-12 py-14 text-center">
      {/* Avanzamento: una goccia di luce che scorre su sei tacche. */}
      <div className="relative mb-6 flex gap-3" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, index) => (
          <span key={index} className="h-2.5 w-10 rounded-full bg-white/15" />
        ))}
        <motion.span
          className="absolute top-0 h-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
          initial={false}
          animate={{ width: 40 + step * 52, left: 0 }}
          transition={liquidMorphSpring}
        />
      </div>
      <p className="font-tight mb-6 text-base font-medium text-white/55">
        Passo {step + 1} di {totalSteps}
      </p>

      <motion.h1
        key={step}
        className="font-tight lg-text-glow mb-12 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl"
        initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, ease: easeOutQuint }}
      >
        {step === 0 ? "Come si chiama l'ospite di oggi?" : `Classifica #${step}`}
      </motion.h1>

      <div className="w-full flex flex-col space-y-4">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 ? (
            <motion.div
              key="guest-name"
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <input
                ref={guestNameInputRef}
                type="text"
                value={guestName}
                onChange={(e) => handleInputChange(e.target.value, 'guestName')}
                onKeyDown={(e) => handleKeyDown(e, 'guestName')}
                className={inputClasses}
                placeholder="Scrivi qui..."
              />
            </motion.div>
          ) : (
            <motion.div
              key={`ranking-${step}`}
              className="w-full flex flex-col space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <input
                ref={fullTitleInputRef}
                type="text"
                value={rankingsData[step - 1].fullTitle}
                onChange={(e) => handleInputChange(e.target.value, 'fullTitle')}
                onKeyDown={(e) => handleKeyDown(e, 'fullTitle')}
                aria-label="Titolo esteso"
                className={inputClasses}
                placeholder="Titolo esteso..."
              />
              <input
                ref={keywordInputRef}
                type="text"
                value={rankingsData[step - 1].keyword}
                onChange={(e) => handleInputChange(e.target.value, 'keyword')}
                onKeyDown={(e) => handleKeyDown(e, 'keyword')}
                aria-label="Parola chiave"
                className={inputClasses}
                placeholder="Parola nella casella..."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        onClick={handleNext}
        onPointerMove={trackGlassLight}
        disabled={isDisabled}
        className="font-tight mt-12 rounded-full px-14 py-5 text-2xl font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 disabled:cursor-not-allowed"
        style={{
          background: isDisabled ? 'rgba(255,255,255,0.08)' : 'radial-gradient(circle at var(--lx, 50%) var(--ly, 0%), #ffffff, #e9f6ff 60%)',
          color: isDisabled ? 'rgba(255,255,255,0.35)' : '#04050a',
          boxShadow: isDisabled ? 'none' : '0 0 2rem rgba(255,255,255,0.35)',
        }}
        whileHover={isDisabled ? undefined : { scale: 1.05 }}
        whileTap={isDisabled ? undefined : { scale: 0.95 }}
        transition={liquidMorphSpring}
      >
        {step < 5 ? 'Avanti' : 'Inizia'}
      </motion.button>
      {step === 0 && (
        <button type="button" onClick={onImportEpisode} className="font-tight mt-8 rounded-full px-6 py-2 text-xl font-medium text-white/50 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
          Importa ospite da file
        </button>
      )}
    </div>
  );
};
