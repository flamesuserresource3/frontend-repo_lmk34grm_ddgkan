import React, { useState, useMemo } from 'react';
import { Play, Calendar, Trophy, BookOpen, X } from 'lucide-react';

const Modal = ({ title, open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-amber-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100">
          <h3 className="text-lg font-semibold text-amber-900">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-amber-50 text-amber-700">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 text-amber-900/90">{children}</div>
      </div>
    </div>
  );
};

const MainMenu = ({ onStart, onDaily }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const leaderboard = useMemo(() => {
    try {
      const raw = localStorage.getItem('mq_leaderboard');
      const parsed = raw ? JSON.parse(raw) : [];
      return parsed.sort((a, b) => b.score - a.score).slice(0, 10);
    } catch {
      return [];
    }
  }, [showLeaderboard]);

  return (
    <div className="mt-8 grid md:grid-cols-2 gap-6">
      <div className="p-6 bg-white rounded-2xl shadow-lg border border-amber-100">
        <h2 className="text-2xl font-bold text-amber-900">Play</h2>
        <p className="text-amber-800/80 mt-1">Begin your journey through the enchanted realms of arithmetic, algebra, and beyond.</p>
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button onClick={onStart} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition shadow">
            <Play size={18} /> Start Game
          </button>
          <button onClick={onDaily} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-amber-700 font-semibold border border-amber-200 hover:bg-amber-50 transition">
            <Calendar size={18} /> Daily Challenge
          </button>
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl shadow-lg border border-amber-100">
        <h2 className="text-2xl font-bold text-amber-900">Learn & Compete</h2>
        <p className="text-amber-800/80 mt-1">Read the rules or see how you rank among other adventurers.</p>
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button onClick={() => setShowInstructions(true)} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-amber-700 font-semibold border border-amber-200 hover:bg-amber-50 transition">
            <BookOpen size={18} /> Instructions
          </button>
          <button onClick={() => setShowLeaderboard(true)} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-amber-700 font-semibold border border-amber-200 hover:bg-amber-50 transition">
            <Trophy size={18} /> Leaderboard
          </button>
        </div>
      </div>

      <Modal title="How to Play" open={showInstructions} onClose={() => setShowInstructions(false)}>
        <ul className="list-disc pl-6 space-y-2">
          <li>Solve each puzzle before the timer ends. Correct answers grant XP and energy.</li>
          <li>You have 3 lives. Wrong answers cost 1 life. Keep a streak for bonus time and points.</li>
          <li>Levels grow harder as you succeed: from arithmetic to algebra, patterns, probability, and geometry.</li>
          <li>Return daily for a fresh challenge seeded to the date.</li>
          <li>Tip: Read carefully! Some puzzles are trick questions or logic-based.</li>
        </ul>
      </Modal>

      <Modal title="Leaderboard" open={showLeaderboard} onClose={() => setShowLeaderboard(false)}>
        {leaderboard.length === 0 ? (
          <p>No scores yet. Be the first to claim the top spot!</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((row, i) => (
              <div key={i} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                <span className="font-medium text-amber-900">#{i + 1}</span>
                <span className="text-amber-800">{row.mode}</span>
                <span className="font-semibold text-amber-900">{row.score} pts</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MainMenu;
