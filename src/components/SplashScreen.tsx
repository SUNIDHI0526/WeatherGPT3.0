import React, { useEffect, useState } from 'react';
import { CloudRain, Radio, Sparkles, MapPin } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fadeState, setFadeState] = useState<'visible' | 'fading' | 'hidden'>('visible');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeState('fading');
      setTimeout(onComplete, 400);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (fadeState === 'hidden') return null;

  return (
    <div
      id="splash-screen-container"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white transition-opacity duration-500 ${
        fadeState === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.35)_0%,rgba(15,23,42,1)_70%)]" />

      {/* Emblem & Symbols */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        <div className="relative mb-6 flex items-center justify-center">
          {/* Outer AI Pulse ring */}
          <div className="absolute w-24 h-24 rounded-full border border-blue-400/30 animate-ping opacity-60" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center shadow-xl shadow-blue-500/25 border border-blue-400/40">
            <CloudRain className="w-10 h-10 text-white" />
            <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Weather<span className="text-blue-400">GPT</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm font-medium text-slate-300 mb-6 tracking-wide">
          Conversational Weather & Climate Intelligence
        </p>

        {/* District & Location Signal */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300 mb-8">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>Nagpur District • Maharashtra</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>

        {/* SIH 2026 Badge */}
        <div className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
          Ministry of Earth Sciences • IMD • SIH 2026
        </div>

        <button
          id="skip-splash-btn"
          onClick={() => {
            setFadeState('fading');
            setTimeout(onComplete, 200);
          }}
          className="mt-8 text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4 cursor-pointer"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
};
