export type UserRole =
  | 'general_public'
  | 'student'
  | 'farmer'
  | 'traveller'
  | 'outdoor_worker'
  | 'disaster_manager'
  | 'researcher';

export type AppLanguage = 'en' | 'hi' | 'mr' | 'hinglish';

export type AlertSeverity = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';

export type AlertPhase = 'BEFORE' | 'DURING' | 'AFTER';

export interface WeatherCondition {
  code: number;
  text: string;
  icon: string; // lucide icon identifier
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windDirectionText: string;
  rainfall: number; // in mm
  precipitationProbability: number;
  visibility: number; // in km
  cloudCover: number; // percentage
  uvIndex: number;
  condition: string;
  conditionCode: number;
  sunrise: string;
  sunset: string;
  timestamp: string;
  source: string;
  isDemo?: boolean;
}

export interface HourlyForecastItem {
  time: string;
  hour: number;
  temperature: number;
  feelsLike: number;
  precipitationProbability: number;
  rainfall: number;
  windSpeed: number;
  windDirectionText: string;
  humidity: number;
  uvIndex: number;
  condition: string;
  conditionCode: number;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  minTemp: number;
  maxTemp: number;
  precipitationProbability: number;
  rainfall: number;
  windSpeedMax: number;
  condition: string;
  conditionCode: number;
  warningSeverity?: AlertSeverity;
  uvIndexMax: number;
}

export interface WeatherAlert {
  id: string;
  title: string;
  warningType: string;
  severity: AlertSeverity;
  affectedArea: string;
  startTime: string;
  endTime: string;
  issuedTime: string;
  source: string; // e.g. "IMD (Regional Meteorological Centre, Nagpur)"
  description: string;
  recommendedAction: string;
  phase: AlertPhase;
  instructions: string[];
}

export interface RiskFactor {
  name: string;
  score: number; // 0 - 100
  weight: number;
  impact: 'low' | 'moderate' | 'high' | 'severe';
  reason: string;
}

export interface RiskIndexData {
  score: number; // 0 - 100
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  summary: string;
  factors: RiskFactor[];
  timestamp: string;
}

export interface ConfidenceData {
  score: number; // 0 - 100
  level: 'LOW' | 'MODERATE' | 'HIGH';
  explanation: string;
  consensusSources: string[];
  varianceNotes: string;
}

export interface TalukaStation {
  id: string;
  name: string;
  marathiName: string;
  lat: number;
  lon: number;
  elevationMeters: number;
  type: 'AWS' | 'ARG' | 'OBSERVATORY' | 'HQ';
  currentTemp?: number;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  rainfall24h?: number;
  riskScore?: number;
  activeAlert?: AlertSeverity;
  condition?: string;
}

export interface RouteSegment {
  segmentIndex: number;
  fromName: string;
  toName: string;
  distanceKm: number;
  estimatedMinutes: number;
  temperature: number;
  precipitationProbability: number;
  rainfallMm: number;
  windSpeedKmh: number;
  condition: string;
  localRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  riskScore: number;
  warning?: string;
}

export interface RouteAnalysis {
  fromLocation: string;
  toLocation: string;
  date: string;
  departureTime: string;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  departureWeather: {
    temp: number;
    condition: string;
    rainProb: number;
  };
  destinationWeather: {
    temp: number;
    condition: string;
    rainProb: number;
  };
  overallTravelRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  riskScore: number;
  segments: RouteSegment[];
  aiAdvisory: string;
  recommendedDepartureWindow: string;
  source: string;
}

export interface MonthlyClimateNorm {
  month: string;
  monthIndex: number;
  avgMaxTemp: number;
  meanMaxTemp?: number;
  avgMinTemp: number;
  meanMinTemp?: number;
  avgRainfallMm: number;
  normalRainfallMm?: number;
  rainyDays: number;
  highestEverTemp: number;
  lowestEverTemp: number;
}

export interface PersonalizedAdvisoryData {
  role: UserRole;
  roleTitle: string;
  date: string;
  summary: string;
  actionPoints: string[];
  dos: string[];
  donts: string[];
  urgency: 'routine' | 'caution' | 'alert';
}

export interface SmsSubscription {
  phoneNumber: string;
  verified: boolean;
  alertTypes: {
    severeWeather: boolean;
    heavyRainfall: boolean;
    thunderstorm: boolean;
    extremeHeat: boolean;
    strongWind: boolean;
    officialWarnings: boolean;
    dailySummary: boolean;
  };
  threshold: 'HIGH' | 'VERY_HIGH' | 'OFFICIAL_ONLY';
  subscribedAt: string;
}

export interface SmsLogItem {
  id: string;
  timestamp: string;
  recipient: string;
  message: string;
  type: string;
  status: 'DELIVERED (SIMULATED)' | 'SENT' | 'FAILED';
  isOfficialSource: boolean;
}

export interface ChatMessage {
  id?: string;
  sender?: 'user' | 'assistant' | 'system';
  role?: 'user' | 'assistant' | 'system';
  text?: string;
  content?: string;
  timestamp: string;
  structuredFacts?: {
    rainProbability?: number;
    period?: string;
    riskLevel?: string;
    advice?: string;
    officialWarning?: string;
  };
  toolsUsed?: string[];
  toolCallsExecuted?: string[];
  voiceAudioUrl?: string;
}
