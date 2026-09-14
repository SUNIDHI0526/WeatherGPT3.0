import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  Map as MapIcon,
  Navigation as NavigationIcon,
  AlertTriangle,
  FileText,
  LineChart,
  MessageSquareShare,
  UserCheck,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, alerts, t } = useApp();

  const hasWarning = alerts.length > 0 && alerts[0].severity !== 'GREEN';

  const navItems = [
    { id: 'dashboard', label: t('currentWeather') || 'Dashboard', icon: LayoutDashboard },
    { id: 'forecast', label: t('sevenDayForecast') || 'Forecast', icon: CalendarDays },
    { id: 'map', label: t('weatherMap') || 'Weather Map', icon: MapIcon },
    { id: 'routes', label: t('routeWeather') || 'Route Weather', icon: NavigationIcon },
    { id: 'alerts', label: t('activeAlerts') || 'Alerts', icon: AlertTriangle, badge: hasWarning ? '1' : null },
    { id: 'advisory', label: t('advisory') || 'Advisory', icon: FileText },
    { id: 'climate', label: t('climateHistory') || 'Climate', icon: LineChart },
    { id: 'sms', label: t('smsAlerts') || 'SMS Alerts', icon: MessageSquareShare },
    { id: 'profile', label: t('profile') || 'Profile', icon: UserCheck },
  ];

  return (
    <>
      {/* Desktop Navigation Tabs */}
      <nav id="desktop-nav" aria-label="Desktop primary navigation" className="hidden md:block bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex space-x-1 overflow-x-auto py-1.5 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav id="mobile-nav" aria-label="Mobile primary navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5">
        <div className="flex items-center justify-around">
          {[
            { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
            { id: 'forecast', label: 'Forecast', icon: CalendarDays },
            { id: 'map', label: 'Map', icon: MapIcon },
            { id: 'routes', label: 'Routes', icon: NavigationIcon },
            { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: hasWarning ? '!' : null },
            { id: 'sms', label: 'SMS', icon: MessageSquareShare },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 stroke-[2.5]' : 'text-slate-500'}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 px-1 rounded-full text-[9px] font-extrabold bg-rose-600 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
