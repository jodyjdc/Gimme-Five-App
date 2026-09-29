import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking } from '../types';
import { PrintedText } from './PrintedText';
import { easeOutQuart, printSpring } from '../motionConfig';

interface SetupWizardProps {
  onSetupComplete: (guestName: string, rankings: Ranking[]) => void;
}

const inputClasses = "font-anybody w-full border-b-2 border-dashed border-[var(--ink-white)]/25 bg-transparent px-2 py-3 text-center text-3xl text-[var(--ink-white)] placeholder-[var(--ink-white)]/25 transition-colors duration-300 focus:border-solid focus:border-[var(--ink-white)]/80 focus:outline-none";
const inputStyle = { fontVariationSettings: "'wdth' 78, 'wght' 500" };

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
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center">
      <p className="font-anybody mb-4 text-xs font-bold uppercase tracking-[0.35em] text-[var(--ink-white)]/50">
        Passo {step + 1} di {totalSteps}
      </p>

      {/* Avanzamento: sei biglietti, quello corrente in rosa, i fatti in bianco. */}
      <div className="mb-10 flex gap-2" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, index) => (
          <motion.span
            key={index}
            className="h-3 w-8 rounded-[3px] border-2"
            initial={false}
            animate={{
              backgroundColor: index < step ? '#f3ede1' : index === step ? '#ff64c4' : 'rgba(243,237,225,0)',
              borderColor: index <= step ? (index === step ? '#ff64c4' : '#f3ede1') : 'rgba(243,237,225,0.25)',
              rotate: index === step ? -6 : 0,
              y: index === step ? -2 : 0,
            }}
            transition={printSpring}
          />
        ))}
      </div>

      <h1 className="mb-10 min-h-[1.1em] text-4xl leading-none sm:text-6xl">
        <PrintedText
          key={step}
          text={step === 0 ? "Come si chiama l'ospite di oggi?" : `Classifica #${step}`}
          stagger={0.025}
        />
      </h1>

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
                className={inputClasses}
                style={inputStyle}
                placeholder="Scrivi qui..."
              />
            </motion.div>
          ) : (
            <motion.div
              key={`ranking-${step}`}
              className="w-full flex flex-col space-y-6"
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
              className={inputClasses}
              style={inputStyle}
              placeholder="Titolo esteso..."
            />
            <input
              ref={keywordInputRef}
              type="text"
              value={rankingsData[step - 1].keyword}
              onChange={(e) => handleInputChange(e.target.value, 'keyword')}
              onKeyDown={(e) => handleKeyDown(e, 'keyword')}
              className={inputClasses}
              style={inputStyle}
              placeholder="Parola chiave (breve)..."
            />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        onClick={handleNext}
        disabled={isDisabled}
        className="font-anybody mt-14 rounded-md px-12 py-4 text-xl uppercase tracking-wide focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ink-white)] disabled:cursor-not-allowed"
        style={{ fontVariationSettings: "'wdth' 70, 'wght' 850" }}
        // Blocco stampato: l'ombra rosa è la lastra sfalsata; disattivo resta "non inchiostrato".
        initial={false}
        animate={isDisabled
          ? { backgroundColor: 'rgba(243,237,225,0.12)', color: 'rgba(243,237,225,0.35)', boxShadow: '0px 0px 0 0 #ff64c4' }
          : { backgroundColor: 'rgba(243,237,225,1)', color: 'rgba(15,14,12,1)', boxShadow: '6px 6px 0 0 #ff64c4' }}
        whileHover={isDisabled ? undefined : { x: -2, y: -2, boxShadow: '9px 9px 0 0 #ff64c4' }}
        whileTap={isDisabled ? undefined : { x: 6, y: 6, boxShadow: '0px 0px 0 0 #ff64c4' }}
        transition={printSpring}
      >
        {step < 5 ? 'Avanti' : 'Inizia!'}
      </motion.button>
    </div>
  );
};
