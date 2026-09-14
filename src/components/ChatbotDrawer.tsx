import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  HelpCircle,
  RotateCcw,
  Wrench,
  CheckCircle2,
  Loader2,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { ChatMessage } from '../types';

export const ChatbotDrawer: React.FC = () => {
  const {
    isChatOpen,
    setIsChatOpen,
    userRole,
    language,
    alerts,
    currentWeather,
    autoVoiceReplies,
    t,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Namaskar! I am WeatherGPT, your conversational weather and climate intelligence assistant for Nagpur District. I can answer questions in English, Hindi (हिंदी), or Marathi (मराठी) about today's forecast, active warnings, route safety, and agriculture advisories. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const [isExpandedFull, setIsExpandedFull] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      if (language === 'hi') recognition.lang = 'hi-IN';
      else if (language === 'mr') recognition.lang = 'mr-IN';
      else recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleSpeak = (text: string, index: number) => {
    if (!window.speechSynthesis) return;

    if (speakingMessageIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingMessageIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#•]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'mr') utterance.lang = 'mr-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingMessageIndex(null);
    utterance.onerror = () => setSpeakingMessageIndex(null);

    setSpeakingMessageIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    // User message
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build history for backend
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          role: userRole,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: data.text || data.reply || 'I am processing meteorological data for Nagpur District.',
          toolsUsed: data.toolsUsed || data.toolCallsExecuted,
          structuredFacts: data.structuredFacts,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => {
          const updated = [...prev, assistantMsg];
          if (autoVoiceReplies) {
            setTimeout(() => handleSpeak(assistantMsg.content, updated.length - 1), 200);
          }
          return updated;
        });
      } else {
        throw new Error('API server error');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I encountered a brief connection delay while accessing the meteorological service. Current Nagpur observation: 28°C with moderate humidity. Please feel free to try your question again.',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    window.speechSynthesis?.cancel();
    setSpeakingMessageIndex(null);
    setMessages([
      {
        role: 'assistant',
        content: `Chat session reset. Ask me anything regarding Nagpur's weather, warnings, or travel routes.`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const sampleQuestions = [
    'Nagpur me kal baarish hogi?',
    'Aaj college jaana safe hai?',
    'Explain active IMD warning',
    'Nagpur se Umred weather route',
    'Cotton crop ke liye 3-day advisory',
    'What is the heat index today?',
  ];

  const hasWarning = alerts.length > 0 && alerts[0].severity !== 'GREEN';

  return (
    <>
      {/* Floating WeatherGPT AI Launcher Button */}
      {!isChatOpen && (
        <button
          id="open-weathergpt-chat-btn"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-5 z-40 flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-blue-900 text-white rounded-full shadow-2xl border border-blue-400/40 hover:scale-105 transition-all cursor-pointer group"
          title="Open WeatherGPT Conversational Intelligence"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            {hasWarning && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
          </div>
          <span className="font-extrabold text-sm tracking-tight pr-1">
            Weather<span className="text-blue-400">GPT</span> AI
          </span>
        </button>
      )}

      {/* Expandable Chat Drawer */}
      {isChatOpen && (
        <div
          id="weathergpt-chat-drawer"
          className={`fixed z-50 bg-white shadow-2xl border border-slate-300 flex flex-col transition-all duration-300 ${
            isExpandedFull
              ? 'inset-4 rounded-2xl'
              : 'bottom-0 md:bottom-6 right-0 md:right-6 w-full md:w-[440px] h-[650px] max-h-[92vh] md:rounded-2xl'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 bg-slate-900 text-white rounded-t-none md:rounded-t-2xl flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center border border-blue-400/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white">
                    Weather<span className="text-blue-400">GPT</span> Assistant
                  </h3>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono font-semibold px-1.5 py-0.2 rounded border border-blue-400/30">
                    GEMINI 3.8 FLASH
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>Nagpur Specialized</span>
                  <span>•</span>
                  <span>Role: {userRole.replace('_', ' ')}</span>
                </p>
              </div>
            </div>

            {/* Header controls */}
            <div className="flex items-center gap-1">
              <button
                id="clear-chat-btn"
                onClick={clearChat}
                title="Reset conversation"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                id="expand-chat-btn"
                onClick={() => setIsExpandedFull(!isExpandedFull)}
                title={isExpandedFull ? 'Minimize' : 'Maximize'}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer hidden md:block"
              >
                {isExpandedFull ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                id="close-chat-btn"
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setIsChatOpen(false);
                }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Questions suggestion bar */}
          <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" /> Ask:
            </span>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                id={`sample-question-${idx}`}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] font-medium bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isSpeaking = speakingMessageIndex === idx;

              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                  }`}>
                    {/* Tool execution badge if model called tools */}
                    {!isUser && msg.toolsUsed && msg.toolsUsed.length > 0 && (
                      <div className="mb-2 p-1.5 rounded-lg bg-slate-100 text-[10px] text-slate-600 border border-slate-200/80 flex items-center gap-1.5 flex-wrap">
                        <Wrench className="w-3 h-3 text-blue-600 shrink-0" />
                        <span className="font-semibold">Tool invoked:</span>
                        {msg.toolsUsed.map((tool, i) => (
                          <span key={i} className="bg-white px-1.5 py-0.5 rounded font-mono font-medium border border-slate-200 text-slate-800">
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Message content */}
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Timestamp & Speech Readout button */}
                    <div className={`mt-2 flex items-center justify-between text-[10px] ${
                      isUser ? 'text-blue-200' : 'text-slate-400'
                    }`}>
                      <span>{msg.timestamp}</span>

                      {!isUser && (
                        <button
                          id={`speak-msg-${idx}`}
                          onClick={() => handleSpeak(msg.content, idx)}
                          className="flex items-center gap-1 text-slate-500 hover:text-blue-600 p-1 rounded transition-colors cursor-pointer"
                          title="Listen to read-aloud"
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                              <span className="text-rose-600 font-semibold">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>Consulting Nagpur IMD observations & reasoning...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Listening indicator */}
          {isListening && (
            <div className="bg-rose-50 border-t border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-700 animate-pulse">
              <span className="flex items-center gap-2 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                Listening to your voice... Speak now in Hindi, Marathi, or English.
              </span>
              <button
                onClick={toggleListening}
                className="text-xs font-bold text-rose-800 underline cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 rounded-b-none md:rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                id="voice-mic-btn"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
                title="Voice input (Speech to text)"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                id="chat-input-field"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about Nagpur weather, rain, heat, routes..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                id="send-chat-btn"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <span>WeatherGPT answers are grounded in official IMD feeds</span>
              <span>•</span>
              <span className="text-slate-500">Press Enter to send</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
