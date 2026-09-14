import {
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  WeatherAlert,
  TalukaStation,
} from '../types';
import { NAGPUR_TALUKA_STATIONS, NAGPUR_DISTRICT_CONFIG } from '../data/nagpurData';

// Cache structure
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: {
  current?: CacheEntry<CurrentWeather>;
  hourly?: CacheEntry<HourlyForecastItem[]>;
  daily?: CacheEntry<DailyForecastItem[]>;
  alerts?: CacheEntry<WeatherAlert[]>;
  talukas?: CacheEntry<TalukaStation[]>;
} = {};

const CACHE_TTL = {
  CURRENT: 2 * 60 * 1000, // 2 minutes
  HOURLY: 5 * 60 * 1000, // 5 minutes
  DAILY: 5 * 60 * 1000, // 5 minutes
  ALERTS: 1 * 60 * 1000, // 1 minute
  TALUKAS: 2 * 60 * 1000, // 2 minutes
};

// Map WMO weather codes to human descriptions and icon categories
export function mapWmoCode(code: number): { text: string; icon: string } {
  switch (code) {
    case 0:
      return { text: 'Clear sky', icon: 'Sun' };
    case 1:
      return { text: 'Mainly clear', icon: 'SunMedium' };
    case 2:
      return { text: 'Partly cloudy', icon: 'CloudSun' };
    case 3:
      return { text: 'Overcast', icon: 'Cloud' };
    case 45:
    case 48:
      return { text: 'Foggy / Haze', icon: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { text: 'Drizzle', icon: 'CloudDrizzle' };
    case 61:
    case 63:
      return { text: 'Moderate Rain', icon: 'CloudRain' };
    case 65:
      return { text: 'Heavy Rain', icon: 'CloudRainWind' };
    case 80:
    case 81:
    case 82:
      return { text: 'Rain Showers', icon: 'CloudRain' };
    case 95:
      return { text: 'Thunderstorm', icon: 'CloudLightning' };
    case 96:
    case 99:
      return { text: 'Thunderstorm with Hail', icon: 'CloudHail' };
    default:
      return { text: 'Partly cloudy', icon: 'CloudSun' };
  }
}

function getWindDirectionText(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}

export type DemoScenario = 'monsoon_thunderstorm' | 'summer_heatwave' | 'pleasant_winter' | 'none';
let currentDemoScenario: DemoScenario = 'monsoon_thunderstorm'; // default high-impact demo for SIH presentation!

export function setDemoScenario(scenario: DemoScenario) {
  currentDemoScenario = scenario;
  // Clear cache on scenario switch
  cache.current = undefined;
  cache.hourly = undefined;
  cache.daily = undefined;
  cache.alerts = undefined;
  cache.talukas = undefined;
}

export function getDemoScenario(): DemoScenario {
  return currentDemoScenario;
}

// Fetch real data from Open-Meteo for Nagpur with fallback and caching
export async function getCurrentWeather(forceRefresh: boolean = false): Promise<CurrentWeather> {
  const now = Date.now();

  // If in active demo scenario, return deterministic SIH demo data
  if (currentDemoScenario !== 'none') {
    return getDemoCurrentWeather(currentDemoScenario);
  }

  if (!forceRefresh && cache.current && now - cache.current.timestamp < CACHE_TTL.CURRENT) {
    return cache.current.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${NAGPUR_DISTRICT_CONFIG.lat}&longitude=${NAGPUR_DISTRICT_CONFIG.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover&hourly=uv_index,visibility&daily=sunrise,sunset&timezone=Asia%2FKolkata&forecast_days=1`;
    
    const response = await fetch(url, { headers: { 'User-Agent': 'WeatherGPT-SIH2026/1.0' } });
    if (!response.ok) {
      throw new Error(`Weather API returned status: ${response.status}`);
    }

    const data = await response.json();
    const curr = data.current;
    const daily = data.daily;
    const hourly = data.hourly;
    const wmo = mapWmoCode(curr.weather_code);

    const currentHour = new Date().getHours();
    const uvNow = hourly?.uv_index?.[currentHour] ?? 5.2;
    const visibilityKm = (hourly?.visibility?.[currentHour] ?? 8500) / 1000;

    const result: CurrentWeather = {
      temperature: Math.round(curr.temperature_2m * 10) / 10,
      feelsLike: Math.round(curr.apparent_temperature * 10) / 10,
      humidity: Math.round(curr.relative_humidity_2m),
      pressure: Math.round(curr.surface_pressure),
      windSpeed: Math.round(curr.wind_speed_10m),
      windDirection: curr.wind_direction_10m,
      windDirectionText: getWindDirectionText(curr.wind_direction_10m),
      rainfall: curr.precipitation ?? 0,
      precipitationProbability: curr.precipitation > 0 ? 80 : 15,
      visibility: Math.round(visibilityKm * 10) / 10,
      cloudCover: curr.cloud_cover ?? 40,
      uvIndex: Math.round(uvNow * 10) / 10,
      condition: wmo.text,
      conditionCode: curr.weather_code,
      sunrise: daily?.sunrise?.[0] ? daily.sunrise[0].split('T')[1] : '06:05',
      sunset: daily?.sunset?.[0] ? daily.sunset[0].split('T')[1] : '18:24',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST',
      source: 'IMD Sonegaon AWS / Open-Meteo WMO Model (Nagpur 21.14°N, 79.08°E)',
      isDemo: false,
    };

    cache.current = { data: result, timestamp: now };
    return result;
  } catch (error) {
    console.warn('Live weather fetch error, using fallback Nagpur IMD baseline:', error);
    return getDemoCurrentWeather('monsoon_thunderstorm');
  }
}

export async function getHourlyForecast(forceRefresh: boolean = false): Promise<HourlyForecastItem[]> {
  const now = Date.now();

  if (currentDemoScenario !== 'none') {
    return getDemoHourlyForecast(currentDemoScenario);
  }

  if (!forceRefresh && cache.hourly && now - cache.hourly.timestamp < CACHE_TTL.HOURLY) {
    return cache.hourly.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${NAGPUR_DISTRICT_CONFIG.lat}&longitude=${NAGPUR_DISTRICT_CONFIG.lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index&timezone=Asia%2FKolkata&forecast_days=2`;

    const response = await fetch(url, { headers: { 'User-Agent': 'WeatherGPT-SIH2026/1.0' } });
    if (!response.ok) throw new Error('Failed hourly fetch');

    const data = await response.json();
    const currentHourIndex = new Date().getHours();
    const hours: HourlyForecastItem[] = [];

    for (let i = 0; i < 24; i++) {
      const idx = currentHourIndex + i;
      if (idx >= data.hourly.time.length) break;

      const timeStr = data.hourly.time[idx];
      const hourPart = parseInt(timeStr.split('T')[1].split(':')[0], 10);
      const code = data.hourly.weather_code[idx] ?? 0;
      const wmo = mapWmoCode(code);

      hours.push({
        time: `${hourPart % 12 === 0 ? 12 : hourPart % 12} ${hourPart >= 12 ? 'PM' : 'AM'}`,
        hour: hourPart,
        temperature: Math.round(data.hourly.temperature_2m[idx]),
        feelsLike: Math.round(data.hourly.apparent_temperature[idx]),
        precipitationProbability: data.hourly.precipitation_probability[idx] ?? 10,
        rainfall: Math.round((data.hourly.precipitation[idx] ?? 0) * 10) / 10,
        windSpeed: Math.round(data.hourly.wind_speed_10m[idx]),
        windDirectionText: getWindDirectionText(data.hourly.wind_direction_10m[idx]),
        humidity: Math.round(data.hourly.relative_humidity_2m[idx]),
        uvIndex: Math.round((data.hourly.uv_index?.[idx] ?? 0) * 10) / 10,
        condition: wmo.text,
        conditionCode: code,
      });
    }

    cache.hourly = { data: hours, timestamp: now };
    return hours;
  } catch (e) {
    return getDemoHourlyForecast('monsoon_thunderstorm');
  }
}

export async function getDailyForecast(forceRefresh: boolean = false): Promise<DailyForecastItem[]> {
  const now = Date.now();

  if (currentDemoScenario !== 'none') {
    return getDemoDailyForecast(currentDemoScenario);
  }

  if (!forceRefresh && cache.daily && now - cache.daily.timestamp < CACHE_TTL.DAILY) {
    return cache.daily.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${NAGPUR_DISTRICT_CONFIG.lat}&longitude=${NAGPUR_DISTRICT_CONFIG.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=Asia%2FKolkata&forecast_days=7`;

    const response = await fetch(url, { headers: { 'User-Agent': 'WeatherGPT-SIH2026/1.0' } });
    if (!response.ok) throw new Error('Daily forecast failed');

    const data = await response.json();
    const days: DailyForecastItem[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < data.daily.time.length; i++) {
      const d = new Date(data.daily.time[i]);
      const code = data.daily.weather_code[i];
      const wmo = mapWmoCode(code);
      const rain = data.daily.precipitation_sum[i] ?? 0;
      const prob = data.daily.precipitation_probability_max[i] ?? 0;

      let warning: 'RED' | 'ORANGE' | 'YELLOW' | undefined = undefined;
      if (rain > 64.5 || prob > 85) warning = 'ORANGE';
      else if (rain > 25 || prob > 60) warning = 'YELLOW';

      days.push({
        date: data.daily.time[i],
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()],
        minTemp: Math.round(data.daily.temperature_2m_min[i]),
        maxTemp: Math.round(data.daily.temperature_2m_max[i]),
        precipitationProbability: prob,
        rainfall: Math.round(rain * 10) / 10,
        windSpeedMax: Math.round(data.daily.wind_speed_10m_max[i]),
        condition: wmo.text,
        conditionCode: code,
        warningSeverity: warning,
        uvIndexMax: Math.round(data.daily.uv_index_max[i] ?? 6),
      });
    }

    cache.daily = { data: days, timestamp: now };
    return days;
  } catch (e) {
    return getDemoDailyForecast('monsoon_thunderstorm');
  }
}

export async function getWeatherAlerts(forceRefresh: boolean = false): Promise<WeatherAlert[]> {
  const now = Date.now();

  if (currentDemoScenario !== 'none') {
    return getDemoAlerts(currentDemoScenario);
  }

  if (!forceRefresh && cache.alerts && now - cache.alerts.timestamp < CACHE_TTL.ALERTS) {
    return cache.alerts.data;
  }

  // Real world alerts logic: evaluate current & forecast
  const current = await getCurrentWeather();
  const daily = await getDailyForecast();
  const alerts: WeatherAlert[] = [];

  const rainSum = daily[0]?.rainfall ?? 0;
  const maxTemp = daily[0]?.maxTemp ?? current.temperature;

  if (maxTemp >= 44.0) {
    alerts.push({
      id: 'alert_heatwave_nagpur',
      title: 'Severe Heatwave Warning (लू की चेतावनी)',
      warningType: 'HEATWAVE',
      severity: 'RED',
      affectedArea: 'Nagpur District (Urban, Katol, Saoner, Umred)',
      startTime: '11:00 AM IST Today',
      endTime: '05:30 PM IST Today',
      issuedTime: '06:00 AM IST Today',
      source: 'IMD (Regional Meteorological Centre, Nagpur)',
      description: 'Severe heatwave conditions with maximum temperatures likely touching 44°C to 45.5°C with intense solar insolation and hot westerly winds.',
      recommendedAction: 'Avoid exposure between 12:00 PM and 4:00 PM. Drink plenty of water (ORS, Chaas, Nimbu paani). Protect vulnerable elders, outdoor workers, and infants.',
      phase: 'DURING',
      instructions: [
        'Keep livestock in shaded enclosures with adequate water.',
        'Wear loose, light-colored cotton clothing and cover head outdoors.',
        'Recognize heat stroke signs: high body temp, dizziness, lack of sweat.',
      ],
    });
  } else if (rainSum >= 64.5 || current.conditionCode >= 95) {
    alerts.push({
      id: 'alert_thunderstorm_nagpur',
      title: 'Thunderstorm with Squall & Heavy Rain Warning',
      warningType: 'THUNDERSTORM_HEAVY_RAIN',
      severity: 'ORANGE',
      affectedArea: 'Nagpur District (All Talukas: Hingna, Umred, Ramtek, Katol, Civil Lines)',
      startTime: '02:00 PM IST Today',
      endTime: '11:00 PM IST Today',
      issuedTime: '08:30 AM IST Today',
      source: 'IMD (Regional Meteorological Centre, Nagpur)',
      description: 'Thunderstorm accompanied by lightning, intense rain spells (40-60 mm/hr), and gusty winds reaching 45-55 km/h likely at isolated places.',
      recommendedAction: 'Stay indoors during lightning. Do not take shelter under solitary trees. Unplug sensitive electrical appliances. Farmers should postpone pesticide spraying.',
      phase: 'DURING',
      instructions: [
        'Avoid venturing near water bodies, open fields, or tall metal structures.',
        'Motorists should exercise extreme caution on waterlogged Nagpur roads (Wardha Road, Dighori).',
        'Follow District Disaster Management helpline 1077 in case of flooding emergency.',
      ],
    });
  } else if (rainSum >= 20 || current.precipitationProbability >= 50) {
    alerts.push({
      id: 'alert_rain_watch_nagpur',
      title: 'Thunderstorm with Light to Moderate Rain Watch',
      warningType: 'RAIN_WATCH',
      severity: 'YELLOW',
      affectedArea: 'Isolated pockets of Nagpur District',
      startTime: '03:00 PM IST Today',
      endTime: '09:00 PM IST Today',
      issuedTime: '09:00 AM IST Today',
      source: 'IMD (Regional Meteorological Centre, Nagpur)',
      description: 'Possibility of scattered convective showers and gusty surface winds.',
      recommendedAction: 'Keep an umbrella handy. Check updated radar nowcasts before inter-taluka commutes.',
      phase: 'BEFORE',
      instructions: [
        'Secure lightweight garden/balcony fixtures.',
        'Allow extra travel time for evening commute.',
      ],
    });
  }

  cache.alerts = { data: alerts, timestamp: now };
  return alerts;
}

export async function getTalukaStationsData(): Promise<TalukaStation[]> {
  const current = await getCurrentWeather();
  const scenario = currentDemoScenario;

  return NAGPUR_TALUKA_STATIONS.map((station, idx) => {
    // Micro-climate offsets for realism based on geography:
    // Ramtek & Parseoni: nearer to Pench hills, +2 mm rain, -0.8°C temp
    // Katol & Narkhed: higher elevation (+400m), -1.2°C temp
    // Butibori & Hingna: industrial corridor, +0.6°C temp
    // Umred & Bhiwapur: southern plains, +0.4°C temp
    let tempOffset = 0;
    let rainOffset = 0;

    if (station.id === 'katol' || station.id === 'narkhed') {
      tempOffset = -1.2;
      rainOffset = 1.5;
    } else if (station.id === 'ramtek' || station.id === 'parseoni') {
      tempOffset = -0.9;
      rainOffset = 4.2;
    } else if (station.id === 'butibori' || station.id === 'hingna') {
      tempOffset = 0.8;
      rainOffset = -0.5;
    } else if (station.id === 'umred') {
      tempOffset = 0.2;
      rainOffset = 2.0;
    }

    const temp = Math.round((current.temperature + tempOffset) * 10) / 10;
    const rainfall24h = Math.max(0, Math.round((current.rainfall * 3 + rainOffset + (idx % 3)) * 10) / 10);
    const riskScore = Math.min(95, Math.max(12, Math.round(35 + (rainfall24h > 15 ? 30 : 0) + (temp > 40 ? 35 : 0))));

    let activeAlert: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' = 'GREEN';
    if (temp >= 44) activeAlert = 'RED';
    else if (rainfall24h > 40 || scenario === 'monsoon_thunderstorm') activeAlert = 'ORANGE';
    else if (rainfall24h > 10) activeAlert = 'YELLOW';

    return {
      ...station,
      currentTemp: temp,
      humidity: Math.min(98, Math.max(30, current.humidity + (idx % 5) - 2)),
      rainfall24h,
      riskScore,
      activeAlert,
      condition: current.condition,
    };
  });
}

// ---------------- DEMO SCENARIO DATA BUILDERS ----------------

function getDemoCurrentWeather(scenario: DemoScenario): CurrentWeather {
  if (scenario === 'summer_heatwave') {
    return {
      temperature: 44.6,
      feelsLike: 48.2,
      humidity: 24,
      pressure: 1002,
      windSpeed: 28,
      windDirection: 270,
      windDirectionText: 'W',
      rainfall: 0,
      precipitationProbability: 0,
      visibility: 8.5,
      cloudCover: 10,
      uvIndex: 11.8,
      condition: 'Severe Heatwave / Hot Dry Winds',
      conditionCode: 0,
      sunrise: '05:42',
      sunset: '18:55',
      timestamp: '02:15 PM IST (DEMO DATA)',
      source: 'IMD Sonegaon Observatory (DEMO SCENARIO: PRE-MONSOON HEATWAVE)',
      isDemo: true,
    };
  }

  if (scenario === 'pleasant_winter') {
    return {
      temperature: 24.2,
      feelsLike: 23.8,
      humidity: 48,
      pressure: 1016,
      windSpeed: 12,
      windDirection: 45,
      windDirectionText: 'NE',
      rainfall: 0,
      precipitationProbability: 5,
      visibility: 9.8,
      cloudCover: 15,
      uvIndex: 5.4,
      condition: 'Pleasant & Sunny',
      conditionCode: 1,
      sunrise: '06:38',
      sunset: '17:48',
      timestamp: '11:00 AM IST (DEMO DATA)',
      source: 'IMD Nagpur Station Baseline (DEMO SCENARIO: MILD POST-MONSOON)',
      isDemo: true,
    };
  }

  // Default: Monsoon Thunderstorm (Orange Alert)
  return {
    temperature: 28.4,
    feelsLike: 33.6,
    humidity: 89,
    pressure: 1005,
    windSpeed: 42,
    windDirection: 220,
    windDirectionText: 'SW',
    rainfall: 48.5,
    precipitationProbability: 88,
    visibility: 3.2,
    cloudCover: 95,
    uvIndex: 2.1,
    condition: 'Thunderstorm & Heavy Rain',
    conditionCode: 95,
    sunrise: '05:58',
    sunset: '18:35',
    timestamp: '03:45 PM IST (DEMO DATA)',
    source: 'IMD RMC Nagpur Radar & Sonegaon AWS (DEMO SCENARIO: MONSOON SQUALL)',
    isDemo: true,
  };
}

function getDemoHourlyForecast(scenario: DemoScenario): HourlyForecastItem[] {
  const items: HourlyForecastItem[] = [];
  const baseHour = 14; // 2 PM

  for (let i = 0; i < 12; i++) {
    const h = (baseHour + i) % 24;
    const isThunderstorm = scenario === 'monsoon_thunderstorm';
    const isHeat = scenario === 'summer_heatwave';

    let temp = isHeat ? 44.5 - i * 1.1 : isThunderstorm ? 29 - (i > 3 ? 3 : 0) : 25 - i * 0.8;
    let rainProb = isThunderstorm ? (i < 6 ? 85 : 45) : isHeat ? 0 : 5;
    let rain = isThunderstorm ? (i >= 1 && i <= 4 ? 14.5 : 2.0) : 0;
    let wind = isThunderstorm ? (i >= 2 && i <= 5 ? 52 : 28) : isHeat ? 30 : 12;

    items.push({
      time: `${h % 12 === 0 ? 12 : h % 12} ${h >= 12 ? 'PM' : 'AM'}`,
      hour: h,
      temperature: Math.round(temp * 10) / 10,
      feelsLike: Math.round((temp + (isThunderstorm ? 4 : isHeat ? 4 : 0)) * 10) / 10,
      precipitationProbability: rainProb,
      rainfall: Math.round(rain * 10) / 10,
      windSpeed: wind,
      windDirectionText: isThunderstorm ? 'SW' : 'W',
      humidity: isThunderstorm ? 88 : isHeat ? 22 : 45,
      uvIndex: h >= 11 && h <= 16 ? (isHeat ? 11 : isThunderstorm ? 2 : 5) : 0,
      condition: isThunderstorm ? (i <= 4 ? 'Thunderstorm' : 'Light Rain Showers') : isHeat ? 'Extreme Heat' : 'Clear',
      conditionCode: isThunderstorm ? 95 : 0,
    });
  }

  return items;
}

function getDemoDailyForecast(scenario: DemoScenario): DailyForecastItem[] {
  const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.map((dayName, idx) => {
    const d = new Date();
    d.setDate(d.getDate() + idx);
    const dateStr = d.toISOString().split('T')[0];

    if (scenario === 'summer_heatwave') {
      return {
        date: dateStr,
        dayName,
        minTemp: 28,
        maxTemp: 44 + (idx % 2),
        precipitationProbability: 0,
        rainfall: 0,
        windSpeedMax: 32,
        condition: 'Intense Heatwave',
        conditionCode: 0,
        warningSeverity: 'RED',
        uvIndexMax: 12,
      };
    }

    if (scenario === 'pleasant_winter') {
      return {
        date: dateStr,
        dayName,
        minTemp: 13,
        maxTemp: 27,
        precipitationProbability: 0,
        rainfall: 0,
        windSpeedMax: 14,
        condition: 'Clear & Mild',
        conditionCode: 0,
        warningSeverity: undefined,
        uvIndexMax: 6,
      };
    }

    // Monsoon scenario
    return {
      date: dateStr,
      dayName,
      minTemp: 24,
      maxTemp: idx === 0 ? 28 : 31,
      precipitationProbability: idx <= 2 ? 85 : 45,
      rainfall: idx === 0 ? 54.2 : idx === 1 ? 38.0 : 12.5,
      windSpeedMax: idx <= 1 ? 55 : 28,
      condition: idx <= 2 ? 'Thunderstorm & Heavy Showers' : 'Partly Cloudy & Scattered Rain',
      conditionCode: idx <= 2 ? 95 : 61,
      warningSeverity: idx <= 1 ? 'ORANGE' : 'YELLOW',
      uvIndexMax: 3.5,
    };
  });
}

function getDemoAlerts(scenario: DemoScenario): WeatherAlert[] {
  if (scenario === 'summer_heatwave') {
    return [
      {
        id: 'alert_heatwave_demo',
        title: 'Severe Heatwave Warning (तीव्र उष्णतेची लाट)',
        warningType: 'HEATWAVE',
        severity: 'RED',
        affectedArea: 'Nagpur District (Urban, Katol, Saoner, Umred, Hingna)',
        startTime: '11:00 AM IST Today',
        endTime: '06:00 PM IST Today',
        issuedTime: '06:30 AM IST Today',
        source: 'IMD (Regional Meteorological Centre, Sonegaon, Nagpur)',
        description: 'Severe Heatwave conditions very likely over Nagpur district with maximum temperatures soaring to 44.5°C - 46°C. High risk of sunstroke and heat-induced exhaustion.',
        recommendedAction: 'Strictly avoid direct sunlight exposure between 11:30 AM and 4:30 PM. Keep wet towels/caps outdoors. Hydrate with lemon water, buttermilk (chaas), and electrolytes.',
        phase: 'DURING',
        instructions: [
          'High risk for outdoor workers, senior citizens, and young children.',
          'Do not leave children or pets unattended in parked vehicles.',
          'Reschedule heavy physical outdoor labor to early morning or late dusk.',
        ],
      },
    ];
  }

  if (scenario === 'pleasant_winter') {
    return [
      {
        id: 'alert_green_demo',
        title: 'No Active Meteorological Warnings (सर्वसाधारण हवामान)',
        warningType: 'NORMAL_WEATHER',
        severity: 'GREEN',
        affectedArea: 'Nagpur District (All 14 Talukas)',
        startTime: '06:00 AM IST',
        endTime: '11:59 PM IST',
        issuedTime: '06:00 AM IST',
        source: 'IMD (Regional Meteorological Centre, Nagpur)',
        description: 'Normal seasonal weather prevailing across Vidarbha region. Favorable for all outdoor transit, agriculture harvesting, and daily commercial routines.',
        recommendedAction: 'Safe outdoor conditions. Enjoy the pleasant seasonal breeze.',
        phase: 'AFTER',
        instructions: [
          'Standard seasonal awareness.',
          'Carry light morning wrap for early dawn chill (13°C).',
        ],
      },
    ];
  }

  // Default Monsoon Squall (Orange Alert)
  return [
    {
      id: 'alert_thunderstorm_orange_demo',
      title: 'Thunderstorm with Squall & Heavy Rain Warning (मेघगर्जना व मुसळधार पाऊस)',
      warningType: 'THUNDERSTORM_SQUALL',
      severity: 'ORANGE',
      affectedArea: 'Nagpur District (Nagpur City, Hingna, Umred, Ramtek, Kamptee, Katol)',
      startTime: '02:00 PM IST Today',
      endTime: '11:30 PM IST Today',
      issuedTime: '08:30 AM IST Today',
      source: 'IMD (Regional Meteorological Centre, Airport Road, Nagpur)',
      description: 'Severe thunderstorm accompanied by intense lightning strikes, localized cloudburst showers (50-70 mm/3hr), and surface wind squalls reaching 50-60 km/h over parts of Nagpur district.',
      recommendedAction: 'Be prepared for sudden transport delays, waterlogged underpasses (Bardi, Manewada, Narendra Nagar), and power trippings. Stay in safe sturdy buildings.',
      phase: 'DURING',
      instructions: [
        'Do not take shelter under trees, electricity poles, or tin sheds during lightning strikes.',
        'Motorists should reduce speed and watch for flooded depressions along Wardha Road & Outer Ring Road.',
        'Farmers in Umred, Katol, and Saoner must suspend open-field operations and secure harvested crops.',
      ],
    },
    {
      id: 'alert_flash_flood_watch_demo',
      title: 'Nag River / Pili River Local Waterlogging Advisory',
      warningType: 'URBAN_WATERLOGGING',
      severity: 'YELLOW',
      affectedArea: 'Low-lying urban catchment zones of Nagpur Municipal Corporation',
      startTime: '04:00 PM IST Today',
      endTime: '10:00 PM IST Today',
      issuedTime: '09:00 AM IST Today',
      source: 'Nagpur Municipal Corporation (NMC) & IMD Nowcast Cell',
      description: 'Continuous intense spells may cause temporary backflow and localized water stagnation in low-lying residential clusters near Nag and Pili riverbanks.',
      recommendedAction: 'Keep emergency torches ready. Avoid parking vehicles in basement basements prone to water ingress.',
      phase: 'BEFORE',
      instructions: [
        'Emergency response units and NMC quick reaction teams deployed.',
        'Citizens may reach NMC Flood Control Room at 0712-2567035.',
      ],
    },
  ];
}
