import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Building,
} from 'lucide-react';
import { AlertPhase, WeatherAlert } from '../types';

export const AlertsSection: React.FC = () => {
  const { alerts, setSelectedAlertForExplanation, t } = useApp();
  const [activePhase, setActivePhase] = useState<AlertPhase>('DURING');

  const filteredAlerts = alerts.filter(a => a.phase === activePhase || alerts.length === 1);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'RED':
        return {
          border: 'border-rose-300 bg-rose-50/50',
          badge: 'bg-rose-600 text-white',
          banner: 'bg-rose-100 text-rose-900 border-rose-200',
          tag: 'RED WARNING (TAKE ACTION)',
        };
      case 'ORANGE':
        return {
          border: 'border-amber-300 bg-amber-50/50',
          badge: 'bg-orange-600 text-white',
          banner: 'bg-amber-100 text-amber-900 border-amber-200',
          tag: 'ORANGE ALERT (BE PREPARED)',
        };
      case 'YELLOW':
        return {
          border: 'border-yellow-300 bg-yellow-50/50',
          badge: 'bg-amber-500 text-white',
          banner: 'bg-yellow-100 text-yellow-900 border-yellow-200',
          tag: 'YELLOW WATCH (BE UPDATED)',
        };
      default:
        return {
          border: 'border-emerald-300 bg-emerald-50/50',
          badge: 'bg-emerald-600 text-white',
          banner: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          tag: 'GREEN (NO ACTIVE WARNING)',
        };
    }
  };

  return (
    <section id="alerts-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Official Meteorological Warnings & Early Warnings
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Issued by India Meteorological Department (IMD) for Nagpur District
          </p>
        </div>

        {/* Official Source Banner */}
        <div className="bg-slate-900 text-white text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
          <Building className="w-3.5 h-3.5 text-amber-400" />
          <span>OFFICIAL SOURCE: IMD RMC NAGPUR</span>
        </div>
      </div>

      {/* Alert Lifecycle Tabs: BEFORE, DURING, AFTER */}
      <div className="flex border-b border-slate-200 mb-5">
        {[
          { id: 'BEFORE', label: '1. BEFORE (Prepare)' },
          { id: 'DURING', label: '2. DURING (Active Actions)' },
          { id: 'AFTER', label: '3. AFTER (Recovery & All-Clear)' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`tab-phase-${tab.id}`}
            onClick={() => setActivePhase(tab.id as AlertPhase)}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activePhase === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Warnings List */}
      {alerts.length === 0 ? (
        <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-200">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h4 className="font-bold text-emerald-900 text-sm">No Active Severe Weather Warnings</h4>
          <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
            Conditions across all 14 talukas of Nagpur District remain under normal seasonal baseline.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const style = getSeverityBadge(alert.severity);

            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                className={`rounded-2xl p-5 border-2 transition-all shadow-xs ${style.border}`}
              >
                {/* Top Row: Severity Tag & Official Source Label */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wide ${style.badge}`}>
                      {style.tag}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      Phase: <strong className="text-blue-700 uppercase">{alert.phase}</strong>
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-slate-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-300">
                    OFFICIAL SOURCE: {alert.source}
                  </span>
                </div>

                {/* Alert Title & Affected Area */}
                <h4 className="text-lg font-bold text-slate-900 mb-1">
                  {alert.title}
                </h4>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-3">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Area: <strong>{alert.affectedArea}</strong></span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Active: <strong>{alert.startTime} – {alert.endTime}</strong></span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-400">
                    Issued: {alert.issuedTime}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-700 leading-relaxed mb-3 bg-white/70 p-3 rounded-xl border border-slate-200/60">
                  {alert.description}
                </p>

                {/* Recommended Action */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-300/40 text-xs text-amber-950 mb-4">
                  <strong className="text-amber-900 block font-bold mb-0.5">
                    Recommended Public Action:
                  </strong>
                  {alert.recommendedAction}
                </div>

                {/* Mandatory Safety Instructions */}
                {alert.instructions && alert.instructions.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Official Safety Checkpoints:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                      {alert.instructions.map((inst, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Major Differentiating Feature: "Explain this alert" Button */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-3">
                  <button
                    id={`explain-alert-${alert.id}`}
                    onClick={() => setSelectedAlertForExplanation(alert)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer hover:shadow-md"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Explain this Alert with WeatherGPT AI</span>
                  </button>

                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Disaster Helpline: <strong>1077 / 112</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
