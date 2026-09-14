import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CloudLightning,
  RefreshCw,
  User,
  Globe,
  SlidersHorizontal,
  ShieldAlert,
  Sparkles,
  Sun,
  Flame,
} from 'lucide-react';
import { AppLanguage } from '../types';

export const Header: React.FC = () => {
  const {
    userName,
    userRole,
    language,
    setLanguage,
    currentWeather,
    lastUpdatedTime,
    isLoading,
    refreshWeatherData,
    demoScenario,
    setDemoScenario,
    setIsAuthModalOpen,
    alerts,
    t,
  } = useApp();

  const roleLabelMap: Record<string, string> = {
    farmer: 'Farmer (शेतकरी)',
    student: 'Student (विद्यार्थी)',
    outdoor_worker: 'Outdoor Worker',
    traveller: 'Traveller',
    disaster_manager: 'Disaster Manager',
    researcher: 'Researcher',
    general_public: 'General Public',
  };

  const hasActiveWarning = alerts.length > 0 && alerts[0].severity !== 'GREEN';

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      {/* Top Government & SIH Banner */}
      <div className="bg-slate-900 text-slate-200 text-[11px] font-medium px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-white tracking-wide">भारत सरकार • Ministry of Earth Sciences (MoES)</span>
          <span className="hidden sm:inline text-slate-400">| India Meteorological Department (IMD)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border border-blue-700/60">
            SIH 2026 • PS 26068
          </span>
          <span className="text-slate-400 hidden md:inline">Nagpur District Regional Centre</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Left: Brand & District Focus */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-950/20 border border-blue-700/30">
            <CloudLightning className="w-5 h-5 text-amber-300" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                Weather<span className="text-blue-600">GPT</span>
              </h1>
              {currentWeather?.isDemo ? (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider">
                  DEMO DATA
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 uppercase tracking-wider">
                  LIVE IMD
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span>Nagpur District, Maharashtra</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">RMC Sonegaon</span>
            </p>
          </div>
        </div>

        {/* Right: Demo Scenarios, Language, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Scenario Quick Selector */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" /> Demo:
            </span>
            <button
              id="demo-monsoon-btn"
              onClick={() => setDemoScenario('monsoon_thunderstorm')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                demoScenario === 'monsoon_thunderstorm'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
              title="Simulate severe monsoon squall with Orange Alert"
            >
              🌧️ Monsoon Squall
            </button>
            <button
              id="demo-heatwave-btn"
              onClick={() => setDemoScenario('summer_heatwave')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                demoScenario === 'summer_heatwave'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
              title="Simulate 44.6°C Heatwave with Red Alert"
            >
              🔥 44.6°C Heatwave
            </button>
            <button
              id="demo-winter-btn"
              onClick={() => setDemoScenario('pleasant_winter')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                demoScenario === 'pleasant_winter'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
              title="Simulate mild clear weather with Green status"
            >
              ☀️ Mild Weather
            </button>
            <button
              id="demo-live-btn"
              onClick={() => setDemoScenario('none')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                demoScenario === 'none'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
              title="Fetch live real-time Open-Meteo & IMD observations"
            >
              📡 Real Live Data
            </button>
          </div>

          {/* Language Switcher */}
          <div className="relative flex items-center">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              aria-label="Select application language"
              className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs rounded-lg pl-7 pr-3 py-1.5 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            id="refresh-weather-btn"
            onClick={() => refreshWeatherData()}
            disabled={isLoading}
            aria-label="Refresh weather data"
            className="p-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
            title={`Last updated: ${lastUpdatedTime}`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Profile / Role Button */}
          <button
            id="open-profile-btn"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-blue-700" />
            <span className="hidden sm:inline">{userName.split(' ')[0]}</span>
            <span className="text-[10px] bg-blue-200/70 text-blue-800 px-1.5 py-0.2 rounded font-normal hidden md:inline">
              {roleLabelMap[userRole]?.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-strip: Last updated time & Warning ticker if active */}
      <div className="bg-slate-50 px-4 sm:px-6 py-1 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          {hasActiveWarning ? (
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold truncate animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{alerts[0].title}</span>
              <span className="hidden sm:inline text-slate-400 font-normal">({alerts[0].severity} Alert)</span>
            </span>
          ) : (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>No extreme weather warnings in Nagpur District</span>
            </span>
          )}
        </div>

        <div className="shrink-0 text-slate-400 text-[11px]">
          Updated: <span className="font-medium text-slate-600">{lastUpdatedTime || 'Just now'}</span>
        </div>
      </div>
    </header>
  );
};
