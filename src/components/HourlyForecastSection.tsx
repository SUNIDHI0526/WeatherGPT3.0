import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  CloudLightning,
  ChevronRight,
  Info,
} from 'lucide-react';
import { HourlyForecastItem } from '../types';

export const HourlyForecastSection: React.FC = () => {
  const { hourlyForecast, t } = useApp();
  const [selectedHour, setSelectedHour] = useState<HourlyForecastItem | null>(null);

  if (!hourlyForecast || hourlyForecast.length === 0) return null;

  return (
    <section id="hourly-forecast-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Hourly Meteorological Forecast
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Next 24 Hours • Scroll horizontally or tap an hour
        </span>
      </div>

      {/* Horizontal Strip */}
      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-200">
        {hourlyForecast.map((item, idx) => {
          const isSelected = selectedHour?.time === item.time || (!selectedHour && idx === 0);
          const hasRain = item.precipitationProbability >= 40 || item.rainfall > 0;
          const isExtremeTemp = item.temperature >= 40;

          return (
            <button
              key={idx}
              id={`hour-card-${idx}`}
              onClick={() => setSelectedHour(item)}
              className={`shrink-0 flex flex-col items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer min-w-[105px] ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500'
                  : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {/* Time */}
              <span className={`text-xs font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                {item.time}
              </span>

              {/* Weather Icon */}
              <div className="my-2.5">
                {item.conditionCode >= 95 ? (
                  <CloudLightning className="w-6 h-6 text-amber-500 animate-pulse" />
                ) : hasRain ? (
                  <CloudRain className="w-6 h-6 text-blue-500" />
                ) : isExtremeTemp ? (
                  <Sun className="w-6 h-6 text-rose-500" />
                ) : (
                  <Sun className="w-6 h-6 text-amber-500" />
                )}
              </div>

              {/* Temp */}
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                {item.temperature}°C
              </span>

              {/* Rain prob pill */}
              <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-full">
                <Droplets className="w-3 h-3" />
                <span>{item.precipitationProbability}%</span>
              </div>

              {/* Rain mm if any */}
              {item.rainfall > 0 && (
                <span className="text-[10px] text-slate-500 mt-1 font-mono">
                  {item.rainfall} mm
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail card for selected hour */}
      {selectedHour && (
        <div className="mt-4 p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 text-xs text-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white font-bold">
              {selectedHour.time}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">{selectedHour.condition}</div>
              <div className="text-slate-500 text-[11px]">
                Feels like {selectedHour.feelsLike}°C • Humidity: {selectedHour.humidity}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-slate-500" />
              <span>Wind: <strong>{selectedHour.windSpeed} km/h {selectedHour.windDirectionText}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>Precipitation: <strong>{selectedHour.rainfall} mm ({selectedHour.precipitationProbability}%)</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>UV Index: <strong>{selectedHour.uvIndex}</strong></span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
