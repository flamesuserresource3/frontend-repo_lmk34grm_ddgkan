import React, { useEffect, useMemo, useRef, useState } from 'react';
import HeroSection from './components/HeroSection';
import MainMenu from './components/MainMenu';
import GameHUD from './components/GameHUD';
import GameBoard from './components/GameBoard';

// Simple seeded RNG for daily challenge
function mulberry32(a) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

function useSounds() {
  const ctxRef = useRef(null);
  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  };
  const play = (freq = 880, dur = 0.12, type = 'sine', gain = 0.06) => {
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  };
  return {
    success: () => play(900, 0.1, 'triangle', 0.07),
    error: () => play(160, 0.2, 'square', 0.05),
    level: () => {
      play(600, 0.08, 'sine', 0.06);
      setTimeout(() => play(800, 0.1, 'sine', 0.06), 90);
    },
  };
}

// Puzzle generation across difficulty tiers
function makePuzzle(rng, difficulty) {
  // difficulty roughly 1..10
  const types = ['arithmetic', 'sequence', 'algebra', 'grid'];
  const pick = types[Math.floor(rng() * types.length)];

  if (pick === 'arithmetic') {
    const ops = ['+', '-', '×', '÷'];
    const op = ops[Math.floor(rng() * (difficulty > 5 ? ops.length : 2))];
    const a = Math.floor(rng() * (10 + difficulty * 3)) + 1;
    const b = Math.floor(rng() * (10 + difficulty * 3)) + 1;
    let prompt = `${a} ${op} ${b} = ?`;
    let ans = 0;
    switch (op) {
      case '+':
        ans = a + b;
        break;
      case '-':
        ans = a - b;
        break;
      case '×':
        ans = a * b;
        break;
      case '÷':
        ans = Math.floor(a / b);
        prompt = `${a} ÷ ${b} (rounded down) = ?`;
        break;
      default:
        break;
    }
    const choices = [ans];
    while (choices.length < 4) {
      const delta = Math.floor(rng() * 6) - 3;
      const c = ans + delta * (1 + Math.floor(rng() * 2));
      if (!choices.includes(c)) choices.push(c);
    }
    choices.sort(() => rng() - 0.5);
    return { type: 'mcq', prompt, choices, answer: String(ans) };
  }

  if (pick === 'sequence') {
    // Arithmetic or geometric sequences with missing next term
    const isGeo = rng() < clamp(difficulty / 12, 0, 0.5);
    const start = Math.floor(rng() * 6) + 1;
    const step = Math.floor(rng() * (isGeo ? 4 : 8)) + 2;
    const seq = [start];
    for (let i = 1; i < 4; i++) seq.push(isGeo ? seq[i - 1] * step : seq[i - 1] + step);
    const ans = isGeo ? seq[3] * step : seq[3] + step;
    const prompt = `${seq.join(', ')} , ?`;
    return { type: 'input', prompt: `Find the next number: ${prompt}`, answer: String(ans) };
  }

  if (pick === 'algebra') {
    // Solve for x in ax + b = c
    const a = Math.floor(rng() * (3 + difficulty)) + 1;
    const x = Math.floor(rng() * (8 + difficulty)) + 1;
    const b = Math.floor(rng() * 10);
    const c = a * x + b;
    const prompt = `Solve for x: ${a}x + ${b} = ${c}`;
    return { type: 'input', prompt, answer: String(x) };
  }

  // grid logic: simple 2x2 magic-sum style (sum rows/cols equal)
  const base = Math.floor(rng() * 6) + 3;
  const grid = [base, base + 1, base + 2, base + 3];
  const missingIndex = Math.floor(rng() * 4);
  const total = grid[0] + grid[1];
  const prompt = `Fill the missing number so each row sums to ${total}: [${grid
    .map((v, i) => (i === missingIndex ? '□' : v))
    .slice(0, 2)
    .join(' ')}] / [${grid
    .map((v, i) => (i === missingIndex ? '□' : v))
    .slice(2)
    .join(' ')}]`;
  return { type: 'input', prompt, answer: String(grid[missingIndex]) };
}

export default function App() {
  const [mode, setMode] = useState('menu'); // menu | playing | daily | gameover
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [puzzle, setPuzzle] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeTotal, setTimeTotal] = useState(0);
  const [disabled, setDisabled] = useState(false);

  const sounds = useSounds();

  const dailySeed = useMemo(() => {
    const d = new Date();
    const key = Number(`${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d
      .getDate()
      .toString()
      .padStart(2, '0')}`);
    return key;
  }, []);

  const rng = useMemo(() => (mode === 'daily' ? mulberry32(dailySeed) : Math.random.bind(Math)), [mode, dailySeed]);

  const difficulty = useMemo(() => clamp(1 + Math.floor((level - 1) / 2) + Math.floor(streak / 3), 1, 10), [level, streak]);

  const startRun = (isDaily = false) => {
    setMode(isDaily ? 'daily' : 'playing');
    setLevel(1);
    setScore(0);
    setStreak(0);
    setLives(3);
    nextPuzzle(1, 0, 0, isDaily ? mulberry32(dailySeed) : null);
  };

  const nextPuzzle = (lvl = level, scr = score, stk = streak, seeded = null) => {
    const localRng = seeded || (mode === 'daily' ? mulberry32(dailySeed + lvl + stk) : Math.random);
    const p = makePuzzle(localRng, clamp(1 + Math.floor((lvl - 1) / 2) + Math.floor(stk / 3), 1, 10));
    setPuzzle(p);
    const baseTime = 18 - Math.min(12, lvl + Math.floor(stk / 2));
    const t = clamp(baseTime, 6, 18);
    setTimeLeft(t);
    setTimeTotal(t);
    setDisabled(false);
  };

  // timer
  useEffect(() => {
    if (!(mode === 'playing' || mode === 'daily')) return;
    if (!puzzle) return;
    if (timeLeft <= 0) {
      // time out counts as wrong
      if (!disabled) handleSubmit('__timeout__');
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [mode, puzzle, timeLeft, disabled]);

  const saveLeaderboard = (finalScore) => {
    try {
      const raw = localStorage.getItem('mq_leaderboard');
      const list = raw ? JSON.parse(raw) : [];
      list.push({ score: finalScore, mode: mode === 'daily' ? 'Daily' : 'Arcade', ts: Date.now() });
      localStorage.setItem('mq_leaderboard', JSON.stringify(list));
      const best = Number(localStorage.getItem('mq_best') || '0');
      if (finalScore > best) localStorage.setItem('mq_best', String(finalScore));
    } catch {}
  };

  const handleSubmit = (value) => {
    if (!puzzle) return;
    setDisabled(true);
    const correct = String(puzzle.answer).trim() === String(value).trim();
    if (correct) {
      sounds.success();
      const bonus = 10 + Math.max(0, timeLeft - 1) + streak * 2;
      const newScore = score + bonus;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      setTimeout(() => {
        sounds.level();
        setLevel((lv) => lv + 1);
        nextPuzzle(level + 1, newScore, newStreak);
      }, 220);
    } else {
      sounds.error();
      const remaining = lives - 1;
      setLives(remaining);
      setStreak(0);
      if (remaining <= 0) {
        saveLeaderboard(score);
        setMode('gameover');
      } else {
        setTimeout(() => nextPuzzle(level, score, 0), 220);
      }
    }
  };

  const quitToMenu = () => {
    setMode('menu');
  };

  const GameArea = () => (
    <div className="space-y-4">
      <GameHUD score={score} lives={lives} streak={streak} timeLeft={timeLeft} timeTotal={timeTotal} level={level} />
      {puzzle && (
        <GameBoard puzzle={{
          type: puzzle.type === 'mcq' ? 'mcq' : 'input',
          prompt: puzzle.prompt,
          choices: puzzle.choices,
          answer: puzzle.answer,
          explain: puzzle.explain,
        }} onSubmit={handleSubmit} disabled={disabled} />
      )}
      <div className="flex items-center justify-between">
        <div className="text-sm text-amber-800/80">Difficulty: {difficulty}</div>
        <button onClick={quitToMenu} className="text-sm px-4 py-2 rounded-lg bg-white border border-amber-200 text-amber-700 hover:bg-amber-50">Quit</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <HeroSection />

        {mode === 'menu' && (
          <MainMenu onStart={() => startRun(false)} onDaily={() => startRun(true)} />
        )}

        {(mode === 'playing' || mode === 'daily') && <div className="mt-8"><GameArea /></div>}

        {mode === 'gameover' && (
          <div className="mt-8 bg-white rounded-2xl border border-amber-200 shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-amber-900">Game Over</h3>
            <p className="mt-2 text-amber-800">Final Score: <span className="font-semibold">{score}</span></p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button onClick={() => startRun(false)} className="px-5 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700">Play Again</button>
              <button onClick={() => setMode('menu')} className="px-5 py-3 rounded-xl bg-white border border-amber-200 text-amber-700 hover:bg-amber-50">Main Menu</button>
            </div>
          </div>
        )}

        <footer className="mt-10 text-center text-sm text-amber-800/70">
          Best Score: {typeof window !== 'undefined' ? (localStorage.getItem('mq_best') || 0) : 0}
        </footer>
      </div>
    </div>
  );
}
