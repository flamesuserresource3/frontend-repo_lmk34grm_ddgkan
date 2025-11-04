import React from 'react';
import { Heart, Flame } from 'lucide-react';

const GameHUD = ({ score, lives, streak, timeLeft, timeTotal, level }) => {
  const pct = Math.max(0, Math.min(100, (timeLeft / timeTotal) * 100));
  return (
    <div className="w-full bg-white/80 backdrop-blur rounded-xl border border-amber-200 p-3 flex flex-col gap-3">
      <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-amber-900">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Level {level}</span>
          <div className="flex items-center gap-1 text-amber-700">
            <Flame size={18} />
            <span className="text-sm">Streak: {streak}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-amber-700">
            <Heart className="text-rose-500" size={18} />
            <span className="text-sm">x{lives}</span>
          </div>
          <div className="text-sm font-semibold">Score: {score}</div>
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
