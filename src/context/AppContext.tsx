import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  WeatherAlert,
  RiskIndexData,
  ConfidenceData,
  TalukaStation,
  UserRole,
  AppLanguage,
} from '../types';
import { UI_TRANSLATIONS } from '../data/nagpurData';

interface AppContextType {
  userName: string;
  setUserName: (name: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  autoVoiceReplies: boolean;
  setAutoVoiceReplies: (val: boolean) => void;
  unitSystem: 'metric' | 'imperial';
  setUnitSystem: (u: 'metric' | 'imperial') => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Weather state
  currentWeather: CurrentWeather | null;
  hourlyForecast: HourlyForecastItem[];
  dailyForecast: DailyForecastItem[];
  alerts: WeatherAlert[];
  riskData: RiskIndexData | null;
  confidenceData: ConfidenceData | null;
  talukaStations: TalukaStation[];
  isLoading: boolean;
  lastUpdatedTime: string;
  refreshWeatherData: () => Promise<void>;

  // Demo mode
  demoScenario: string;
  setDemoScenario: (sc: string) => Promise<void>;

  // Modals
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (val: boolean) => void;
  selectedAlertForExplanation: WeatherAlert | null;
  setSelectedAlertForExplanation: (alert: WeatherAlert | null) => void;
  isChatOpen: boolean;
  setIsChatOpen: (val: boolean) => void;

  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('wgpt_user_name') || 'Dr. Sunidhi');
  const [userRole, setUserRole] = useState<UserRole>(() => (localStorage.getItem('wgpt_user_role') as UserRole) || 'farmer');
  const [language, setLanguage] = useState<AppLanguage>(() => (localStorage.getItem('wgpt_lang') as AppLanguage) || 'en');
  const [phoneNumber, setPhoneNumber] = useState<string>(() => localStorage.getItem('wgpt_phone') || '+91 98230 12345');
  const [autoVoiceReplies, setAutoVoiceReplies] = useState<boolean>(() => localStorage.getItem('wgpt_auto_voice') === 'true');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [demoScenario, setDemoScenarioState] = useState<string>('monsoon_thunderstorm');

  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastItem[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [riskData, setRiskData] = useState<RiskIndexData | null>(null);
  const [confidenceData, setConfidenceData] = useState<ConfidenceData | null>(null);
  const [talukaStations, setTalukaStations] = useState<TalukaStation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [selectedAlertForExplanation, setSelectedAlertForExplanation] = useState<WeatherAlert | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Sync profile to localStorage
  useEffect(() => {
    localStorage.setItem('wgpt_user_name', userName);
    localStorage.setItem('wgpt_user_role', userRole);
    localStorage.setItem('wgpt_lang', language);
    localStorage.setItem('wgpt_phone', phoneNumber);
    localStorage.setItem('wgpt_auto_voice', String(autoVoiceReplies));
  }, [userName, userRole, language, phoneNumber, autoVoiceReplies]);

  // Translation helper
  const t = (key: string): string => {
    const langDict = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
    return langDict[key] || UI_TRANSLATIONS.en[key] || key;
  };

  const fetchAllWeatherData = async () => {
    setIsLoading(true);
    try {
      const [currRes, hourlyRes, dailyRes, alertsRes, riskRes, confRes, mapRes] = await Promise.all([
        fetch('/api/weather/current'),
        fetch('/api/weather/hourly'),
        fetch('/api/weather/daily'),
        fetch('/api/weather/alerts'),
        fetch('/api/weather/risk'),
        fetch('/api/weather/confidence'),
        fetch('/api/weather/map'),
      ]);

      if (currRes.ok) {
        const curr = await currRes.json();
        setCurrentWeather(curr);
        setLastUpdatedTime(curr.timestamp || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST');
      }
      if (hourlyRes.ok) setHourlyForecast(await hourlyRes.json());
      if (dailyRes.ok) setDailyForecast(await dailyRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (riskRes.ok) setRiskData(await riskRes.json());
      if (confRes.ok) setConfidenceData(await confRes.json());
      if (mapRes.ok) {
        const mapJson = await mapRes.json();
        setTalukaStations(mapJson.stations || []);
      }
    } catch (err) {
      console.error('Failed to load weather data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoScenario = async (scenario: string) => {
    try {
      await fetch('/api/demo/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      setDemoScenarioState(scenario);
      await fetchAllWeatherData();
    } catch (e) {
      console.error('Failed to toggle demo scenario:', e);
    }
  };

  useEffect(() => {
    fetchAllWeatherData();
    // Periodic refresh every 3 minutes
    const interval = setInterval(fetchAllWeatherData, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider
      value={{
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
        activeTab,
        setActiveTab,
        currentWeather,
        hourlyForecast,
        dailyForecast,
        alerts,
        riskData,
        confidenceData,
        talukaStations,
        isLoading,
        lastUpdatedTime,
        refreshWeatherData: fetchAllWeatherData,
        demoScenario,
        setDemoScenario,
        isAuthModalOpen,
        setIsAuthModalOpen,
        selectedAlertForExplanation,
        setSelectedAlertForExplanation,
        isChatOpen,
        setIsChatOpen,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
