import React from 'react';
import Spline from '@splinetool/react-spline';

const HeroSection = () => {
  return (
    <section className="relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden bg-gradient-to-b from-amber-100 to-white shadow-xl">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/95Gu7tsx2K-0F3oi/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/80" />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-amber-900 drop-shadow-sm">
          MathQuest: <span className="text-amber-600">The Number Trials</span>
        </h1>
        <p className="mt-3 max-w-2xl text-amber-800/80 text-base md:text-lg">
          Harness the magic of numbers. Solve puzzles, earn energy, and advance through enchanted realms.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
