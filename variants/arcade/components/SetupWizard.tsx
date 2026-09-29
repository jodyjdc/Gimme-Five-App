import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking } from '../types';
import { PixelButton, PixelInput, PixelText } from './Pixel';
import { arcadeColor, pixelSteps, sound } from '../arcade';

interface SetupWizardProps {
  onSetupComplete: (guestName: string, rankings: Ranking[]) => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onSetupComplete }) => {
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
      sound.select();
      setStep(step + 1);
    } else {
      sound.coin();
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
  const stepColor = arcadeColor(step);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center">
      <p className="mb-4 text-sm text-[var(--arc-cyan)]">
        <PixelText text={`PASSO ${step + 1} DI ${totalSteps}`} flash={false} />
      </p>

      {/* Avanzamento: barra "energia" a blocchi. */}
      <div className="mb-10 flex gap-1.5" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, index) => (
          <motion.span
            key={index}
            className="h-4 w-9"
            initial={false}
            animate={{
              backgroundColor: index <= step ? arcadeColor(index) : 'rgba(234,255,240,0.1)',
              opacity: index === step ? [1, 0.35, 1] : 1,
            }}
            transition={index === step ? { opacity: { duration: 0.8, repeat: Infinity, ease: pixelSteps(2) } } : { duration: 0 }}
          />
        ))}
      </div>

      <h1 className="mb-12 min-h-[1em] text-3xl leading-snug sm:text-5xl" style={{ color: stepColor }}>
        <PixelText
          key={step}
          text={step === 0 ? "COME SI CHIAMA L'OSPITE DI OGGI?" : `CLASSIFICA #${step}`}
          delay={0.1}
          stagger={0.03}
        />
      </h1>

      <div className="w-full flex flex-col space-y-4">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 ? (
            <motion.div
              key="guest-name"
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: pixelSteps(2) }}
            >
              <PixelInput
                ref={guestNameInputRef}
                value={guestName}
                onChange={(e) => handleInputChange(e.target.value, 'guestName')}
                onKeyDown={(e) => handleKeyDown(e, 'guestName')}
                placeholder="SCRIVI QUI..."
                align="center"
                className="w-full text-4xl text-[var(--phosphor)]"
              />
            </motion.div>
          ) : (
            <motion.div
              key={`ranking-${step}`}
              className="w-full flex flex-col space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: pixelSteps(2) }}
            >
              <div className="flex flex-col gap-3">
                <span className="text-xs text-[var(--phosphor)] opacity-50">
                  <PixelText text="TITOLO" flash={false} />
                </span>
                <PixelInput
                  ref={fullTitleInputRef}
                  value={rankingsData[step - 1].fullTitle}
                  onChange={(e) => handleInputChange(e.target.value, 'fullTitle')}
                  onKeyDown={(e) => handleKeyDown(e, 'fullTitle')}
                  placeholder="TITOLO ESTESO..."
                  aria-label="Titolo esteso"
                  align="center"
                  className="w-full text-3xl text-[var(--phosphor)]"
                />
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs text-[var(--phosphor)] opacity-50">
                  <PixelText text="PAROLA NELLA CASELLA" flash={false} />
                </span>
                <PixelInput
                  ref={keywordInputRef}
                  value={rankingsData[step - 1].keyword}
                  onChange={(e) => handleInputChange(e.target.value, 'keyword')}
                  onKeyDown={(e) => handleKeyDown(e, 'keyword')}
                  placeholder="PAROLA CHIAVE..."
                  aria-label="Parola chiave"
                  align="center"
                  className="w-full text-3xl text-[var(--phosphor)]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PixelButton
        label={step < 5 ? 'AVANTI ►' : 'INIZIA!'}
        onClick={handleNext}
        disabled={isNextDisabled()}
        color={stepColor}
        className="mt-14"
      />
    </div>
  );
};
