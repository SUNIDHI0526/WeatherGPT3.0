import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Flame,
  CloudRain,
  Wind,
  Shield,
  Layers,
} from 'lucide-react';

export const RiskAndConfidenceSection: React.FC = () => {
  const { riskData, confidenceData, currentWeather, t } = useApp();

  if (!riskData || !confidenceData) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'VERY HIGH':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          badge: 'bg-rose-600 text-white',
          bar: 'bg-rose-600',
          ring: 'ring-rose-500',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          badge: 'bg-orange-600 text-white',
          bar: 'bg-orange-500',
          ring: 'ring-orange-500',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          badge: 'bg-amber-600 text-white',
          bar: 'bg-amber-500',
          ring: 'ring-amber-500',
        };
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          badge: 'bg-emerald-600 text-white',
          bar: 'bg-emerald-500',
          ring: 'ring-emerald-500',
        };
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return { badge: 'bg-emerald-600 text-white', bar: 'bg-emerald-500' };
      case 'MODERATE':
        return { badge: 'bg-blue-600 text-white', bar: 'bg-blue-500' };
      default:
        return { badge: 'bg-amber-600 text-white', bar: 'bg-amber-500' };
    }
  };

  const riskColors = getRiskColor(riskData.level);
  const confColors = getConfidenceColor(confidenceData.level);

  return (
    <div id="risk-confidence-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* WeatherGPT Local Risk Index Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  WeatherGPT Local Risk Index
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                AI-derived composite meteorological hazard indicator for Nagpur District
              </p>
            </div>

            <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${riskColors.badge}`}>
              {riskData.level} ({riskData.score}/100)
            </div>
          </div>

          {/* Meter progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
              <span>0 (Low)</span>
              <span>25 (Moderate)</span>
              <span>50 (High)</span>
              <span>75 (Very High)</span>
              <span>100</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 flex gap-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-700 ${riskColors.bar}`}
                style={{ width: `${riskData.score}%` }}
              />
            </div>
          </div>

          {/* Summary Box */}
          <div className={`p-3.5 rounded-xl border text-xs font-medium mb-4 ${riskColors.bg}`}>
            <strong>Impact Assessment:</strong> {riskData.summary}
          </div>

          {/* Factor Breakdown */}
          <div className="space-y-2.5 mb-4">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Underlying Risk Factor Weightings
            </div>
            {riskData.factors.map((factor, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-800 mb-0.5">
                  <span className="flex items-center gap-1.5">
                    {factor.name.includes('Thermal') && <Flame className="w-3.5 h-3.5 text-orange-500" />}
                    {factor.name.includes('Precipitation') && <CloudRain className="w-3.5 h-3.5 text-blue-500" />}
                    {factor.name.includes('Wind') && <Wind className="w-3.5 h-3.5 text-teal-500" />}
                    {factor.name.includes('Warning') && <Shield className="w-3.5 h-3.5 text-rose-500" />}
                    {factor.name.includes('Visibility') && <Layers className="w-3.5 h-3.5 text-purple-500" />}
                    <span>{factor.name}</span>
                  </span>
                  <span className="text-slate-600 font-mono font-bold">
                    {factor.score}/100 <span className="text-slate-400 text-[10px]">({Math.round(factor.weight * 100)}% wt)</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{factor.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Safety Notice */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            <strong>Important:</strong> This is an algorithmic WeatherGPT indicator; it is <em>never</em> an official IMD risk score. Refer to the Official Alerts section for government declarations.
          </span>
        </div>
      </div>

      {/* Forecast Confidence Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Forecast Confidence Engine
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Consensus stability among multi-agency meteorological models
              </p>
            </div>

            <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${confColors.badge}`}>
              {confidenceData.level} ({confidenceData.score}%)
            </div>
          </div>

          {/* Meter progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
              <span>0% Low</span>
              <span>40% Moderate</span>
              <span>70% High</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 flex gap-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-700 ${confColors.bar}`}
                style={{ width: `${confidenceData.score}%` }}
              />
            </div>
          </div>

          {/* Explanation Box */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 mb-4">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Model Agreement Analysis</span>
            </div>
            <p className="leading-relaxed">{confidenceData.explanation}</p>
          </div>

          {/* Consensus Sources */}
          <div className="mb-4">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Telemetry & Ensemble Feeds Compared
            </div>
            <div className="space-y-2">
              {confidenceData.consensusSources.map((source, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-700 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-medium">{source}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Variance Notes */}
          <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs text-blue-900">
            <strong>Spread & Variance:</strong> {confidenceData.varianceNotes}
          </div>
        </div>

        {/* Confidence transparency notice */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Evaluated using convective stability indices and lead-time dispersion. Not a replacement for official IMD forecasts.
          </span>
        </div>
      </div>
    </div>
  );
};
