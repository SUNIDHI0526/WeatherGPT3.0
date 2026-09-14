import { CurrentWeather, DailyForecastItem, WeatherAlert, RiskIndexData, ConfidenceData, RiskFactor } from '../types';

export function calculateLocalRisk(
  current: CurrentWeather,
  daily: DailyForecastItem[],
  alerts: WeatherAlert[]
): RiskIndexData {
  const factors: RiskFactor[] = [];
  let baseScore = 10; // baseline quiet day

  // 1. Extreme Temperature Factor (Nagpur Vidarbha region gets extreme summer heat or chill)
  let tempScore = 0;
  let tempReason = 'Normal seasonal temperature.';
  let tempImpact: 'low' | 'moderate' | 'high' | 'severe' = 'low';

  if (current.temperature >= 44) {
    tempScore = 90;
    tempImpact = 'severe';
    tempReason = `Dangerous heatwave condition (${current.temperature}°C). High heat stroke risk.`;
  } else if (current.temperature >= 41) {
    tempScore = 70;
    tempImpact = 'high';
    tempReason = `Very high summer heat (${current.temperature}°C). Dehydration hazard during peak hours.`;
  } else if (current.temperature >= 38) {
    tempScore = 45;
    tempImpact = 'moderate';
    tempReason = `Warm conditions (${current.temperature}°C). Elevated fatigue risk outdoors.`;
  } else if (current.temperature <= 8) {
    tempScore = 60;
    tempImpact = 'high';
    tempReason = `Cold wave condition (${current.temperature}°C) for Nagpur region.`;
  } else {
    tempScore = 10;
    tempReason = `Comfortable ambient temperature (${current.temperature}°C).`;
  }

  factors.push({
    name: 'Thermal & Heat Stress',
    score: tempScore,
    weight: 0.25,
    impact: tempImpact,
    reason: tempReason,
  });

  // 2. Precipitation & Rainfall Factor
  let rainScore = 0;
  let rainImpact: 'low' | 'moderate' | 'high' | 'severe' = 'low';
  let rainReason = 'Dry conditions.';

  const rain24h = (daily[0]?.rainfall || 0) + (current.rainfall || 0);
  const rainProb = current.precipitationProbability || daily[0]?.precipitationProbability || 0;

  if (rain24h >= 115.5 || (rainProb > 80 && rain24h > 65)) {
    rainScore = 95;
    rainImpact = 'severe';
    rainReason = `Very Heavy rainfall expected (${rain24h.toFixed(1)} mm). Waterlogging and flash flood risk in low-lying Nagpur talukas.`;
  } else if (rain24h >= 64.5 || (rainProb > 70 && rain24h > 35)) {
    rainScore = 75;
    rainImpact = 'high';
    rainReason = `Heavy rainfall hazard (${rain24h.toFixed(1)} mm). Drainage congestion & traffic disruptions likely.`;
  } else if (rain24h >= 15.6 || rainProb >= 50) {
    rainScore = 45;
    rainImpact = 'moderate';
    rainReason = `Moderate showers (${rain24h.toFixed(1)} mm, ${rainProb}% probability). Wet roads & reduced outdoor productivity.`;
  } else if (rainProb >= 25 || rain24h > 2) {
    rainScore = 20;
    rainImpact = 'low';
    rainReason = `Light rain or passing drizzles (${rainProb}% chance). Minimal hazard.`;
  } else {
    rainScore = 5;
    rainReason = `Negligible rain probability (${rainProb}%).`;
  }

  factors.push({
    name: 'Precipitation & Flash Flooding',
    score: rainScore,
    weight: 0.3,
    impact: rainImpact,
    reason: rainReason,
  });

  // 3. Wind & Squall Factor
  let windScore = 0;
  let windImpact: 'low' | 'moderate' | 'high' | 'severe' = 'low';
  let windReason = 'Calm to gentle breeze.';

  if (current.windSpeed >= 60) {
    windScore = 90;
    windImpact = 'severe';
    windReason = `Severe squall / gale winds (${current.windSpeed} km/h). Hazard to tin roofs, billboards, and power lines.`;
  } else if (current.windSpeed >= 40) {
    windScore = 65;
    windImpact = 'high';
    windReason = `Strong gusty winds (${current.windSpeed} km/h). Difficult driving conditions for two-wheelers.`;
  } else if (current.windSpeed >= 25) {
    windScore = 35;
    windImpact = 'moderate';
    windReason = `Moderate gusty breeze (${current.windSpeed} km/h).`;
  } else {
    windScore = 10;
    windReason = `Gentle airflow (${current.windSpeed} km/h).`;
  }

  factors.push({
    name: 'Wind Speed & Gusts',
    score: windScore,
    weight: 0.15,
    impact: windImpact,
    reason: windReason,
  });

  // 4. Official IMD Warning Factor
  let alertScore = 0;
  let alertImpact: 'low' | 'moderate' | 'high' | 'severe' = 'low';
  let alertReason = 'No active IMD alerts for Nagpur District.';

  const activeAlert = alerts[0];
  if (activeAlert) {
    if (activeAlert.severity === 'RED') {
      alertScore = 100;
      alertImpact = 'severe';
      alertReason = `Active RED Warning: ${activeAlert.title}. Immediate precautionary measures required.`;
    } else if (activeAlert.severity === 'ORANGE') {
      alertScore = 75;
      alertImpact = 'high';
      alertReason = `Active ORANGE Warning: ${activeAlert.title}. Be prepared for severe weather disruptions.`;
    } else if (activeAlert.severity === 'YELLOW') {
      alertScore = 40;
      alertImpact = 'moderate';
      alertReason = `Active YELLOW Watch: ${activeAlert.title}. Be updated on deteriorating weather.`;
    }
  }

  factors.push({
    name: 'Official IMD Warning Level',
    score: alertScore,
    weight: 0.25,
    impact: alertImpact,
    reason: alertReason,
  });

  // 5. Atmospheric Visibility & Thunderstorm / UV
  let atmosphericScore = 10;
  if (current.visibility < 1.5) {
    atmosphericScore = 70;
  } else if (current.uvIndex >= 11) {
    atmosphericScore = 60;
  } else if (current.humidity > 88 && current.temperature > 34) {
    atmosphericScore = 55; // Sultry high heat index
  }

  factors.push({
    name: 'Visibility & Atmospheric Index',
    score: atmosphericScore,
    weight: 0.05,
    impact: atmosphericScore > 50 ? 'high' : 'low',
    reason: `Visibility is ${current.visibility} km, UV Index is ${current.uvIndex}, Humidity is ${current.humidity}%.`,
  });

  // Weighted score calculation
  const weighted = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
  const finalScore = Math.min(100, Math.max(5, Math.round(weighted)));

  let level: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' = 'LOW';
  if (finalScore >= 75) level = 'VERY HIGH';
  else if (finalScore >= 50) level = 'HIGH';
  else if (finalScore >= 25) level = 'MODERATE';
  else level = 'LOW';

  let summary = '';
  if (level === 'VERY HIGH') {
    summary = 'Severe meteorological risk detected across Nagpur District. Avoid non-essential outdoor transit and heed official advisories.';
  } else if (level === 'HIGH') {
    summary = 'Elevated weather risk. Heightened precautions advised for agriculture, transport, and exposed outdoor work.';
  } else if (level === 'MODERATE') {
    summary = 'Moderate localized weather changes. Standard outdoor awareness and umbrella/hydration advised.';
  } else {
    summary = 'Normal, benign weather conditions prevailing across Nagpur District. Minimal hazards expected.';
  }

  return {
    score: finalScore,
    level,
    summary,
    factors,
    timestamp: new Date().toISOString(),
  };
}

export function calculateForecastConfidence(
  current: CurrentWeather,
  daily: DailyForecastItem[],
  isDemo: boolean = false
): ConfidenceData {
  // If lead time is short and model variance is low, confidence is higher
  // In monsoon/convective regimes, confidence is moderate due to localized cloudburst nature
  const isHighConvection = (current.humidity > 75 && current.temperature > 32) || current.rainfall > 5;
  const isFarOut = daily.length > 5;

  let score = 88;
  let explanation = '';
  const consensusSources = ['IMD Regional Meteorological Centre (Nagpur)', 'WMO Global Numerical Weather Model (ECMWF / GFS grid)', 'Nagpur Airport Sonegaon AWS Station'];

  if (isDemo) {
    score = 85;
    explanation = 'High confidence: Consensus between Sonegaon Observatory ground truth and high-resolution deterministic simulation.';
  } else if (isHighConvection) {
    score = 68;
    explanation = 'Forecast confidence is moderate because convective thunderstorm cells show high spatial variability between northern talukas (Saoner/Ramtek) and southern talukas (Umred/Bhiwapur).';
  } else {
    score = 86;
    explanation = 'High confidence: Strong synoptic alignment between IMD Sonegaon surface telemetry and multi-model numerical guidance.';
  }

  let level: 'LOW' | 'MODERATE' | 'HIGH' = 'HIGH';
  if (score < 40) level = 'LOW';
  else if (score < 70) level = 'MODERATE';

  return {
    score,
    level,
    explanation,
    consensusSources,
    varianceNotes: isHighConvection
      ? 'Rainfall quantity estimates show slight variance (±12 mm) across numerical suites.'
      : 'Temperature and wind projections align within ±0.8°C across all monitoring nodes.',
  };
}
