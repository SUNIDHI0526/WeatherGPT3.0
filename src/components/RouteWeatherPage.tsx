import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Navigation,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Car,
  Loader2,
  CloudRain,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { RouteAnalysis } from '../types';

export const RouteWeatherPage: React.FC = () => {
  const { t } = useApp();
  const [fromLoc, setFromLoc] = useState<string>('Nagpur (Civil Lines)');
  const [toLoc, setToLoc] = useState<string>('Umred');
  const [departureTime, setDepartureTime] = useState<string>('14:30');
  const [loading, setLoading] = useState<boolean>(false);
  const [routeResult, setRouteResult] = useState<RouteAnalysis | null>(null);

  const presetCorridors = [
    { from: 'Nagpur (Civil Lines)', to: 'Umred', desc: 'SH-9 / Umred Road (44 km)' },
    { from: 'Nagpur', to: 'Ramtek', desc: 'NH-44 North Corridor (48 km)' },
    { from: 'Hingna MIDC', to: 'Katol', desc: 'Katol State Highway (56 km)' },
    { from: 'Butibori', to: 'Saoner', desc: 'Outer Ring Express Link (62 km)' },
    { from: 'Nagpur', to: 'Kamptee', desc: 'NH-53 East Corridor (18 km)' },
  ];

  const handleAnalyze = async (f = fromLoc, tLoc = toLoc, time = departureTime) => {
    setLoading(true);
    try {
      const res = await fetch('/api/route/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromLocation: f,
          toLocation: tLoc,
          departureTime: time,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRouteResult(data);
      }
    } catch (err) {
      console.error('Failed to analyze route:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (p: { from: string; to: string }) => {
    setFromLoc(p.from);
    setToLoc(p.to);
    handleAnalyze(p.from, p.to, departureTime);
  };

  return (
    <div id="route-weather-page" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Route Weather & Travel Hazard Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Predictive meteorological conditions along Nagpur highway corridors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-50 text-blue-800 font-semibold px-2.5 py-1 rounded-full border border-blue-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Highway Analysis</span>
          </span>
        </div>
      </div>

      {/* Preset Corridor Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Popular Corridors:
        </span>
        {presetCorridors.map((p, idx) => (
          <button
            key={idx}
            id={`preset-corridor-${idx}`}
            onClick={() => selectPreset(p)}
            className="text-xs font-medium bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
          >
            <strong>{p.from}</strong> → <strong>{p.to}</strong>
            <span className="text-[10px] text-slate-400 ml-1.5">({p.desc.split('(')[1]?.replace(')', '')})</span>
          </button>
        ))}
      </div>

      {/* Route Query Form */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-4"
        >
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Departure Point
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                id="route-from-input"
                value={fromLoc}
                onChange={(e) => setFromLoc(e.target.value)}
                placeholder="e.g. Nagpur Civil Lines"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Destination
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-blue-600 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                id="route-to-input"
                value={toLoc}
                onChange={(e) => setToLoc(e.target.value)}
                placeholder="e.g. Umred or Ramtek"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Departure Time (IST)
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="time"
                id="route-time-input"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              id="analyze-route-btn"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Corridor...</span>
                </>
              ) : (
                <>
                  <Car className="w-4 h-4" />
                  <span>Analyze Highway Weather</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results Display */}
      {routeResult && (
        <div className="space-y-6">
          {/* Top Summary Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-600 text-white">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{routeResult.from}</span>
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                    <span>{routeResult.to}</span>
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Estimated Transit: {routeResult.estimatedDuration} • Highway Corridor
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Transit Risk Level</span>
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full uppercase ${
                    routeResult.travelRiskLevel === 'HIGH'
                      ? 'bg-rose-600 text-white'
                      : routeResult.travelRiskLevel === 'MODERATE'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {routeResult.travelRiskLevel} RISK
                  </span>
                </div>
              </div>
            </div>

            {/* AI Travel Recommendation */}
            <div className="py-4 text-xs text-slate-300 leading-relaxed">
              <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>WeatherGPT Highway Advisory</span>
              </div>
              <p>{routeResult.advisory}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-blue-200">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span><strong>Recommended Departure Window:</strong> {routeResult.recommendedDepartureWindow}</span>
              </div>
            </div>
          </div>

          {/* Segment Waypoints Breakdown */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Corridor Waypoint Meteorological Breakdown</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {routeResult.segments.map((seg, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-slate-900 text-sm">{seg.waypoint}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        seg.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {seg.riskLevel}
                      </span>
                    </div>

                    <div className="text-xl font-black text-slate-900 mb-1">
                      {seg.temperature}°C
                    </div>

                    <div className="text-slate-600 font-semibold mb-2">
                      {seg.condition}
                    </div>

                    <div className="space-y-1 text-slate-500 text-[11px] pt-2 border-t border-slate-200">
                      <div>Rain Probability: <strong className="text-blue-600">{seg.rainProbability}%</strong></div>
                      <div>Surface Wind: <strong className="text-slate-700">{seg.windSpeed} km/h</strong></div>
                      <div>Visibility: <strong className="text-slate-700">{seg.visibility} km</strong></div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 italic">
                    {seg.hazardNote}
                  </div>
                </div>
              ))}
            </div>

            {/* Travel Safety Checklist */}
            <div className="mt-5 p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950">
              <div className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Nagpur Highway Precautions & Safety Tips</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-900">
                {routeResult.safetyTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
