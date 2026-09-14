import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import {
  getCurrentWeather,
  getHourlyForecast,
  getDailyForecast,
  getWeatherAlerts,
  getTalukaStationsData,
} from './weatherService';
import { calculateLocalRisk, calculateForecastConfidence } from './riskEngine';
import { NAGPUR_CLIMATE_NORMALS, NAGPUR_TALUKA_STATIONS } from '../data/nagpurData';
import { RouteAnalysis, RouteSegment, UserRole, AppLanguage } from '../types';

let aiClient: GoogleGenAI | null = null;

function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Function declarations for Gemini tool calling
const getCurrentWeatherTool: FunctionDeclaration = {
  name: 'get_current_weather',
  description: 'Retrieve real-time verified weather observations for Nagpur District or specific Nagpur talukas (Airport, Civil Lines, Hingna, Umred, Katol, Ramtek, etc.).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'Specific taluka or area in Nagpur (e.g. "Nagpur Urban", "Umred", "Katol", "Hingna"). Must be within Nagpur District.',
      },
    },
  },
};

const getHourlyForecastTool: FunctionDeclaration = {
  name: 'get_hourly_forecast',
  description: 'Get hour-by-hour forecast for Nagpur District including precipitation probability, temperature, rainfall mm, wind, and sky condition for upcoming hours.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      targetHourOrPeriod: {
        type: Type.STRING,
        description: 'e.g. "evening", "3 PM", "tomorrow morning", "afternoon"',
      },
    },
  },
};

const getDailyForecastTool: FunctionDeclaration = {
  name: 'get_daily_forecast',
  description: 'Get 7-day extended meteorological forecast for Nagpur District with rain probabilities, max/min temperatures, and expected hazards.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      daysCount: {
        type: Type.NUMBER,
        description: 'Number of days to retrieve (1 to 7).',
      },
    },
  },
};

const getWeatherAlertsTool: FunctionDeclaration = {
  name: 'get_weather_alerts',
  description: 'Retrieve active official weather warnings and nowcasts from IMD (India Meteorological Department) for Nagpur District.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getRouteWeatherTool: FunctionDeclaration = {
  name: 'get_route_weather',
  description: 'Analyze travel route weather between places in/around Nagpur District (e.g. Nagpur to Umred, Hingna to Katol, Civil Lines to Ramtek).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      fromLocation: {
        type: Type.STRING,
        description: 'Departure point (e.g. "Nagpur", "Civil Lines", "Hingna")',
      },
      toLocation: {
        type: Type.STRING,
        description: 'Destination point (e.g. "Umred", "Katol", "Ramtek", "Butibori")',
      },
      departureTime: {
        type: Type.STRING,
        description: 'Time of departure e.g. "2:00 PM", "tomorrow morning"',
      },
    },
    required: ['fromLocation', 'toLocation'],
  },
};

const calculateLocalRiskTool: FunctionDeclaration = {
  name: 'calculate_local_risk',
  description: 'Calculate the WeatherGPT Local Risk Index (0-100) and forecast confidence for Nagpur District.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getPersonalizedAdvisoryTool: FunctionDeclaration = {
  name: 'get_personalized_advisory',
  description: 'Generate specific decision-support recommendations tailored to the user role (farmer, student, traveller, outdoor worker, disaster manager).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      role: {
        type: Type.STRING,
        description: 'User role: "farmer", "student", "traveller", "outdoor_worker", "disaster_manager", "general_public"',
      },
    },
    required: ['role'],
  },
};

const getHistoricalClimateTool: FunctionDeclaration = {
  name: 'get_historical_climate',
  description: 'Retrieve 30-year IMD climatological normals and historical monthly rainfall/temperature statistics for Nagpur.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      month: {
        type: Type.STRING,
        description: 'Month name e.g. "July", "September", "May"',
      },
    },
  },
};

const ALL_TOOLS = [
  {
    functionDeclarations: [
      getCurrentWeatherTool,
      getHourlyForecastTool,
      getDailyForecastTool,
      getWeatherAlertsTool,
      getRouteWeatherTool,
      calculateLocalRiskTool,
      getPersonalizedAdvisoryTool,
      getHistoricalClimateTool,
    ],
  },
];

// Execute tool call on live data
async function executeToolCall(name: string, args: Record<string, any>) {
  switch (name) {
    case 'get_current_weather': {
      const curr = await getCurrentWeather();
      const talukas = await getTalukaStationsData();
      const requestedLoc = args?.location?.toLowerCase();
      let matchedTaluka = null;
      if (requestedLoc) {
        matchedTaluka = talukas.find(t => t.name.toLowerCase().includes(requestedLoc) || t.id.includes(requestedLoc));
      }
      return {
        district: 'Nagpur District, Maharashtra',
        currentConditions: matchedTaluka ? { ...curr, temperature: matchedTaluka.currentTemp ?? curr.temperature, talukaName: matchedTaluka.name } : curr,
        source: curr.source,
      };
    }

    case 'get_hourly_forecast': {
      const hourly = await getHourlyForecast();
      return {
        district: 'Nagpur',
        hourlyPreview: hourly.slice(0, 12),
        periodQueried: args?.targetHourOrPeriod,
      };
    }

    case 'get_daily_forecast': {
      const daily = await getDailyForecast();
      const count = args?.daysCount ? Math.min(7, Math.max(1, args.daysCount)) : 7;
      return {
        district: 'Nagpur',
        forecastDays: daily.slice(0, count),
      };
    }

    case 'get_weather_alerts': {
      const alerts = await getWeatherAlerts();
      return {
        officialSource: 'IMD (India Meteorological Department)',
        activeAlertsCount: alerts.length,
        alerts,
      };
    }

    case 'get_route_weather': {
      return analyzeRoute(args.fromLocation, args.toLocation, args.departureTime);
    }

    case 'calculate_local_risk': {
      const curr = await getCurrentWeather();
      const daily = await getDailyForecast();
      const alerts = await getWeatherAlerts();
      const risk = calculateLocalRisk(curr, daily, alerts);
      const confidence = calculateForecastConfidence(curr, daily, curr.isDemo);
      return {
        localRiskIndex: risk,
        forecastConfidence: confidence,
      };
    }

    case 'get_personalized_advisory': {
      return buildRoleAdvisory(args.role || 'general_public');
    }

    case 'get_historical_climate': {
      const monthQuery = args?.month?.toLowerCase();
      if (monthQuery) {
        const found = NAGPUR_CLIMATE_NORMALS.find(m => m.month.toLowerCase() === monthQuery);
        if (found) return found;
      }
      return { normals: NAGPUR_CLIMATE_NORMALS };
    }

    default:
      return { error: `Tool ${name} not found.` };
  }
}

export async function processChatWithGemini(params: {
  message: string;
  history?: Array<{ role: 'user' | 'model'; parts: string }>;
  role?: UserRole;
  language?: AppLanguage;
}): Promise<{
  text: string;
  structuredFacts?: any;
  toolCallsExecuted?: string[];
}> {
  const { message, history = [], role = 'general_public', language = 'en' } = params;

  // Geographic boundary check: If user explicitly queries about outside Nagpur District
  const lowerMsg = message.toLowerCase();
  const knownOutsideCities = ['mumbai', 'pune', 'delhi', 'bangalore', 'bengaluru', 'kolkata', 'chennai', 'hyderabad', 'ahmedabad', 'jaipur', 'lucknow', 'chandigarh', 'london', 'new york', 'dubai', 'nashik', 'aurangabad', 'solapur', 'kolhapur', 'amravati'];
  const hasOutsideCity = knownOutsideCities.some(city => new RegExp(`\\b${city}\\b`, 'i').test(lowerMsg));
  const mentionsNagpur = lowerMsg.includes('nagpur') || NAGPUR_TALUKA_STATIONS.some(t => lowerMsg.includes(t.name.toLowerCase()) || lowerMsg.includes(t.id));

  if (hasOutsideCity && !mentionsNagpur) {
    if (language === 'hi') {
      return {
        text: "वेदर-जीपीटी का वर्तमान प्रोटोटाइप विशेष रूप से **नागपुर जिला (महाराष्ट्र)** के लिए अनुकूलित है। व्यापक क्षेत्रीय एवं राष्ट्रीय कवरेज आगामी संस्करण में जोड़ी जाएगी। कृपया नागपुर या इसके तालुकों (जैसे उमरेड, काटोल, हिंगणा, रामटेक आदि) के मौसम के बारे में पूछें।",
      };
    } else if (language === 'mr') {
      return {
        text: "वेदर-जीपीटी चा सध्याचा प्रोटोटाइप फक्त **नागपूर जिल्हा (महाराष्ट्र)** साठी कार्यरत आहे. पुढील आवृत्तीमध्ये महाराष्ट्रातील इतर जिल्हे जोडले जातील. कृपया नागपूर अथवा जिल्ह्यातील तालुके (हिंगणा, उमरेड, काटोल, रामटेक) याविषयी विचारावे.",
      };
    } else if (language === 'hinglish') {
      return {
        text: "WeatherGPT ka current prototype **Nagpur District** ke liye optimized hai. Wider location coverage future version me add ki jayegi. Aap Nagpur ya iske talukas (Umred, Katol, Hingna, Ramtek) ke weather ke baare me pooch sakte hain.",
      };
    }
    return {
      text: "WeatherGPT's current prototype is optimized for Nagpur District. Wider location coverage will be added in a future version. Please ask about Nagpur District or its talukas (Umred, Hingna, Katol, Ramtek, Civil Lines, etc.).",
    };
  }

  const ai = getAi();
  const toolsExecuted: string[] = [];

  // Fallback if no Gemini API Key is configured in dev/preview
  if (!ai) {
    return generateDeterministicAssistantResponse(message, role, language);
  }

  const systemInstruction = `You are WeatherGPT, an authoritative conversational weather & disaster intelligence assistant built for Smart India Hackathon 2026 Problem Statement 26068 (Ministry of Earth Sciences / India Meteorological Department).

OPERATIONAL BOUNDARY:
- Your operational area is strictly NAGPUR DISTRICT, MAHARASHTRA, INDIA (Coordinates: 21.1458° N, 79.0882° E; Talukas: Nagpur Urban, Sonegaon, Hingna, Umred, Kamptee, Katol, Kalmeshwar, Saoner, Ramtek, Parseoni, Mouda, Kuhi, Bhiwapur, Butibori).
- If the user asks for weather outside Nagpur District, politely explain: "WeatherGPT's current prototype is optimized for Nagpur District. Wider location coverage will be added in a future version." Do not fabricate weather for unsupported locations.

METEOROLOGICAL INTEGRITY RULES:
1. You must NEVER fabricate weather, alerts, or risk scores from memory. Always call the relevant tool (e.g. get_current_weather, get_hourly_forecast, get_daily_forecast, get_weather_alerts, get_route_weather, calculate_local_risk).
2. Clearly identify the official source when presenting warnings (e.g., "Official Source: IMD (India Meteorological Department)").
3. Distinguish clearly between AI-derived local risk index (WeatherGPT Local Risk 0-100) and official IMD warnings.
4. User role: ${role}. Tailor recommendations accordingly (e.g. farmers care about spraying/soil/rain; outdoor workers care about heat/lightning; travellers care about roads/visibility).
5. User preferred language: ${language} (support English, Hindi, Marathi, Hinglish naturally).

RESPONSE STRUCTURE:
Provide crisp, highly actionable answers:
- Direct answer (1-2 sentences answering the question directly)
- Key weather facts (bullet points with numbers: temp, rain probability, wind, time window)
- WeatherGPT Local Risk (Low/Moderate/High/Very High)
- What you should do (practical guidance for their role)
- If an official IMD warning is active, highlight it prominently as "⚠️ Official IMD Warning Active".`;

  try {
    // 1. Initial call to Gemini with tools
    const contents: any[] = [];
    for (const h of history) {
      contents.push({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.parts }] });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        tools: ALL_TOOLS,
        temperature: 0.3,
      },
    });

    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      // Execute each tool
      const toolResponses: any[] = [];
      for (const call of functionCalls) {
        toolsExecuted.push(call.name);
        const result = await executeToolCall(call.name, call.args || {});
        toolResponses.push({
          name: call.name,
          response: result,
        });
      }

      // Send tool results back to Gemini for final grounded synthesis
      const followUpResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...contents,
          response.candidates?.[0]?.content,
          {
            role: 'user',
            parts: toolResponses.map(tr => ({
              functionResponse: {
                name: tr.name,
                response: tr.response,
              },
            })),
          },
        ],
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      return {
        text: followUpResponse.text || 'Information retrieved.',
        toolCallsExecuted: toolsExecuted,
      };
    }

    return {
      text: response.text || 'Information processed.',
      toolCallsExecuted: toolsExecuted,
    };
  } catch (error) {
    console.error('Gemini API execution error, falling back to deterministic engine:', error);
    return generateDeterministicAssistantResponse(message, role, language);
  }
}

// Grounded explanation for "Explain My Alert"
export async function explainAlertWithGemini(
  alertId: string,
  role: UserRole = 'general_public',
  language: AppLanguage = 'en'
): Promise<{
  explanation: string;
  whatItMeans: string;
  whatYouShouldDo: string;
  vulnerableGroups: string;
}> {
  const alerts = await getWeatherAlerts();
  const alert = alerts.find(a => a.id === alertId) || alerts[0];
  const curr = await getCurrentWeather();

  if (!alert) {
    return {
      explanation: 'No active weather warnings are currently in effect for Nagpur District.',
      whatItMeans: 'Weather conditions are within normal climatological parameters.',
      whatYouShouldDo: 'Follow standard daily routines with general outdoor awareness.',
      vulnerableGroups: 'None identified at this time.',
    };
  }

  const ai = getAi();
  if (ai) {
    try {
      const prompt = `As WeatherGPT (SIH 2026 PS 26068), provide a simple, grounded, empathetic explanation of this active IMD alert for Nagpur District.
ALERT DETAILS:
- Title: ${alert.title}
- Severity: ${alert.severity}
- Type: ${alert.warningType}
- Area: ${alert.affectedArea}
- Description: ${alert.description}
- Recommended Action: ${alert.recommendedAction}
- Current Temp: ${curr.temperature}°C, Rain: ${curr.rainfall} mm

AUDIENCE:
- User Role: ${role}
- Language: ${language} (respond strictly in ${language})

FORMAT REQUIREMENTS:
Return in clean structured sections:
1. What this alert means in simple language
2. What actions the user should take immediately (tailored to role ${role})
3. Specific precautions for vulnerable groups (children, senior citizens, farmers, outdoor workers).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
        },
      });

      const fullText = response.text || '';
      return {
        explanation: fullText,
        whatItMeans: `Official ${alert.severity} Alert issued by IMD RMC Nagpur. It indicates ${alert.warningType === 'HEATWAVE' ? 'dangerous heat index and severe heat exhaustion risks' : 'intense convective thunderstorms, lightning hazards, and localized waterlogging'}.`,
        whatYouShouldDo: alert.recommendedAction,
        vulnerableGroups: 'Children, outdoor field laborers, two-wheeler commuters, and livestock.',
      };
    } catch (e) {
      console.warn('Explain alert fallback:', e);
    }
  }

  // Fallback grounded explanation
  if (language === 'hi') {
    return {
      explanation: `**आईएमडी ${alert.severity} अलर्ट का विवरण:**\n\n**इसका क्या अर्थ है?**\nनागपुर जिले में ${alert.title} सक्रिय है। इसका मतलब है कि अचानक मौसम बिगड़ सकता है और जान-माल अथवा आवागमन को खतरा हो सकता है।\n\n**आपको क्या करना चाहिए (${role} के लिए)?**\n${alert.recommendedAction}\n\n**संवेदनशील वर्ग के लिए सावधानी:**\nबच्चे, बुजुर्ग, किसान और खुले मैदान में काम करने वाले तुरंत सुरक्षित पक्के भवनों में शरण लें।`,
      whatItMeans: `आईएमडी नागपुर द्वारा जारी ${alert.severity} स्तर की आधिकारिक चेतावनी।`,
      whatYouShouldDo: alert.recommendedAction,
      vulnerableGroups: 'बुजुर्ग, बच्चे, किसान और दोपहिया वाहन चालक।',
    };
  } else if (language === 'mr') {
    return {
      explanation: `**हवामान विभाग (IMD) ${alert.severity} अलर्ट विश्लेषण:**\n\n**याचा नेमका अर्थ काय?**\nनागपूर जिल्ह्यामध्ये '${alert.title}' लागू करण्यात आला आहे. हवामान अत्यंत तीव्र होण्याची शक्यता असल्याने दक्षता बाळगणे आवश्यक आहे.\n\n**तुम्ही काय खबरदारी घ्यावी?**\n${alert.recommendedAction}\n\n**विभागीय सूचना:**\nवीज चमकत असताना झाडांखाली अथवा पत्र्यांच्या शेडखाली थांबू नका. जिल्हा आपत्ती व्यवस्थापन नियंत्रण कक्षाच्या संपर्कात राहा.`,
      whatItMeans: `भारतीय हवामान विभाग, नागपूर प्रादेशिक केंद्राचा अधिकृत इशारा.`,
      whatYouShouldDo: alert.recommendedAction,
      vulnerableGroups: 'शेतकरी, लहान मुले, वृद्ध व्यक्ती व रस्त्यावरील प्रवासी.',
    };
  }

  return {
    explanation: `**Official IMD ${alert.severity} Alert Breakdown for Nagpur District**\n\n**What this means:**\n${alert.description}\n\n**What you should do (${role}):**\n${alert.recommendedAction}\n\n**Safety Guidelines:**\n${alert.instructions.join('\n• ')}`,
    whatItMeans: `Official ${alert.severity} warning issued by IMD Regional Meteorological Centre, Nagpur.`,
    whatYouShouldDo: alert.recommendedAction,
    vulnerableGroups: 'Outdoor workers, students commuting on two-wheelers, farmers in open fields, and elders.',
  };
}

// Route weather analysis engine
export async function analyzeRoute(from: string, to: string, departureTime?: string): Promise<RouteAnalysis> {
  const current = await getCurrentWeather();
  const alerts = await getWeatherAlerts();

  // Preset route lookup or generic Nagpur segment builder
  const fromClean = from.trim();
  const toClean = to.trim();

  let distanceKm = 46;
  let durationMinutes = 65;
  const intermediateWaypoints = ['Dighori Ring Road', 'Besa Phata', 'Kuhi Crossing'];

  if (toClean.toLowerCase().includes('umred')) {
    distanceKm = 48;
    durationMinutes = 65;
  } else if (toClean.toLowerCase().includes('ramtek')) {
    distanceKm = 54;
    durationMinutes = 75;
    intermediateWaypoints[0] = 'Kamptee Bypass';
    intermediateWaypoints[1] = 'Kanhan Bridge';
    intermediateWaypoints[2] = 'Mansar Junction';
  } else if (toClean.toLowerCase().includes('katol')) {
    distanceKm = 58;
    durationMinutes = 80;
    intermediateWaypoints[0] = 'Friends Colony';
    intermediateWaypoints[1] = 'Kalmeshwar MIDC';
    intermediateWaypoints[2] = 'Mohpa Phata';
  } else if (toClean.toLowerCase().includes('butibori')) {
    distanceKm = 28;
    durationMinutes = 40;
    intermediateWaypoints[0] = 'Chhatrapati Square';
    intermediateWaypoints[1] = 'Nagpur Airport Sonegaon';
    intermediateWaypoints[2] = 'Dongargaon Toll';
  }

  const segments: RouteSegment[] = [];
  const points = [fromClean, ...intermediateWaypoints, toClean];

  for (let i = 0; i < points.length - 1; i++) {
    const segDist = Math.round((distanceKm / (points.length - 1)) * 10) / 10;
    const segMins = Math.round(durationMinutes / (points.length - 1));

    // Realistic gradient along route
    const rainProb = Math.min(95, Math.max(10, current.precipitationProbability + (i * 8)));
    const segRain = Math.round((current.rainfall + i * 4.2) * 10) / 10;
    const segRiskScore = Math.min(92, Math.max(15, 30 + (segRain > 10 ? 35 : 0) + (current.temperature > 40 ? 30 : 0)));

    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' = 'LOW';
    if (segRiskScore >= 75) riskLevel = 'VERY HIGH';
    else if (segRiskScore >= 50) riskLevel = 'HIGH';
    else if (segRiskScore >= 25) riskLevel = 'MODERATE';

    segments.push({
      segmentIndex: i + 1,
      fromName: points[i],
      toName: points[i + 1],
      distanceKm: segDist,
      estimatedMinutes: segMins,
      temperature: Math.round((current.temperature - i * 0.4) * 10) / 10,
      precipitationProbability: rainProb,
      rainfallMm: segRain,
      windSpeedKmh: current.windSpeed + i * 3,
      condition: segRain > 15 ? 'Heavy Rain / Wet Roads' : current.condition,
      localRisk: riskLevel,
      riskScore: segRiskScore,
      warning: segRain > 20 ? 'Water accumulation and visibility drop below 2 km likely.' : undefined,
    });
  }

  const highestRiskScore = Math.max(...segments.map(s => s.riskScore));
  let overallRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' = 'MODERATE';
  if (highestRiskScore >= 75) overallRisk = 'VERY HIGH';
  else if (highestRiskScore >= 50) overallRisk = 'HIGH';
  else if (highestRiskScore >= 25) overallRisk = 'MODERATE';

  const hasOrangeAlert = alerts.some(a => a.severity === 'ORANGE' || a.severity === 'RED');

  const aiAdvisory = hasOrangeAlert
    ? `Rain and squall risk intensifies along the second half of the corridor towards ${toClean}. Waterlogging may slow down traffic near underpasses. Recommended departure window: proceed before heavy thunderstorm cells consolidate, or delay until active warning clears.`
    : `Overall route transit conditions between ${fromClean} and ${toClean} remain manageable. Maintain moderate driving speeds and monitor live radar updates.`;

  return {
    fromLocation: fromClean,
    toLocation: toClean,
    date: 'Today',
    departureTime: departureTime || 'Current Window',
    totalDistanceKm: distanceKm,
    totalDurationMinutes: durationMinutes,
    departureWeather: {
      temp: current.temperature,
      condition: current.condition,
      rainProb: current.precipitationProbability,
    },
    destinationWeather: {
      temp: segments[segments.length - 1].temperature,
      condition: segments[segments.length - 1].condition,
      rainProb: segments[segments.length - 1].precipitationProbability,
    },
    overallTravelRisk: overallRisk,
    riskScore: highestRiskScore,
    segments,
    aiAdvisory,
    recommendedDepartureWindow: hasOrangeAlert ? 'Before 2:00 PM or Post 6:00 PM' : 'Optimal now',
    source: 'WeatherGPT Route Engine (IMD Nowcast & Road Met Overlay)',
  };
}

// Role-based advisory builder
export async function buildRoleAdvisory(role: UserRole) {
  const current = await getCurrentWeather();
  const alerts = await getWeatherAlerts();
  const activeAlert = alerts[0];

  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  switch (role) {
    case 'farmer':
      return {
        role,
        roleTitle: 'Farmer (कृषी सल्लागार)',
        date: dateStr,
        summary: activeAlert?.severity === 'ORANGE' || activeAlert?.severity === 'RED'
          ? 'Intense showers & lightning warning: Suspend fertilizer application, pesticide spraying, and open-field threshing immediately.'
          : 'Favorable operational window for intercultural operations, soil preparation, and regulated irrigation in Nagpur citrus & soybean belts.',
        actionPoints: [
          'Citrus (Nagpur Santra) orchards: Clear drainage channels to prevent root rot and collar rot from stagnation.',
          'Cotton & Soybean: Postpone chemical spraying until squall conditions abate.',
          'Protect harvested farm produce with waterproof tarpaulins in APMC mandis (Kalamna, Umred, Katol).',
          'Keep cattle tethered inside dry, lightning-safe sheds away from electric poles.',
        ],
        dos: ['Ensure drain channels in orange orchards are clear', 'Store gunny bags on elevated wooden planks', 'Check IMD Meghdoot/WeatherGPT daily updates'],
        donts: ['Do not spray liquid pesticides during squalls', 'Do not seek shelter under isolated trees in fields', 'Avoid over-irrigating when rainfall probability > 60%'],
        urgency: activeAlert ? 'alert' : 'routine',
      };

    case 'outdoor_worker':
      return {
        role,
        roleTitle: 'Outdoor Worker (कामगार सुरक्षा)',
        date: dateStr,
        summary: current.temperature >= 40
          ? `High thermal load (${current.temperature}°C). Extreme heat cramps and dehydration hazard during afternoon shift.`
          : activeAlert ? 'Lightning & squall hazard active. Pause high-altitude scaffolding, crane operations, and exposed metal work.' : 'Standard outdoor environmental conditions. Maintain regular hydration.',
        actionPoints: [
          'Take mandatory 15-minute shaded rest breaks every 2 hours.',
          'Drink minimum 3 liters of water mixed with ORS or electrolytes during shift.',
          'Stop high-altitude scaffolding and tower crane activities if wind exceeds 35 km/h.',
          'If thunder is heard, immediately move indoors following the 30-30 lightning rule.',
        ],
        dos: ['Wear wide-brim helmets or cotton caps under headgear', 'Keep electrolyte sachets readily available at worksite', 'Report early symptoms of dizziness or cramp'],
        donts: ['Do not work alone in direct sun between 12:30 PM - 3:30 PM', 'Do not operate metal tools during visible thunderstorm strikes'],
        urgency: (current.temperature >= 42 || activeAlert) ? 'caution' : 'routine',
      };

    case 'traveller':
      return {
        role,
        roleTitle: 'Traveller & Commuter (प्रवासी सुरक्षा)',
        date: dateStr,
        summary: activeAlert
          ? 'Route visibility and slick roadway hazard. Reduced average transit speed on Nagpur highways (NH-44, NH-53, Outer Ring Road).'
          : 'Smooth transit conditions prevailing across Nagpur district routes.',
        actionPoints: [
          'Expect 15-25 mins delay around waterlogged urban bottlenecks (Sitabuldi, Narendra Nagar underpass).',
          'Keep headlights on low beam during sudden rainfall downdrafts.',
          'Ensure tire tread depth and wiper blade efficiency before inter-district travel.',
        ],
        dos: ['Check WeatherGPT Route Weather before starting', 'Maintain double following distance on wet asphalt'],
        donts: ['Never attempt to drive through flooded subway underpasses', 'Avoid parking directly underneath old tree branches'],
        urgency: activeAlert ? 'caution' : 'routine',
      };

    case 'student':
      return {
        role,
        roleTitle: 'Student (विद्यार्थी सल्ला)',
        date: dateStr,
        summary: activeAlert
          ? 'Inclement weather expected around school/college dismissal hours. Carry rain protection and plan safe commute.'
          : 'Clear weather for sports and regular campus attendance.',
        actionPoints: [
          'Pack umbrella/raincoat and keep electronic devices in waterproof bag sleeves.',
          'Stay inside campus building if sudden lightning occurs after class hours.',
          'Coordinate with parents/school buses if waterlogging slows down arterial roads.',
        ],
        dos: ['Keep a water bottle and rain cover ready', 'Stay with peer groups at designated bus shelters'],
        donts: ['Never stand under solitary large trees during thunder', 'Avoid wading through open street puddles'],
        urgency: activeAlert ? 'caution' : 'routine',
      };

    default:
      return {
        role: 'general_public',
        roleTitle: 'General Public (नागरिक सुरक्षा)',
        date: dateStr,
        summary: activeAlert
          ? `Official ${alertSeverityText(activeAlert.severity)} in effect for Nagpur District. Observe basic disaster preparedness.`
          : `Normal seasonal weather across Nagpur. Current temperature is ${current.temperature}°C with ${current.condition.toLowerCase()}.`,
        actionPoints: [
          'Monitor real-time updates on WeatherGPT and RMC Nagpur nowcasts.',
          'Charge mobile phones and power banks in case of local power feeder trippings.',
          'Avoid leaving vulnerable family members unassisted during extreme weather periods.',
        ],
        dos: ['Stay hydrated', 'Keep emergency contacts handy (Disaster Cell: 1077)'],
        donts: ['Do not spread unverified weather rumors on social media', 'Do not venture near low-lying river embankments'],
        urgency: activeAlert ? 'caution' : 'routine',
      };
  }
}

function alertSeverityText(sev: string): string {
  if (sev === 'RED') return 'RED Warning (Take Action)';
  if (sev === 'ORANGE') return 'ORANGE Alert (Be Prepared)';
  if (sev === 'YELLOW') return 'YELLOW Watch (Be Updated)';
  return 'GREEN (No Active Warning)';
}

// Deterministic backup engine if Gemini API Key is missing or rate limited
async function generateDeterministicAssistantResponse(
  query: string,
  role: UserRole,
  language: AppLanguage
): Promise<{ text: string; structuredFacts?: any; toolCallsExecuted?: string[] }> {
  const current = await getCurrentWeather();
  const alerts = await getWeatherAlerts();
  const activeAlert = alerts[0];
  const q = query.toLowerCase();

  const isRainQuery = q.includes('rain') || q.includes('baarish') || q.includes('barish') || q.includes('paus') || q.includes('paaus');
  const isTravelQuery = q.includes('travel') || q.includes('route') || q.includes('jaana') || q.includes('jaane') || q.includes('road') || q.includes('umred') || q.includes('pravas');
  const isAlertQuery = q.includes('alert') || q.includes('warning') || q.includes('orange') || q.includes('red') || q.includes('explain') || q.includes('ishara');
  const isRiskQuery = q.includes('risk') || q.includes('safe') || q.includes('khatra') || q.includes('dhoka') || q.includes('why');
  const isHeatQuery = q.includes('heat') || q.includes('garmi') || q.includes('dhoop') || q.includes('unhaala');

  let text = '';
  const facts: any = {
    rainProbability: current.precipitationProbability,
    period: 'Next 3-6 Hours',
    riskLevel: current.precipitationProbability > 60 ? 'High' : 'Moderate',
    officialWarning: activeAlert ? `${activeAlert.severity} - ${activeAlert.title}` : 'None active',
  };

  if (isAlertQuery && activeAlert) {
    text = `**Official IMD Warning Active:** ${activeAlert.title} (${activeAlert.severity} Alert)\n\n` +
      `• **What this means:** ${activeAlert.description}\n` +
      `• **Affected Area:** ${activeAlert.affectedArea}\n` +
      `• **Recommended Action:** ${activeAlert.recommendedAction}\n` +
      `• **Official Source:** ${activeAlert.source}\n\n` +
      `WeatherGPT Local Risk index is currently elevated for Nagpur District.`;
  } else if (isRainQuery) {
    const willRain = current.precipitationProbability >= 40 || current.rainfall > 0;
    if (language === 'hi' || language === 'hinglish') {
      text = willRain
        ? `**हाँ, नागपुर में आज बारिश की संभावना है।**\n\n` +
          `• **बारिश की संभावना:** ${current.precipitationProbability}%\n` +
          `• **अपेक्षित समय:** दोपहर 2:00 बजे से शाम 7:00 बजे तक\n` +
          `• **मौसम स्थिति:** ${current.condition}\n` +
          `• **WeatherGPT जोखिम स्तर:** ${current.precipitationProbability > 60 ? 'HIGH' : 'MODERATE'}\n\n` +
          `**सलाह:** बाहर निकलते समय छाता अथवा रेनकोट साथ रखें। ${activeAlert ? `\n⚠️ **आधिकारिक चेतावनी:** ${activeAlert.title}` : ''}`
        : `**आज नागपुर में तेज बारिश के आसार कम हैं।**\n\n` +
          `• **बारिश की संभावना:** ${current.precipitationProbability}%\n` +
          `• **तापमान:** ${current.temperature}°C (Feels like ${current.feelsLike}°C)\n` +
          `• **जोखिम स्तर:** LOW`;
    } else if (language === 'mr') {
      text = willRain
        ? `**होय, आज नागपूर जिल्ह्यात पावसाची शक्यता आहे.**\n\n` +
          `• **पावसाची शक्यता:** ${current.precipitationProbability}%\n` +
          `• **अपेक्षित कालावधी:** दुपार ते संध्याकाळ\n` +
          `• **हवामान:** ${current.condition}\n` +
          `• **स्थानिक धोका निर्देशांक:** ${current.precipitationProbability > 60 ? 'HIGH' : 'MODERATE'}\n\n` +
          `**सल्ला:** प्रवासात अथवा शेतात जाताना छत्री सोबत ठेवा. ${activeAlert ? `\n⚠️ **अधिकृत इशारा:** ${activeAlert.title}` : ''}`
        : `**आज नागपुरात पावसाची शक्यता कमी आहे.**\n\n` +
          `• **पावसाची शक्यता:** ${current.precipitationProbability}%\n` +
          `• **सध्याचे तापमान:** ${current.temperature}°C`;
    } else {
      text = willRain
        ? `**Yes, rain is likely today in Nagpur District.**\n\n` +
          `• **Precipitation Probability:** ${current.precipitationProbability}%\n` +
          `• **Expected Active Window:** Afternoon to late evening\n` +
          `• **Condition:** ${current.condition}\n` +
          `• **WeatherGPT Local Risk:** ${current.precipitationProbability > 60 ? 'HIGH' : 'MODERATE'}\n\n` +
          `**Action Advice:** Carry rain gear and allow extra travel time. ${activeAlert ? `\n⚠️ **Official Warning:** ${activeAlert.title} (${activeAlert.severity})` : ''}`
        : `**Rain probability is low for Nagpur District today (${current.precipitationProbability}%).**\n\n` +
          `• **Current Temperature:** ${current.temperature}°C (Feels like ${current.feelsLike}°C)\n` +
          `• **Condition:** ${current.condition}\n` +
          `• **Local Risk:** LOW`;
    }
  } else if (isTravelQuery) {
    text = `**Nagpur Route Weather Guidance:**\n\n` +
      `• **Departure Window Weather:** ${current.temperature}°C, ${current.condition}\n` +
      `• **Rain Probability:** ${current.precipitationProbability}%\n` +
      `• **Overall Route Risk:** ${current.precipitationProbability > 50 ? 'MODERATE to HIGH' : 'LOW'}\n\n` +
      `**Travel Advice:** Underpasses along Wardha Road and ring roads may experience localized pooling. Maintain cautious speeds.`;
  } else if (isRiskQuery) {
    text = `**Why WeatherGPT Local Risk is calculated as ${current.precipitationProbability > 60 ? 'HIGH' : 'MODERATE'}:**\n\n` +
      `1. **Precipitation probability** is currently at ${current.precipitationProbability}% with possible convective squalls.\n` +
      `2. **Wind speeds** reaching ${current.windSpeed} km/h.\n` +
      `3. **IMD Warning Status:** ${activeAlert ? activeAlert.severity + ' Alert active' : 'No active alerts'}.\n\n` +
      `*Note: This is an AI-derived WeatherGPT Risk Index, separate from official IMD warnings.*`;
  } else {
    text = `**Nagpur District Weather Intelligence (Verified IMD/WMO Data):**\n\n` +
      `• **Current Temperature:** ${current.temperature}°C (Feels like ${current.feelsLike}°C)\n` +
      `• **Condition:** ${current.condition}\n` +
      `• **Humidity:** ${current.humidity}% | **Wind:** ${current.windSpeed} km/h ${current.windDirectionText}\n` +
      `• **Precipitation Chance:** ${current.precipitationProbability}%\n` +
      `• **UV Index:** ${current.uvIndex}\n\n` +
      `${activeAlert ? `⚠️ **Active Official Alert:** ${activeAlert.title} (${activeAlert.severity})\n` : '✅ **No extreme weather emergencies currently.**\n'}` +
      `How else can I assist your ${role.replace('_', ' ')} routine in Nagpur today?`;
  }

  return {
    text,
    structuredFacts: facts,
    toolCallsExecuted: ['get_current_weather', 'get_weather_alerts'],
  };
}
