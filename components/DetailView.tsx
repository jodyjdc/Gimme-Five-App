import React, { useState, useEffect } from 'react';
import { Ranking } from '../types';

interface DetailViewProps {
  ranking: Ranking;
  onSave: (id: number, entries: string[]) => void;
  onBack: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ ranking, onSave, onBack }) => {
  const [entries, setEntries] = useState<string[]>(['', '', '', '', '']);

  useEffect(() => {
    setEntries(ranking.entries);
  }, [ranking]);

  const handleInputChange = (index: number, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = value;
    setEntries(newEntries);
  };

  const handleSaveClick = () => {
    onSave(ranking.id, entries);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      <header className="w-full text-center mb-12">
        <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 dark:text-white">{ranking.fullTitle}</h1>
      </header>
      
      <main className="w-full flex flex-col space-y-5">
        {entries.map((entry, index) => (
          <div key={index} className="flex items-center space-x-4 w-full">
            <span className="text-5xl font-black text-cyan-500 dark:text-cyan-400 w-10 text-center">{index + 1}</span>
            <input
              type="text"
              value={entry}
              onChange={(e) => handleInputChange(index, e.target.value)}
              placeholder={`Posizione #${index + 1}`}
              className="w-full bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-6 text-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
            />
          </div>
        ))}
      </main>

      <footer className="w-full flex items-center justify-between mt-16 space-x-4">
        <button
          onClick={onBack}
          className="px-12 py-5 text-xl bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-200"
        >
          Indietro
        </button>
        <button
          onClick={handleSaveClick}
          className="px-12 py-5 bg-cyan-600 text-white font-bold text-2xl rounded-lg shadow-lg shadow-cyan-500/30 dark:shadow-cyan-900/50 hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105"
        >
          Salva Classifica
        </button>
      </footer>
    </div>
  );
};