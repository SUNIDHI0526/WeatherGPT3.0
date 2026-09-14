import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  getCurrentWeather,
  getHourlyForecast,
  getDailyForecast,
  getWeatherAlerts,
  getTalukaStationsData,
  setDemoScenario,
  getDemoScenario,
  DemoScenario,
} from './src/server/weatherService';
import { calculateLocalRisk, calculateForecastConfidence } from './src/server/riskEngine';
import {
  processChatWithGemini,
  explainAlertWithGemini,
  analyzeRoute,
  buildRoleAdvisory,
} from './src/server/geminiService';
import {
  getSubscribers,
  saveSubscription,
  removeSubscription,
  getSmsLogs,
  sendOrSimulateSms,
  generateSmsAlertText,
} from './src/server/smsService';
import { NAGPUR_CLIMATE_NORMALS, NAGPUR_DISTRICT_CONFIG } from './src/data/nagpurData';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ---------------- API ROUTES ----------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'WeatherGPT Nagpur Weather & Disaster AI',
      district: 'Nagpur, Maharashtra',
      timestamp: new Date().toISOString(),
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Current weather
  app.get('/api/weather/current', async (req, res) => {
    try {
      const force = req.query.refresh === 'true';
      const data = await getCurrentWeather(force);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve current weather', details: err.message });
    }
  });

  // Hourly forecast
  app.get('/api/weather/hourly', async (req, res) => {
    try {
      const force = req.query.refresh === 'true';
      const data = await getHourlyForecast(force);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve hourly forecast', details: err.message });
    }
  });

  // Daily forecast (7-day)
  app.get('/api/weather/daily', async (req, res) => {
    try {
      const force = req.query.refresh === 'true';
      const data = await getDailyForecast(force);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve daily forecast', details: err.message });
    }
  });

  // Official IMD weather alerts
  app.get('/api/weather/alerts', async (req, res) => {
    try {
      const force = req.query.refresh === 'true';
      const data = await getWeatherAlerts(force);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve alerts', details: err.message });
    }
  });

  // Weather map taluka station nodes
  app.get('/api/weather/map', async (req, res) => {
    try {
      const stations = await getTalukaStationsData();
      res.json({
        district: NAGPUR_DISTRICT_CONFIG.district,
        state: NAGPUR_DISTRICT_CONFIG.state,
        center: { lat: NAGPUR_DISTRICT_CONFIG.lat, lon: NAGPUR_DISTRICT_CONFIG.lon },
        stations,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve map nodes', details: err.message });
    }
  });

  // Rainfall summary
  app.get('/api/weather/rainfall', async (req, res) => {
    try {
      const current = await getCurrentWeather();
      const daily = await getDailyForecast();
      const talukas = await getTalukaStationsData();

      const totalDistrictAvg = talukas.reduce((sum, t) => sum + (t.rainfall24h || 0), 0) / talukas.length;

      res.json({
        district: 'Nagpur',
        currentObservedMm: current.rainfall,
        todayExpectedMm: daily[0]?.rainfall || 0,
        districtAverage24hMm: Math.round(totalDistrictAvg * 10) / 10,
        talukaDistribution: talukas.map(t => ({
          taluka: t.name,
          rainfallMm: t.rainfall24h,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve rainfall metrics', details: err.message });
    }
  });

  // Climate and historical normals
  app.get('/api/weather/history', (req, res) => {
    res.json({
      district: 'Nagpur District, Maharashtra',
      source: 'IMD Climatological Normals (30-Year Baseline 1991-2020)',
      monthlyNormals: NAGPUR_CLIMATE_NORMALS,
    });
  });

  // WeatherGPT Local Risk Index
  app.get('/api/weather/risk', async (req, res) => {
    try {
      const current = await getCurrentWeather();
      const daily = await getDailyForecast();
      const alerts = await getWeatherAlerts();
      const risk = calculateLocalRisk(current, daily, alerts);
      res.json(risk);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to compute risk index', details: err.message });
    }
  });

  // Forecast Confidence
  app.get('/api/weather/confidence', async (req, res) => {
    try {
      const current = await getCurrentWeather();
      const daily = await getDailyForecast();
      const confidence = calculateForecastConfidence(current, daily, current.isDemo);
      res.json(confidence);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to compute confidence', details: err.message });
    }
  });

  // Conversational Chat with Gemini (with tool calling)
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history, role, language } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await processChatWithGemini({
        message,
        history,
        role: role || 'general_public',
        language: language || 'en',
      });

      res.json(response);
    } catch (err: any) {
      res.status(500).json({ error: 'Chat processing error', details: err.message });
    }
  });

  // "Explain My Alert" endpoint
  app.post('/api/chat/explain-alert', async (req, res) => {
    try {
      const { alertId, role, language } = req.body;
      const explanation = await explainAlertWithGemini(alertId, role, language);
      res.json(explanation);
    } catch (err: any) {
      res.status(500).json({ error: 'Alert explanation failed', details: err.message });
    }
  });

  // Route weather analysis
  app.post('/api/route/analyze', async (req, res) => {
    try {
      const { fromLocation, toLocation, departureTime } = req.body;
      if (!fromLocation || !toLocation) {
        return res.status(400).json({ error: 'fromLocation and toLocation are required' });
      }

      const analysis = await analyzeRoute(fromLocation, toLocation, departureTime);
      res.json(analysis);
    } catch (err: any) {
      res.status(500).json({ error: 'Route analysis failed', details: err.message });
    }
  });

  // Personalized Advisory
  app.get('/api/advisory', async (req, res) => {
    try {
      const role = (req.query.role as any) || 'general_public';
      const advisory = await buildRoleAdvisory(role);
      res.json(advisory);
    } catch (err: any) {
      res.status(500).json({ error: 'Advisory generation failed', details: err.message });
    }
  });

  // SMS Alerts Management
  app.get('/api/notifications/subscribers', (req, res) => {
    res.json(getSubscribers());
  });

  app.post('/api/notifications/subscribe', (req, res) => {
    try {
      const sub = req.body;
      if (!sub?.phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
      }
      saveSubscription({
        ...sub,
        verified: true,
        subscribedAt: new Date().toISOString(),
      });
      res.json({ success: true, message: 'Subscribed to WeatherGPT alerts' });
    } catch (err: any) {
      res.status(500).json({ error: 'Subscription failed', details: err.message });
    }
  });

  app.post('/api/notifications/unsubscribe', (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'Phone number required' });
    removeSubscription(phoneNumber);
    res.json({ success: true, message: 'Unsubscribed successfully' });
  });

  app.get('/api/notifications/logs', (req, res) => {
    res.json(getSmsLogs());
  });

  // Trigger DEMO or REAL test SMS
  app.post('/api/notifications/test', async (req, res) => {
    try {
      const { phoneNumber, customText } = req.body;
      const targetPhone = phoneNumber || '+91 98230 12345';
      const alerts = await getWeatherAlerts();
      const current = await getCurrentWeather();

      const messageText = customText || (alerts[0] ? generateSmsAlertText(alerts[0], current) : 'WeatherGPT Alert [Nagpur]: Current weather is 28°C with light breeze. No active emergency warnings.');

      const result = await sendOrSimulateSms(targetPhone, messageText, 'TEST_ALERT', true);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Test SMS trigger failed', details: err.message });
    }
  });

  // Demo Scenario Toggle
  app.get('/api/demo/scenario', (req, res) => {
    res.json({ scenario: getDemoScenario() });
  });

  app.post('/api/demo/scenario', (req, res) => {
    const { scenario } = req.body;
    if (['monsoon_thunderstorm', 'summer_heatwave', 'pleasant_winter', 'none'].includes(scenario)) {
      setDemoScenario(scenario as DemoScenario);
      res.json({ success: true, currentScenario: scenario });
    } else {
      res.status(400).json({ error: 'Invalid scenario name' });
    }
  });

  // ---------------- VITE MIDDLEWARE / STATIC ----------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WeatherGPT server listening on port ${PORT}`);
  });
}

startServer();
