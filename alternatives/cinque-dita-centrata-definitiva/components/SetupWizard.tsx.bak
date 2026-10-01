import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ranking } from '../types';
import { NeonHand } from './NeonHand';
import { HAND_ASPECT } from '../hand';
import { neonTube } from './neon';
import { easeOutQuint, neonSpring } from '../motionConfig';

interface SetupWizardProps {
  onSetupComplete: (guestName: string, rankings: Ranking[]) => void;
}

const inputClasses = 'cd-field w-full rounded-full bg-transparent px-8 py-5 text-center text-3xl font-medium text-white caret-[rgb(0,208,255)] placeholder-white/30 focus:outline-none';

export const SetupWizard: React.FC<SetupWizardProps> = ({ onSetupComplete }) => {
  const [step, setStep] = useState(0); // 0: nome ospite, 1-5: classifiche
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

  const handleInputChange = (value: string, field: 'guestName' | 'fullTitle' | 'keyword') => {
    if (field === 'guestName') {
      setGuestName(value);
      return;
    }
    const rankingIndex = step - 1;
    setRankingsData(prev => prev.map((data, index) => index === rankingIndex ? { ...data, [field]: value } : data));
  };

  const isDisabled = step === 0
    ? guestName.trim() === ''
    : rankingsData[step - 1].fullTitle.trim() === '' || rankingsData[step - 1].keyword.trim() === '';

  const handleNext = () => {
    if (isDisabled) return;

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
      } else {
        handleNext();
      }
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-12 py-10 text-center">
      {/* Avanzamento: il palmo è l'ospite, ogni dito una classifica. Si accende man mano che si prepara la puntata. */}
      <NeonHand
        lit={[1, 2, 3, 4, 5].map(finger => step > finger)}
        palm={step > 0}
        warm={step > 0 ? step - 1 : 'palm'}
        className="mb-10 h-44"
        style={{ aspectRatio: HAND_ASPECT }}
      />

      <motion.h1
        key={step}
        className="cd-glow mb-12 text-5xl font-bold leading-tight text-white sm:text-6xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOutQuint }}
      >
        {step === 0 ? "Come si chiama l'ospite di oggi?" : `Classifica ${step}`}
      </motion.h1>

      <div className="flex w-full flex-col space-y-4">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 ? (
            <motion.div key="guest-name" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
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
            <motion.div key={`ranking-${step}`} className="flex w-full flex-col space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
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
                placeholder="Parola nell'anello..."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Il tasto è un tubo: spento finché manca qualcosa, acceso quando si può andare avanti. */}
      <motion.button
        type="button"
        onClick={handleNext}
        disabled={isDisabled}
        className="mt-12 rounded-full px-14 py-5 text-2xl font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-white disabled:cursor-not-allowed"
        initial={false}
        animate={{ boxShadow: neonTube(isDisabled ? null : 'cyan'), color: isDisabled ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,1)' }}
        whileHover={isDisabled ? undefined : { scale: 1.05 }}
        whileTap={isDisabled ? undefined : { scale: 0.95 }}
        transition={{ ...neonSpring, boxShadow: { duration: 0.4 }, color: { duration: 0.4 } }}
      >
        {step < 5 ? 'Avanti' : 'Inizia'}
      </motion.button>
    </div>
  );
};
