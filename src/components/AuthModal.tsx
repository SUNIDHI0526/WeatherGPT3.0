import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  User,
  Wheat,
  GraduationCap,
  HardHat,
  Car,
  Shield,
  Users,
  Search,
  Check,
  Globe,
  Sparkles,
  Phone,
} from 'lucide-react';
import { UserRole, AppLanguage } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    userName,
    setUserName,
    userRole,
    setUserRole,
    language,
    setLanguage,
    phoneNumber,
    setPhoneNumber,
  } = useApp();

  const [tempName, setTempName] = useState<string>(userName);
  const [tempPhone, setTempPhone] = useState<string>(phoneNumber);
  const [tempRole, setTempRole] = useState<UserRole>(userRole);
  const [tempLang, setTempLang] = useState<AppLanguage>(language);

  if (!isAuthModalOpen) return null;

  const roleOptions: { id: UserRole; title: string; desc: string; icon: any }[] = [
    {
      id: 'farmer',
      title: 'Farmer (शेतकरी)',
      desc: 'Cotton, soyabean & orange crop advisories, irrigation & pesticide spraying alerts',
      icon: Wheat,
    },
    {
      id: 'outdoor_worker',
      title: 'Outdoor Worker / Laborer',
      desc: 'Heatwave avoidance hours, wet-bulb thresholds & lightning shelter precautions',
      icon: HardHat,
    },
    {
      id: 'student',
      title: 'Student (विद्यार्थी)',
      desc: 'School/college commute safety, rain gear alerts & exam day weather',
      icon: GraduationCap,
    },
    {
      id: 'traveller',
      title: 'Traveller / Commuter',
      desc: 'Highway visibility, flooded culvert alerts & safe departure time guidance',
      icon: Car,
    },
    {
      id: 'disaster_manager',
      title: 'Disaster Management Officer',
      desc: 'Taluka vulnerability index, emergency response & population risk telemetry',
      icon: Shield,
    },
    {
      id: 'general_public',
      title: 'General Resident',
      desc: 'Daily forecasts, clothing suggestions, UV exposure & household safety',
      icon: Users,
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(tempName.trim() || 'Resident');
    setPhoneNumber(tempPhone.trim() || '+91 98230 12345');
    setUserRole(tempRole);
    setLanguage(tempLang);
    setIsAuthModalOpen(false);
  };

  return (
    <div
      id="auth-profile-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                WeatherGPT User Profile & Role Setup
              </h3>
              <p className="text-xs text-slate-500">
                Tailors all AI meteorological reasoning to your specific persona in Nagpur
              </p>
            </div>
          </div>

          <button
            id="close-auth-modal-btn"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Full Name or Call-Sign
            </label>
            <input
              type="text"
              id="auth-input-name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="e.g. Ramesh Patil or Dr. Sunidhi"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Mobile Number (Optional SMS simulation)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="tel"
                id="auth-input-phone"
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                placeholder="+91 98230 12345"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Primary Language for Voice & Chat
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'हिंदी (Hindi)' },
                { id: 'mr', label: 'मराठी (Marathi)' },
                { id: 'hinglish', label: 'Hinglish' },
              ].map((l) => (
                <button
                  type="button"
                  key={l.id}
                  id={`auth-lang-${l.id}`}
                  onClick={() => setTempLang(l.id as AppLanguage)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    tempLang === l.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Role Cards */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Select Your Role Profile:
            </label>
            <div className="space-y-2">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                const isSelected = tempRole === role.id;

                return (
                  <button
                    type="button"
                    key={role.id}
                    id={`auth-role-opt-${role.id}`}
                    onClick={() => setTempRole(role.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 ring-1 ring-blue-600'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{role.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{role.desc}</div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Save */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="auth-submit-btn"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Profile Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
