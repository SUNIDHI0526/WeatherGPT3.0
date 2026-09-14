import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wheat,
  HardHat,
  Car,
  GraduationCap,
  Shield,
  Users,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { UserRole } from '../types';

export const PersonalizedAdvisoryPage: React.FC = () => {
  const { userRole, setUserRole, currentWeather, t } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>(userRole);
  const [loading, setLoading] = useState<boolean>(true);
  const [advisoryData, setAdvisoryData] = useState<{
    role: string;
    headline: string;
    summary: string;
    actionPoints: string[];
    dos: string[];
    donts: string[];
  } | null>(null);

  const rolesList: { id: UserRole; label: string; icon: any; color: string }[] = [
    { id: 'farmer', label: 'Farmer (शेतकरी)', icon: Wheat, color: 'text-emerald-600' },
    { id: 'outdoor_worker', label: 'Outdoor Worker', icon: HardHat, color: 'text-amber-600' },
    { id: 'traveller', label: 'Traveller / Commuter', icon: Car, color: 'text-blue-600' },
    { id: 'student', label: 'Student (विद्यार्थी)', icon: GraduationCap, color: 'text-indigo-600' },
    { id: 'disaster_manager', label: 'Disaster Manager', icon: Shield, color: 'text-rose-600' },
    { id: 'general_public', label: 'General Public', icon: Users, color: 'text-slate-600' },
  ];

  const fetchAdvisory = async (role = selectedRole) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/advisory?role=${role}`);
      if (res.ok) {
        const data = await res.json();
        setAdvisoryData(data);
      }
    } catch (e) {
      console.error('Failed to load advisory:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisory(selectedRole);
  }, [selectedRole]);

  return (
    <div id="personalized-advisory-page" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Role-Specific Meteorological Advisory
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Actionable intelligence for agriculture, outdoor labour, transit, and emergency response in Nagpur
          </p>
        </div>

        <button
          onClick={() => fetchAdvisory(selectedRole)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Regenerate Guidance</span>
        </button>
      </div>

      {/* Role Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {rolesList.map((r) => {
          const Icon = r.icon;
          const isSelected = selectedRole === r.id;
          return (
            <button
              key={r.id}
              id={`role-btn-${r.id}`}
              onClick={() => {
                setSelectedRole(r.id);
                setUserRole(r.id);
              }}
              className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-white' : r.color}`} />
              <span className="text-xs">{r.label}</span>
            </button>
          );
        })}
      </div>

      {/* Advisory Content Card */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">Compiling Role Advisory...</h4>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing current Nagpur temperature, precipitation probability, and wind shear
          </p>
        </div>
      ) : advisoryData ? (
        <div className="space-y-6">
          {/* Main Headline & Summary */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Grounded Action Plan for {selectedRole.replace('_', ' ').toUpperCase()}</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">
              {advisoryData.headline}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {advisoryData.summary}
            </p>

            {/* Core Action Points */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
              <span className="text-xs font-bold text-blue-900 block mb-2">
                Operational Recommendations:
              </span>
              <div className="space-y-2">
                {advisoryData.actionPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-blue-950">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Do's and Don'ts Split Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Do's */}
            <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Recommended Do's</span>
              </div>
              <ul className="space-y-2 text-xs text-emerald-950">
                {advisoryData.dos.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Don'ts */}
            <div className="bg-rose-50/60 rounded-2xl p-5 border border-rose-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-rose-800 font-bold text-sm">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Critical Don'ts</span>
              </div>
              <ul className="space-y-2 text-xs text-rose-950">
                {advisoryData.donts.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
