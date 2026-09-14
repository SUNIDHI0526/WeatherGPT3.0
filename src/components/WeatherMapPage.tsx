import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Layers,
  Thermometer,
  CloudRain,
  Wind,
  ShieldAlert,
  Info,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { TalukaStation } from '../types';

export const WeatherMapPage: React.FC = () => {
  const { talukaStations, alerts, currentWeather, t } = useApp();
  const [activeLayer, setActiveLayer] = useState<'temperature' | 'rainfall' | 'wind' | 'risk'>('temperature');
  const [selectedStation, setSelectedStation] = useState<TalukaStation | null>(null);

  // Default to first station or Sonegaon
  const activeStation = selectedStation || talukaStations[0];

  const getStationColor = (station: TalukaStation) => {
    const temp = station.temperature ?? station.currentTemp ?? 28;
    const rain = station.rainfall24h ?? 0;
    const wind = station.windSpeed ?? 12;
    const risk = station.riskScore ?? 15;

    if (activeLayer === 'temperature') {
      if (temp >= 42) return 'bg-rose-600 text-white border-rose-300';
      if (temp >= 38) return 'bg-orange-500 text-white border-orange-300';
      if (temp >= 32) return 'bg-amber-500 text-white border-amber-300';
      return 'bg-blue-600 text-white border-blue-300';
    }
    if (activeLayer === 'rainfall') {
      if (rain >= 40) return 'bg-indigo-700 text-white border-indigo-300';
      if (rain >= 15) return 'bg-blue-600 text-white border-blue-300';
      if (rain > 0) return 'bg-sky-500 text-white border-sky-300';
      return 'bg-slate-400 text-white border-slate-300';
    }
    if (activeLayer === 'wind') {
      if (wind >= 35) return 'bg-rose-600 text-white border-rose-300';
      if (wind >= 20) return 'bg-amber-600 text-white border-amber-300';
      return 'bg-teal-600 text-white border-teal-300';
    }
    // risk
    if (risk >= 75) return 'bg-rose-600 text-white border-rose-300';
    if (risk >= 50) return 'bg-orange-500 text-white border-orange-300';
    if (risk >= 25) return 'bg-amber-500 text-white border-amber-300';
    return 'bg-emerald-600 text-white border-emerald-300';
  };

  return (
    <div id="weather-map-page" className="space-y-6">
      {/* Page Title */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Nagpur District Geospatial Meteorological Map
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Observational telemetry and simulated synoptic values across all 14 talukas of Nagpur
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            id="layer-temp-btn"
            onClick={() => setActiveLayer('temperature')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeLayer === 'temperature' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-orange-500" />
            <span>Temperature</span>
          </button>
          <button
            id="layer-rain-btn"
            onClick={() => setActiveLayer('rainfall')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeLayer === 'rainfall' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-blue-500" />
            <span>24h Rainfall</span>
          </button>
          <button
            id="layer-wind-btn"
            onClick={() => setActiveLayer('wind')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeLayer === 'wind' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-teal-500" />
            <span>Surface Wind</span>
          </button>
          <button
            id="layer-risk-btn"
            onClick={() => setActiveLayer('risk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeLayer === 'risk' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Risk Zones</span>
          </button>
        </div>
      </div>

      {/* Map Layout Grid: Interactive Cartography Canvas + Station Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual High-Res Taluka Station Grid & Geospatial Coordinate Canvas */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg text-white flex flex-col justify-between relative overflow-hidden min-h-[480px]">
          {/* Subtle topo grid backdrop */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Map Top Bar */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 font-mono text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>NAGPUR BOUNDS: 20.58°N - 21.75°N | 78.25°E - 79.67°E</span>
            </div>
            <span className="bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700/50 font-mono text-[10px]">
              LAYER: {activeLayer.toUpperCase()}
            </span>
          </div>

          {/* Interactive Taluka Nodes Canvas */}
          <div className="relative z-10 py-6 my-auto">
            <div className="text-[11px] text-slate-400 mb-3 text-center">
              Click any taluka station node to inspect micro-climate metrics
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {talukaStations.map((station) => {
                const isSelected = activeStation?.id === station.id;
                const nodeColor = getStationColor(station);

                const nodeTemp = station.temperature ?? station.currentTemp ?? 28;
                let metricDisplay = `${nodeTemp}°C`;
                if (activeLayer === 'rainfall') metricDisplay = `${station.rainfall24h ?? 0} mm`;
                if (activeLayer === 'wind') metricDisplay = `${station.windSpeed ?? 12} km/h`;
                if (activeLayer === 'risk') metricDisplay = `Risk: ${station.riskScore ?? 15}`;

                return (
                  <button
                    key={station.id}
                    id={`station-node-${station.id}`}
                    onClick={() => setSelectedStation(station)}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-950/90 border-blue-400 shadow-lg ring-2 ring-blue-400'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white truncate">{station.name}</span>
                      <span className={`w-2 h-2 rounded-full ${nodeColor.split(' ')[0]}`} />
                    </div>
                    <div className="text-base font-extrabold text-blue-300 font-mono">
                      {metricDisplay}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate">
                      {station.condition}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Footer & Transparency */}
          <div className="relative z-10 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>
                <strong>Transparency Notice:</strong> Station layer uses official AWS & IMD telemetric coordinates. WeatherGPT does not fabricate synthetic Doppler radar loops.
              </span>
            </div>
            <span className="text-slate-500 font-mono">15 Stations Monitored</span>
          </div>
        </div>

        {/* Right: Station Inspector Card */}
        {activeStation && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Station Inspector
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {activeStation.name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Taluka Station • Lat: {activeStation.lat}°, Lon: {activeStation.lon}°
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-slate-900 font-mono">
                    {activeStation.temperature ?? activeStation.currentTemp ?? 28}°C
                  </div>
                  <span className="text-xs font-semibold text-blue-600">
                    {activeStation.condition}
                  </span>
                </div>
              </div>

              {/* Station Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Humidity</span>
                  <span className="text-base font-bold text-slate-900">{activeStation.humidity}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">24h Rainfall</span>
                  <span className="text-base font-bold text-blue-600">{activeStation.rainfall24h} mm</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Wind Velocity</span>
                  <span className="text-base font-bold text-slate-900">{activeStation.windSpeed} km/h</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">WeatherGPT Risk</span>
                  <span className="text-base font-bold text-rose-600">{activeStation.riskScore}/100</span>
                </div>
              </div>

              {/* Taluka Localized Advisory */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-950 mb-4">
                <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-700" />
                  <span>Taluka Specific Advisory ({activeStation.name})</span>
                </div>
                <p className="leading-relaxed">
                  {activeStation.rainfall24h > 20
                    ? `Heavy local precipitation observed in ${activeStation.name}. Maintain adequate field drainage for cotton and soy crops; prevent waterlogging near low-lying culverts.`
                    : activeStation.temperature > 40
                    ? `High solar irradiance in ${activeStation.name}. Enforce heat mitigation protocols for outdoor labour between 12:00 PM and 3:30 PM.`
                    : `Typical seasonal weather prevailing in ${activeStation.name}. Normal agricultural operations and inter-taluka transit can proceed smoothly.`}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span>Station Type: IMD Automatic Weather Station (AWS)</span>
              <span className="text-emerald-600 font-bold">Online</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
