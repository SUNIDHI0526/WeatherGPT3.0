import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  AlertTriangle,
  Map,
  Navigation,
  FileText,
  BarChart3,
  Mic,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const DashboardQuickActions: React.FC = () => {
  const { setActiveTab, setIsChatOpen, alerts, t } = useApp();

  const hasWarning = alerts.length > 0 && alerts[0].severity !== 'GREEN';

  const actions = [
    {
      id: 'forecast',
      label: 'Hourly Forecast',
      subtext: '24h timeline',
      icon: Clock,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      action: () => setActiveTab('forecast'),
    },
    {
      id: 'alerts',
      label: 'Active Warnings',
      subtext: hasWarning ? `${alerts[0].severity} Active` : 'All Clear',
      icon: AlertTriangle,
      color: hasWarning
        ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 ring-1 ring-amber-300'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      action: () => setActiveTab('alerts'),
    },
    {
      id: 'map',
      label: 'Weather Map',
      subtext: 'Nagpur Talukas',
      icon: Map,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
      action: () => setActiveTab('map'),
    },
    {
      id: 'routes',
      label: 'Route Weather',
      subtext: 'Travel planner',
      icon: Navigation,
      color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
      action: () => setActiveTab('routes'),
    },
    {
      id: 'advisory',
      label: 'Role Advisory',
      subtext: 'Tailored for you',
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
      action: () => setActiveTab('advisory'),
    },
    {
      id: 'climate',
      label: 'Climate & Normals',
      subtext: 'IMD 30yr trends',
      icon: BarChart3,
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      action: () => setActiveTab('climate'),
    },
    {
      id: 'voice',
      label: 'Ask by Voice',
      subtext: 'Hindi / Marathi / EN',
      icon: Mic,
      color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
      action: () => setIsChatOpen(true),
    },
    {
      id: 'chat',
      label: 'Ask WeatherGPT',
      subtext: 'AI reasoning engine',
      icon: MessageSquare,
      color: 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800',
      action: () => setIsChatOpen(true),
    },
  ];

  return (
    <section id="quick-actions-section" className="mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Quick Actions & Intelligence Modules</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              id={`quick-act-${act.id}`}
              onClick={act.action}
              className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left cursor-pointer shadow-xs ${act.color}`}
            >
              <Icon className="w-5 h-5 mb-1.5 shrink-0" />
              <div className="font-bold text-xs tracking-tight">{act.label}</div>
              <div className="text-[10px] opacity-80 mt-0.5 truncate w-full">{act.subtext}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
