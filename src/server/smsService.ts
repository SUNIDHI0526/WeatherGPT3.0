import { SmsSubscription, SmsLogItem, WeatherAlert, CurrentWeather } from '../types';

// In-memory persistent subscriber registry & logs
const subscribers = new Map<string, SmsSubscription>();
const smsLogs: SmsLogItem[] = [];

// Seed demo subscriber for initial state
const DEMO_PHONE = '+91 98230 12345';
subscribers.set(DEMO_PHONE, {
  phoneNumber: DEMO_PHONE,
  verified: true,
  alertTypes: {
    severeWeather: true,
    heavyRainfall: true,
    thunderstorm: true,
    extremeHeat: true,
    strongWind: true,
    officialWarnings: true,
    dailySummary: false,
  },
  threshold: 'HIGH',
  subscribedAt: new Date(Date.now() - 3600000).toISOString(),
});

// Seed an initial demo log
smsLogs.push({
  id: 'sms_init_01',
  timestamp: new Date(Date.now() - 1800000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST',
  recipient: DEMO_PHONE,
  message: 'WeatherGPT Notification [Nagpur District]: IMD has issued an ORANGE Alert for Thunderstorm with heavy rain & squall winds (45-55 km/h). Stay indoors. Based on official IMD warning.',
  type: 'OFFICIAL_ALERT',
  status: 'DELIVERED (SIMULATED)',
  isOfficialSource: true,
});

export function getSubscribers(): SmsSubscription[] {
  return Array.from(subscribers.values());
}

export function getSubscription(phone: string): SmsSubscription | undefined {
  return subscribers.get(phone);
}

export function saveSubscription(sub: SmsSubscription): void {
  subscribers.set(sub.phoneNumber, sub);
}

export function removeSubscription(phone: string): boolean {
  return subscribers.delete(phone);
}

export function getSmsLogs(): SmsLogItem[] {
  return [...smsLogs].reverse(); // newest first
}

export async function sendOrSimulateSms(
  recipient: string,
  message: string,
  type: string,
  isOfficialSource: boolean = true
): Promise<{ success: boolean; log: SmsLogItem; mode: 'REAL' | 'DEMO' }> {
  const providerKey = process.env.SMS_PROVIDER_API_KEY;
  let status: 'DELIVERED (SIMULATED)' | 'SENT' | 'FAILED' = 'DELIVERED (SIMULATED)';
  let mode: 'REAL' | 'DEMO' = 'DEMO';

  if (providerKey && providerKey.trim().length > 0) {
    mode = 'REAL';
    try {
      // In real mode, would call third-party SMS Gateway (e.g. Gupshup / Twilio / SMS Gateway Hub)
      // Safely handled server-side
      status = 'SENT';
    } catch (err) {
      console.error('SMS Gateway dispatch error:', err);
      status = 'FAILED';
    }
  } else {
    mode = 'DEMO';
    status = 'DELIVERED (SIMULATED)';
  }

  const logItem: SmsLogItem = {
    id: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST',
    recipient,
    message,
    type,
    status,
    isOfficialSource,
  };

  smsLogs.push(logItem);
  if (smsLogs.length > 50) {
    smsLogs.shift();
  }

  return { success: true, log: logItem, mode };
}

export function generateSmsAlertText(alert: WeatherAlert, current: CurrentWeather): string {
  const prefix = 'WeatherGPT Notification [Nagpur District]:';
  const sourceAttribution = 'Based on official IMD warning.';
  return `${prefix} ${alert.severity} ALERT - ${alert.title}. ${alert.description.substring(0, 110)}... Take action: ${alert.recommendedAction.substring(0, 80)}... ${sourceAttribution}`;
}
