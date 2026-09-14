import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Sparkles,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Info,
} from 'lucide-react';
import { WeatherAlert } from '../types';

interface ExplainAlertModalProps {
  alert: WeatherAlert;
  onClose: () => void;
}

export const ExplainAlertModal: React.FC<ExplainAlertModalProps> = ({ alert, onClose }) => {
  const { userRole, language, autoVoiceReplies } = useApp();
  const [loading, setLoading] = useState<boolean>(true);
  const [explanationData, setExplanationData] = useState<{
    explanation: string;
    whatItMeans: string;
    whatYouShouldDo: string;
    vulnerableGroups: string;
  } | null>(null);

  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchExplanation() {
      setLoading(true);
      try {
        const res = await fetch('/api/chat/explain-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alertId: alert.id,
            role: userRole,
            language,
          }),
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setExplanationData(data);

          if (autoVoiceReplies) {
            handleSpeak(data.explanation || data.whatItMeans);
          }
        }
      } catch (err) {
        console.error('Failed to explain alert:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchExplanation();

    return () => {
      isMounted = false;
      window.speechSynthesis?.cancel();
    };
  }, [alert.id, userRole, language]);

  const handleSpeak = (text: string) => {
    if (!window.speechSynthesis) return;

    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#•]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Set voice language
    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'mr') utterance.lang = 'mr-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingVoice(false);
    utterance.onerror = () => setIsPlayingVoice(false);

    setIsPlayingVoice(true);
    window.speechSynthesis.speak(utterance);
  };

  const severityColor =
    alert.severity === 'RED'
      ? 'bg-rose-600'
      : alert.severity === 'ORANGE'
      ? 'bg-orange-600'
      : alert.severity === 'YELLOW'
      ? 'bg-amber-600'
      : 'bg-emerald-600';

  return (
    <div
      id="explain-alert-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${severityColor}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Explain My Alert
                </span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" /> Gemini AI
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {alert.title}
              </h3>
            </div>
          </div>

          <button
            id="close-explain-alert-btn"
            onClick={() => {
              window.speechSynthesis?.cancel();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700 leading-relaxed">
          {/* Official Details summary */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Official IMD Warning Record
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400">Severity: </span>
                <strong className="text-slate-900">{alert.severity}</strong>
              </div>
              <div>
                <span className="text-slate-400">Area: </span>
                <strong className="text-slate-900 truncate block">{alert.affectedArea}</strong>
              </div>
              <div>
                <span className="text-slate-400">Period: </span>
                <strong className="text-slate-900">{alert.startTime} – {alert.endTime}</strong>
              </div>
              <div>
                <span className="text-slate-400">Source: </span>
                <strong className="text-slate-900">{alert.source}</strong>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <div className="font-bold text-slate-800 text-sm">
                Generating Plain-Language Weather Explanation...
              </div>
              <div className="text-slate-400 text-xs mt-1">
                Grounded strictly in IMD meteorological observations
              </div>
            </div>
          ) : (
            explanationData && (
              <div className="space-y-4">
                {/* Voice Read-aloud button */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-blue-700" />
                    <span>Listen to plain audio explanation:</span>
                  </span>
                  <button
                    id="listen-alert-voice-btn"
                    onClick={() => handleSpeak(explanationData.explanation || explanationData.whatItMeans)}
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isPlayingVoice ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" /> Stop
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" /> Listen
                      </>
                    )}
                  </button>
                </div>

                {/* Section 1: What this means */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>What this alert means</span>
                  </div>
                  <p className="text-slate-700">{explanationData.whatItMeans}</p>
                </div>

                {/* Section 2: What you should do */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                  <div className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>What you should do (Tailored for {userRole.replace('_', ' ')})</span>
                  </div>
                  <p className="text-amber-900 mb-2">{explanationData.whatYouShouldDo}</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
                    {alert.instructions.map((inst, idx) => (
                      <li key={idx}>{inst}</li>
                    ))}
                  </ul>
                </div>

                {/* Section 3: Vulnerable Groups */}
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
                  <div className="font-bold text-rose-900 text-sm mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Special precautions for vulnerable groups</span>
                  </div>
                  <p className="text-rose-900">{explanationData.vulnerableGroups}</p>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 rounded-b-2xl">
          <span>Grounded in IMD RMC Nagpur Warning Feeds</span>
          <button
            onClick={() => {
              window.speechSynthesis?.cancel();
              onClose();
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
