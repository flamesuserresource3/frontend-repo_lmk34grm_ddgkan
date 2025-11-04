import React, { useState, useEffect } from 'react';

// Render and validate a puzzle
// puzzle = { type, prompt, choices?, answer, explain? }
const GameBoard = ({ puzzle, onSubmit, disabled }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue('');
  }, [puzzle]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !disabled) onSubmit(value);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-amber-200 shadow-lg p-6">
      <h3 className="text-xl md:text-2xl font-bold text-amber-900">{puzzle.prompt}</h3>
      {puzzle.choices ? (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {puzzle.choices.map((c, idx) => (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => onSubmit(String(c))}
              className="px-3 py-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-medium disabled:opacity-60"
            >
              {c}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-3">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer"
            className="flex-1 px-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            disabled={disabled}
          />
          <button
            onClick={() => onSubmit(value)}
            disabled={disabled}
            className="px-5 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-60"
          >
            Submit
          </button>
        </div>
      )}
      {puzzle.explain && (
        <p className="mt-4 text-sm text-amber-800/80">Hint: {puzzle.explain}</p>
      )}
    </div>
  );
};

export default GameBoard;
