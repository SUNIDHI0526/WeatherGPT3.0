import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardQuickActions } from './components/DashboardQuickActions';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { RiskAndConfidenceSection } from './components/RiskAndConfidenceSection';
import { HourlyForecastSection } from './components/HourlyForecastSection';
import { SevenDayForecastSection } from './components/SevenDayForecastSection';
import { AlertsSection } from './components/AlertsSection';
import { WeatherMapPage } from './components/WeatherMapPage';
import { RouteWeatherPage } from './components/RouteWeatherPage';
import { PersonalizedAdvisoryPage } from './components/PersonalizedAdvisoryPage';
import { ClimateHistoryPage } from './components/ClimateHistoryPage';
import { SmsAlertsPage } from './components/SmsAlertsPage';
import { ProfileSettingsPage } from './components/ProfileSettingsPage';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { AuthModal } from './components/AuthModal';
import { ExplainAlertModal } from './components/ExplainAlertModal';
import { ShieldCheck, Info, PhoneCall } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    selectedAlertForExplanation,
    setSelectedAlertForExplanation,
    isAuthModalOpen,
  } = useApp();

  const [hasCompletedSplash, setHasCompletedSplash] = useState<boolean>(() => {
    // Avoid showing splash screen over and over during short refreshes
    return sessionStorage.getItem('wgpt_splash_seen') === 'true';
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem('wgpt_splash_seen', 'true');
    setHasCompletedSplash(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-20 md:pb-8">
      {/* Intro Splash Screen */}
      {!hasCompletedSplash && <SplashScreen onComplete={handleSplashFinish} />}

      {/* Main App Bar */}
      <Header />

      {/* Navigation Sub-header / Tabs */}
      <Navigation />

      {/* Main Content Body */}
      <main id="main-content-viewport" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5">
        {activeTab === 'dashboard' && (
          <div>
            <DashboardQuickActions />
            <CurrentWeatherCard />
            <RiskAndConfidenceSection />
            <HourlyForecastSection />
            <SevenDayForecastSection />
            <AlertsSection />
          </div>
        )}

        {activeTab === 'forecast' && (
          <div className="space-y-6">
            <HourlyForecastSection />
            <SevenDayForecastSection />
            <RiskAndConfidenceSection />
          </div>
        )}

        {activeTab === 'map' && <WeatherMapPage />}

        {activeTab === 'routes' && <RouteWeatherPage />}

        {activeTab === 'alerts' && <AlertsSection />}

        {activeTab === 'advisory' && <PersonalizedAdvisoryPage />}

        {activeTab === 'climate' && <ClimateHistoryPage />}

        {activeTab === 'sms' && <SmsAlertsPage />}

        {activeTab === 'profile' && <ProfileSettingsPage />}
      </main>

      {/* Official Government & Platform Footer */}
      <footer id="app-footer" className="mt-12 bg-slate-900 text-slate-300 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>WeatherGPT • Nagpur Climate Intelligence</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Developed for Smart India Hackathon 2026 under Problem Statement PS ID 26068 (Ministry of Earth Sciences / India Meteorological Department).
              </p>
            </div>

            <div>
              <div className="text-white font-bold text-xs uppercase tracking-wider mb-2">
                Official Sources & Attribution
              </div>
              <ul className="space-y-1 text-slate-400 text-xs">
                <li>• India Meteorological Department (IMD) - RMC Sonegaon, Nagpur</li>
                <li>• IMD 30-Year Climatological Normals (1991–2020)</li>
                <li>• Open-Meteo High-Resolution Global Numerical Weather Feeds</li>
                <li>• Google Gemini 3.8 Flash Meteorologic Tool Orchestrator</li>
              </ul>
            </div>

            <div>
              <div className="text-white font-bold text-xs uppercase tracking-wider mb-2">
                District Emergency Helplines
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                  <span>Nagpur District Disaster Control Room: <strong>1077</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                  <span>National Emergency Police / Ambulance: <strong>112</strong></span>
                </div>
                <div className="text-slate-400 text-[11px] mt-2">
                  WeatherGPT Local Risk index is an AI analytical indicator; always follow directives from the District Collector and IMD during severe weather emergencies.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>© 2026 WeatherGPT • SIH 2026 PS ID: 26068 • Nagpur District, Maharashtra</span>
            <span>Vidarbha Meteorological Surveillance Grid</span>
          </div>
        </div>
      </footer>

      {/* Floating Chatbot Assistant */}
      <ChatbotDrawer />

      {/* Modals */}
      {isAuthModalOpen && <AuthModal />}
      {selectedAlertForExplanation && (
        <ExplainAlertModal
          alert={selectedAlertForExplanation}
          onClose={() => setSelectedAlertForExplanation(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
