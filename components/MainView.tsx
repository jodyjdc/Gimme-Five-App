import React from 'react';
import { Ranking } from '../types';
import { Logo } from './Logo';

interface MainViewProps {
  guestName: string;
  setGuestName: (name: string) => void;
  rankings: Ranking[];
  onSelectRanking: (id: number) => void;
  onLogoClick: () => void;
}

const Bubble: React.FC<{ ranking: Ranking; onSelect: (id: number) => void }> = ({ ranking, onSelect }) => {
  const baseClasses = "relative w-full aspect-square rounded-full flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black";
  const animationDelay = `${ranking.id * 200}ms`;

  if (ranking.completed) {
    const keyword = ranking.keyword;
    let fontSizeClass = 'text-4xl';
    if (keyword.length > 5) fontSizeClass = 'text-3xl';
    if (keyword.length > 8) fontSizeClass = 'text-2xl';
    if (keyword.length > 12) fontSizeClass = 'text-xl';

    return (
      <div
        onClick={() => onSelect(ranking.id)}
        className={`${baseClasses} bg-gradient-to-br from-cyan-500 to-cyan-700 border-2 border-cyan-500 shadow-lg shadow-cyan-600/30 focus:ring-cyan-500 animate-float-fast`}
        style={{ animationDelay }}
      >
        <h3 
          className={`${fontSizeClass} font-bold text-white break-words`}
          style={{ WebkitTextStroke: '3px black', paintOrder: 'stroke fill' }}
        >
          {ranking.keyword}
        </h3>
        <div className="absolute bottom-3 right-3 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(ranking.id)}
      className={`${baseClasses} bg-gray-800/50 backdrop-blur-sm border-2 border-gray-500 hover:border-cyan-400 hover:bg-gray-700/50 focus:ring-cyan-400 animate-float-slow`}
      style={{ animationDelay }}
    >
      <h2 className="text-7xl font-black text-gray-400">{ranking.id}</h2>
    </div>
  );
};


export const MainView: React.FC<MainViewProps> = ({ guestName, setGuestName, rankings, onSelectRanking, onLogoClick }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-8">
      <div 
        onClick={onLogoClick}
        className="w-full max-w-[58rem] z-10 cursor-pointer px-4"
      >
        <Logo />
      </div>
      
      <header className="z-20 mt-4 mb-12 sm:mb-[6.4rem] w-full">
         <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full bg-transparent text-white placeholder-gray-400 text-4xl sm:text-6xl lg:text-8xl font-black text-center py-3 px-6 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:rounded-lg transition-all"
            placeholder="Nome Ospite"
        />
      </header>
      
      <main className="w-full max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-8 z-10">
        {rankings.map((ranking) => (
          <Bubble key={ranking.id} ranking={ranking} onSelect={onSelectRanking} />
        ))}
      </main>
    </div>
  );
};
