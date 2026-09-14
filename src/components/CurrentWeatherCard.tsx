import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Thermometer,
  Droplets,
  Wind,
  Compass,
  Gauge,
  Eye,
  CloudRain,
  Sun,
  Sunrise,
  Sunset,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';

export const CurrentWeatherCard: React.FC = () => {
  const { userName, currentWeather, lastUpdatedTime, isLoading, alerts, t } = useApp();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading && !currentWeather) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
        <div className="h-16 bg-slate-200 rounded w-1/2 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-14 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!currentWeather) return null;

  const hasOrangeOrRedAlert = alerts.some(a => a.severity === 'ORANGE' || a.severity === 'RED');

  return (
    <div
      id="current-weather-card"
      className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-blue-900/50 relative overflow-hidden mb-6"
    >
      {/* Background weather graphic flourishes */}
      <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Top bar: Personal Greeting & Location */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {getGreeting()}, <span className="text-blue-300">{userName}</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
            <span className="font-semibold text-white">Nagpur District, Maharashtra</span>
            <span>•</span>
            <span className="text-slate-400">Lat: 21.1458°N, Lon: 79.0882°E</span>
          </div>
        </div>

        {/* Source & Updated Pill */}
        <div className="flex flex-col items-end text-right">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentWeather.isDemo ? 'DEMO MET SIMULATION' : 'OFFICIAL IMD SONEGAON'}</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-1">
            Last observation: <strong className="text-slate-200">{currentWeather.timestamp}</strong>
          </span>
        </div>
      </div>

      {/* Main Hero Metrics: Temp & Condition */}
      <div className="relative z-10 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-baseline gap-4">
          <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter">
            {currentWeather.temperature}
            <span className="text-3xl sm:text-4xl text-blue-300 font-medium ml-1">°C</span>
          </div>
          <div>
            <div className="text-sm text-slate-300 font-medium">
              Feels like <strong className="text-white font-bold">{currentWeather.feelsLike}°C</strong>
            </div>
            <div className="text-lg sm:text-xl font-bold text-blue-200 mt-0.5 flex items-center gap-2">
              <span>{currentWeather.condition}</span>
            </div>
          </div>
        </div>

        {/* Active Alert banner inside card if any */}
        {hasOrangeOrRedAlert && (
          <div className="bg-amber-500/20 border border-amber-400/40 rounded-xl p-3.5 max-w-md flex items-start gap-3 text-amber-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <div className="font-bold text-amber-300 uppercase tracking-wide text-[11px]">
                {alerts[0].severity} Warning: {alerts[0].title}
              </div>
              <p className="text-slate-200 text-[11px] mt-0.5 line-clamp-2">
                {alerts[0].recommendedAction}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Key Meteorological Observations */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-4 border-t border-white/10">
        {/* Humidity */}
        <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-2.5 border border-white/5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span>Humidity</span>
          </div>
          <div className="text-base font-bold text-white">{currentWeather.humidity}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{currentWeather.humidity > 80 ? 'High moisture' : 'Moderate'}</div>
        </div>

        {/* Wind */}
        <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-2.5 border border-white/5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span>Wind</span>
          </div>
          <div className="text-base font-bold text-white">{currentWeather.windSpeed} <span className="text-xs font-normal">km/h</span></div>
          <div className="text-[10px] text-slate-400 mt-0.5">Dir: {currentWeather.windDirectionText} ({currentWeather.windDirection}°)</div>
        </div>

        {/* Rainfall */}
        <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-2.5 border border-white/5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>Rainfall (24h)</span>
          </div>
          <div className="text-base font-bold text-white">{currentWeather.rainfall} <span className="text-xs font-normal">mm</span></div>
          <div className="text-[10px] text-slate-400 mt-0.5">Prob: {currentWeather.precipitationProbability}%</div>
        </div>

        {/* Pressure */}
        <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-2.5 border border-white/5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pressure</span>
          </div>
          <div className="text-base font-bold text-white">{currentWeather.pressure} <span className="text-xs font-normal">hPa</span></div>
          <div className="text-[10px] text-slate-400 mt-0.5">Barometric</div>
        </div>

        {/* Visibility */}
        <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-2.5 border border-white/5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Visibility</span>
          </div>
          <div className="text-base font-bold text-white">{currentWeather.visibility} <span className="text-xs font-normal">km</span></div>
          <div className="text-[10px] text-slate-400 mt-0.5">{currentWeather.visibility < 4 ? 'Reduced' : 'Good'}</div>
        </div>

        {/* UV Index */}
        <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-2.5 border border-white/5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>UV Index</span>
          </div>
          <div className="text-base font-bold text-white">{currentWeather.uvIndex}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{currentWeather.uvIndex >= 8 ? 'Very High' : 'Moderate'}</div>
        </div>

        {/* Sunrise */}
        <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-2.5 border border-white/5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Sunrise className="w-3.5 h-3.5 text-orange-400" />
            <span>Sunrise</span>
          </div>
          <div className="text-base font-bold text-white">{currentWeather.sunrise}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">AM IST</div>
        </div>

        {/* Sunset */}
        <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-2.5 border border-white/5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Sunset className="w-3.5 h-3.5 text-purple-400" />
            <span>Sunset</span>
          </div>
          <div className="text-base font-bold text-white">{currentWeather.sunset}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">PM IST</div>
        </div>
      </div>

      {/* Source disclaimer */}
      <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Data Source: <strong className="text-slate-300">{currentWeather.source}</strong></span>
        </div>
        <span className="text-slate-500">Official telemetry calibrated for Nagpur talukas</span>
      </div>
    </div>
  );
};
