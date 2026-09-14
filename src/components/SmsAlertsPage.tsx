import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquareShare,
  Smartphone,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Loader2,
  Sparkles,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { NAGPUR_TALUKAS } from '../data/nagpurData';

export const SmsAlertsPage: React.FC = () => {
  const { phoneNumber, setPhoneNumber, userRole, alerts, currentWeather, t } = useApp();
  const [selectedTaluka, setSelectedTaluka] = useState<string>('Nagpur Urban');
  const [receiveExtremeAlerts, setReceiveExtremeAlerts] = useState<boolean>(true);
  const [receiveDailyBulletins, setReceiveDailyBulletins] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // SMS logs
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
  const [latestSmsPreview, setLatestSmsPreview] = useState<string>(
    `IMD-RMC NAGPUR ALERT: Orange Warning for Thunderstorm with lightning and gusty winds (45 km/h) valid till 20:00 IST for Nagpur, Hingna, Umred. Avoid open fields. - WeatherGPT Helpline: 1077`
  );

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/notifications/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
        if (data.length > 0) {
          setLatestSmsPreview(data[0].message);
        }
      }
    } catch (e) {
      console.error('Failed to load SMS logs:', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          taluka: selectedTaluka,
          role: userRole,
          language: 'en',
          preferences: {
            extremeAlerts: receiveExtremeAlerts,
            dailyBulletin: receiveDailyBulletins,
            routeUpdates: true,
          },
        }),
      });
      setIsSubscribed(true);
      await fetchLogs();
    } catch (err) {
      console.error('Failed to subscribe:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerTestSms = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLatestSmsPreview(data.previewText);
        await fetchLogs();
      }
    } catch (err) {
      console.error('Failed to send test SMS:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="sms-alerts-page" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareShare className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Disaster SMS Early Warning System & Simulation
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mission-critical cellular broadcast for rural farmers, panchayats, and feature phone users in Nagpur
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>SMS GATEWAY READY (SIMULATION + REST)</span>
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout: Form & Phone Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Subscription Management */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Automated Cellular Weather Warning Dispatch
            </h3>
            <p className="text-xs text-slate-500">
              Dispatches SMS alerts with zero internet requirement to verified mobile numbers in Nagpur District.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Mobile Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="tel"
                  id="sms-phone-input"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98230 XXXXX"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Target Taluka / Local Block
              </label>
              <select
                id="sms-taluka-select"
                value={selectedTaluka}
                onChange={(e) => setSelectedTaluka(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {NAGPUR_TALUKAS.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.marathiName})
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Checkboxes */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Broadcast Channels
              </span>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={receiveExtremeAlerts}
                  onChange={(e) => setReceiveExtremeAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300"
                />
                <div>
                  <span className="font-semibold block">Severe Weather & Flash Flood Dispatches</span>
                  <span className="text-[11px] text-slate-400">Immediate SMS when Orange or Red alert is declared</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={receiveDailyBulletins}
                  onChange={(e) => setReceiveDailyBulletins(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300"
                />
                <div>
                  <span className="font-semibold block">Morning Agro-Met Summary (06:00 AM)</span>
                  <span className="text-[11px] text-slate-400">Daily temperature, rain probability, and spraying advisories</span>
                </div>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                id="save-sms-sub-btn"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Notification Settings</span>
              </button>

              <button
                type="button"
                id="trigger-demo-sms-btn"
                onClick={handleTriggerTestSms}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-amber-400" />
                )}
                <span>Trigger DEMO SMS Dispatch</span>
              </button>
            </div>
          </form>

          {/* Compliance note */}
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Complies with TRAI DLT Guidelines and NDMA public safety cell broadcast standards.
            </span>
          </div>
        </div>

        {/* Right Column: Realistic Mobile Phone Preview Simulator */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full max-w-[320px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-700 relative">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900 mr-2" />
              <div className="w-8 h-1.5 bg-slate-700 rounded-full" />
            </div>

            {/* Screen */}
            <div className="bg-slate-100 rounded-[28px] overflow-hidden flex flex-col h-[460px]">
              {/* Phone Status Bar */}
              <div className="bg-slate-200 px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-600 font-semibold">
                <span>14:32</span>
                <div className="flex items-center gap-1">
                  <span>JIO 4G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* SMS App Header */}
              <div className="bg-white p-3 border-b border-slate-200 flex items-center gap-2 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  IMD
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">VK-WGPTNGP</div>
                  <div className="text-[10px] text-slate-400">Govt of India / WeatherGPT</div>
                </div>
              </div>

              {/* Message Bubble Container */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-100 flex flex-col justify-end">
                <div className="text-[10px] text-center text-slate-400 font-semibold my-1">
                  Today • Official Early Warning
                </div>

                <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs shadow-sm border border-slate-200 text-xs text-slate-800 leading-relaxed max-w-[90%]">
                  <div className="font-bold text-blue-900 text-[11px] mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>EMERGENCY BROADCAST</span>
                  </div>
                  <p className="text-[11px] whitespace-pre-wrap font-sans">
                    {latestSmsPreview}
                  </p>
                  <div className="text-[9px] text-slate-400 text-right mt-2">
                    Delivered • Cellular SIM
                  </div>
                </div>
              </div>

              {/* Fake SMS Input bar */}
              <div className="bg-white p-2 border-t border-slate-200 text-[11px] text-slate-400 px-3 flex items-center justify-between">
                <span>No reply • Broadcast only</span>
                <Smartphone className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Bottom bar indicator */}
            <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-2" />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-medium">
            Live Preview of SMS delivery on recipient phone
          </span>
        </div>
      </div>

      {/* SMS Transmission Audit Log */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Cellular Alert Transmission History & Outbox Log</span>
          </h3>

          <button
            onClick={fetchLogs}
            disabled={loadingLogs}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Dispatch Time</th>
                <th className="py-2.5 px-3">Recipient</th>
                <th className="py-2.5 px-3">Message Body</th>
                <th className="py-2.5 px-3">Gateway Status</th>
                <th className="py-2.5 px-3">Carrier Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {log.phoneNumber}
                  </td>
                  <td className="py-2.5 px-3 max-w-md truncate text-[11px]">
                    {log.message}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      DELIVERED
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-400 whitespace-nowrap font-mono">
                    {log.simulated ? 'DEMO_SIMULATOR' : 'SMPP_LIVE'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
