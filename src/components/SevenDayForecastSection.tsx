import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CalendarDays,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  CloudLightning,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DailyForecastItem } from '../types';

export const SevenDayForecastSection: React.FC = () => {
  const { dailyForecast, t } = useApp();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (!dailyForecast || dailyForecast.length === 0) return null;

  return (
    <section id="seven-day-forecast-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            7-Day Synoptic Weather Outlook
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Nagpur District • IMD Multi-Model Guidance
        </span>
      </div>

      <div className="space-y-2.5">
        {dailyForecast.map((day, idx) => {
          const isExpanded = expandedDay === day.date;
          const isThunderstorm = day.conditionCode >= 95;
          const hasHeavyRain = day.rainfall > 35;

          return (
            <div
              key={day.date}
              id={`daily-card-${idx}`}
              className={`rounded-xl border transition-all ${
                day.warningSeverity === 'ORANGE'
                  ? 'border-amber-300 bg-amber-50/30'
                  : day.warningSeverity === 'RED'
                  ? 'border-rose-300 bg-rose-50/30'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <button
                type="button"
                onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                {/* Left: Day & Date */}
                <div className="w-28 sm:w-36 shrink-0">
                  <div className="font-bold text-slate-900 text-sm">{day.dayName}</div>
                  <div className="text-[11px] text-slate-400">{day.date}</div>
                </div>

                {/* Weather Condition Icon & Text */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="shrink-0">
                    {isThunderstorm ? (
                      <CloudLightning className="w-5 h-5 text-amber-600 animate-pulse" />
                    ) : day.rainfall > 5 ? (
                      <CloudRain className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Sun className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 truncate hidden sm:inline">
                    {day.condition}
                  </span>
                </div>

                {/* Warning Pill if active */}
                {day.warningSeverity && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    day.warningSeverity === 'RED' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    <AlertTriangle className="w-3 h-3" />
                    <span>{day.warningSeverity} Warning</span>
                  </span>
                )}

                {/* Rain Prob */}
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 w-16 justify-end">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{day.precipitationProbability}%</span>
                </div>

                {/* Temp range min/max */}
                <div className="flex items-center gap-2 w-28 justify-end text-xs font-mono">
                  <span className="font-bold text-slate-900">{day.maxTemp}°</span>
                  <div className="w-10 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-400 to-amber-500 h-full rounded-full w-full" />
                  </div>
                  <span className="text-slate-400 font-medium">{day.minTemp}°</span>
                </div>

                {/* Toggle chevron */}
                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 text-xs text-slate-600 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/60 rounded-b-xl">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Condition</span>
                    <span className="font-semibold text-slate-800">{day.condition}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Rainfall Expected</span>
                    <span className="font-semibold text-blue-700">{day.rainfall} mm ({day.precipitationProbability}% prob)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Max Surface Wind</span>
                    <span className="font-semibold text-slate-800">{day.windSpeedMax} km/h</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Peak UV Index</span>
                    <span className="font-semibold text-amber-700">{day.uvIndexMax}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
