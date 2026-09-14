import React from 'react';
import { useApp } from '../context/AppContext';
import {
  UserCheck,
  Globe,
  Volume2,
  Bell,
  Thermometer,
  Shield,
  Info,
  ExternalLink,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { UserRole, AppLanguage } from '../types';

export const ProfileSettingsPage: React.FC = () => {
  const {
    userName,
    setUserName,
    userRole,
    setUserRole,
    language,
    setLanguage,
    phoneNumber,
    setPhoneNumber,
    autoVoiceReplies,
    setAutoVoiceReplies,
    unitSystem,
    setUnitSystem,
    t,
  } = useApp();

  const roles = [
    { id: 'farmer', label: 'Farmer (शेतकरी)' },
    { id: 'student', label: 'Student (विद्यार्थी)' },
    { id: 'outdoor_worker', label: 'Outdoor Worker / Laborer' },
    { id: 'traveller', label: 'Traveller / Commuter' },
    { id: 'disaster_manager', label: 'Disaster & Emergency Officer' },
    { id: 'researcher', label: 'Researcher / Agronomist' },
    { id: 'general_public', label: 'General Resident' },
  ];

  return (
    <div id="profile-settings-page" className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Profile, Voice & Operational Preferences
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalize your role-based advisories, voice playback, and alert dispatch parameters
          </p>
        </div>
      </div>

      {/* Main Settings Form Grid */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
        {/* User Identity & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-6 border-b border-slate-200">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Your Name / Designation
            </label>
            <input
              type="text"
              id="profile-name-input"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
              User Profile Role (Shapes AI Guidance)
            </label>
            <select
              id="profile-role-select"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Preferred Language
            </label>
            <select
              id="profile-lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="hinglish">Hinglish (Colloquial Hindi-English)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Cellular Number (for SMS Broadcasts)
            </label>
            <input
              type="tel"
              id="profile-phone-input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Voice & Assistant Settings */}
        <div className="pb-6 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span>Voice Assistant & Accessibility</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Automatic Audio Readout
                </span>
                <span className="text-[11px] text-slate-500">
                  Automatically read aloud AI answers using native speech synthesis in chosen language
                </span>
              </div>
              <input
                type="checkbox"
                id="auto-voice-toggle"
                checked={autoVoiceReplies}
                onChange={(e) => setAutoVoiceReplies(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 border-slate-300"
              />
            </label>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Temperature Units
                </span>
                <span className="text-[11px] text-slate-500">
                  Select Celsius (°C) for standard meteorological baseline or Fahrenheit (°F)
                </span>
              </div>
              <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setUnitSystem('metric')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    unitSystem === 'metric' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  °C (Celsius)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitSystem('imperial')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    unitSystem === 'imperial' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  °F (Fahrenheit)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hackathon & Platform Metadata */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Smart India Hackathon 2026 Project Governance</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span className="font-mono text-blue-300 font-bold">PS ID: 26068</span>
              <span className="text-slate-400">Ministry of Earth Sciences (MoES)</span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              <strong>WeatherGPT</strong> is built as an end-to-end conversational climate intelligence platform for <strong>Nagpur District, Maharashtra</strong>, combining multi-agency weather observation with Gemini 3.8 Flash tool-calling, local risk indexing, and cell-broadcast SMS simulation.
            </p>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500">Telemetry Engine: </span>
                <strong className="text-slate-300">Open-Meteo & IMD Normals</strong>
              </div>
              <div>
                <span className="text-slate-500">AI Reasoning: </span>
                <strong className="text-slate-300">Google Gemini 3.8 Flash (Server-Side)</strong>
              </div>
              <div>
                <span className="text-slate-500">District Center: </span>
                <strong className="text-slate-300">RMC Sonegaon (21.14°N, 79.08°E)</strong>
              </div>
              <div>
                <span className="text-slate-500">Talukas Monitored: </span>
                <strong className="text-slate-300">14 Administrative Blocks</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
