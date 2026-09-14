import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LineChart,
  BarChart2,
  Calendar,
  Thermometer,
  CloudRain,
  Info,
  Flame,
  CloudLightning,
  Clock,
  Sparkles,
} from 'lucide-react';
import { NAGPUR_CLIMATE_NORMALS } from '../data/nagpurData';

export const ClimateHistoryPage: React.FC = () => {
  const { currentWeather, setIsChatOpen } = useApp();
  const [activeMetric, setActiveMetric] = useState<'rainfall' | 'temperature'>('rainfall');

  const maxRainNorm = Math.max(...NAGPUR_CLIMATE_NORMALS.map((m) => m.avgRainfallMm));
  const maxTempNorm = 45;

  const historicalEvents = [
    {
      year: 'May 2019',
      title: 'Nagpur All-Time Historic Heatwave',
      desc: 'Mercury soared to a record 48.6°C at Sonegaon Observatory, triggering widespread severe heatwave alerts across Vidarbha.',
      icon: Flame,
      color: 'text-rose-500 bg-rose-50 border-rose-200',
    },
    {
      year: 'July 1994',
      title: 'Highest Single-Day 24h Monsoon Deluge',
      desc: 'Nagpur recorded 304.0 mm of precipitation in a single 24-hour observation period, causing extensive riverine swelling along the Nag River basin.',
      icon: CloudRain,
      color: 'text-blue-500 bg-blue-50 border-blue-200',
    },
    {
      year: 'August 2013',
      title: 'Severe Urban Inundation & Cloudburst Episode',
      desc: 'Continuous heavy rainfall exceeding 180 mm led to severe waterlogging across Civil Lines, Dharampeth, and low-lying railway underpasses.',
      icon: CloudLightning,
      color: 'text-indigo-500 bg-indigo-50 border-indigo-200',
    },
    {
      year: 'December 2018',
      title: 'Severe Cold Wave in Vidarbha',
      desc: 'Minimum temperatures dropped sharply to 3.5°C in Nagpur, one of the lowest December minimums on modern IMD records.',
      icon: Thermometer,
      color: 'text-teal-500 bg-teal-50 border-teal-200',
    },
  ];

  return (
    <div id="climate-history-page" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Nagpur District Climatological Normals & Historical Records
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Official 30-Year Baseline (1991–2020) established by India Meteorological Department (IMD)
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveMetric('rainfall')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeMetric === 'rainfall' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-blue-500" />
            <span>Monthly Rainfall (mm)</span>
          </button>
          <button
            onClick={() => setActiveMetric('temperature')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeMetric === 'temperature' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-orange-500" />
            <span>Temperature Ranges (°C)</span>
          </button>
        </div>
      </div>

      {/* Climatological Normals Chart Visualization */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {activeMetric === 'rainfall'
                ? 'Average Monthly Rainfall Normals (Total Annual: ~1,120 mm)'
                : 'Climatological Mean Maximum & Minimum Temperatures'}
            </h3>
            <span className="text-xs text-slate-400">
              Source: IMD National Climate Centre (NCC) Pune
            </span>
          </div>
        </div>

        {/* 12-Month Bar Chart */}
        <div className="grid grid-cols-12 gap-2 items-end h-56 pt-6 pb-2 border-b border-slate-200">
          {NAGPUR_CLIMATE_NORMALS.map((month) => {
            const rainHeightPercent = Math.round((month.avgRainfallMm / maxRainNorm) * 100);
            const tempHeightPercent = Math.round((month.avgMaxTemp / maxTempNorm) * 100);

            return (
              <div key={month.month} className="flex flex-col items-center h-full justify-end group">
                {/* Bar */}
                <div className="w-full max-w-[32px] flex flex-col items-center justify-end h-full relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-9 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap transition-opacity pointer-events-none z-20 shadow-md">
                    {activeMetric === 'rainfall'
                      ? `${month.avgRainfallMm} mm (${month.rainyDays} days)`
                      : `Max: ${month.avgMaxTemp}°C / Min: ${month.avgMinTemp}°C`}
                  </div>

                  {activeMetric === 'rainfall' ? (
                    <div
                      className="w-full bg-blue-500 hover:bg-blue-600 transition-all rounded-t-md relative"
                      style={{ height: `${rainHeightPercent}%` }}
                    >
                      {month.avgRainfallMm > 50 && (
                        <span className="absolute top-1 inset-x-0 text-center text-[10px] text-white font-mono font-bold hidden sm:block">
                          {month.avgRainfallMm.toFixed(0)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div
                      className="w-full bg-gradient-to-t from-amber-400 to-rose-500 hover:opacity-90 transition-all rounded-t-md relative"
                      style={{ height: `${tempHeightPercent}%` }}
                    >
                      <span className="absolute top-1 inset-x-0 text-center text-[10px] text-white font-mono font-bold hidden sm:block">
                        {month.avgMaxTemp.toFixed(0)}°
                      </span>
                    </div>
                  )}
                </div>

                {/* Month Name */}
                <span className="text-[11px] font-bold text-slate-600 mt-2">
                  {month.month.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend & Key Takeaways */}
        <div className="mt-4 pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-500 inline-block" />
              <span>Monsoon Peak: July (334.8 mm) & August (282.4 mm)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
              <span>Summer Peak: May (42.8°C Normal Mean Max)</span>
            </span>
          </div>

          <button
            onClick={() => setIsChatOpen(true)}
            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask WeatherGPT to analyze current anomaly vs normal</span>
          </button>
        </div>
      </div>

      {/* Historical Weather Extremes Grid */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          <span>Historical Extreme Weather Events in Nagpur District</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {historicalEvents.map((evt, idx) => {
            const Icon = evt.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-blue-700 font-mono text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {evt.year}
                  </span>
                  <div className={`p-1.5 rounded-lg border ${evt.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  {evt.title}
                </h4>

                <p className="text-slate-600 leading-relaxed">
                  {evt.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
