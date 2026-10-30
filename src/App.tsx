import React, { useState, useEffect } from 'react';
import { AssistantSettings, Message, SupportedLanguage } from './types';
import { HeaderHUD } from './components/HeaderHUD';
import { ArcReactor } from './components/ArcReactor';
import { BatteryTelemetry } from './components/BatteryTelemetry';
import { QuickActions } from './components/QuickActions';
import { ChatPanel } from './components/ChatPanel';
import { VoiceController } from './components/VoiceController';
import { WeatherModal } from './components/WeatherModal';
import { SystemModal } from './components/SystemModal';
import { ScreenVisionModal } from './components/ScreenVisionModal';
import { CodeStudioModal } from './components/CodeStudioModal';
import { DictationModal } from './components/DictationModal';
import { FileManagerModal } from './components/FileManagerModal';
import { PythonSuiteModal } from './components/PythonSuiteModal';
import { SettingsModal } from './components/SettingsModal';
import { InternetSearchModal } from './components/InternetSearchModal';

import { aiService } from './services/aiService';
import { speechService } from './services/speechService';
import { soundEffects } from './services/soundEffects';
import { fetchLiveWeather } from './services/weatherService';
import { searchInternet } from './services/searchService';
import { backgroundManager } from './services/backgroundManager';

const DEFAULT_SETTINGS: AssistantSettings = {
  language: 'en',
  voiceSpeed: 1.0,
  voicePitch: 1.0,
  continuousListening: false,
  wakeWordEnabled: true,
  soundEffects: true,
  historyEnabled: true,
  selectedVoiceName: '',
  customApiKey: '',
};

export default function App() {
  const [settings, setSettings] = useState<AssistantSettings>(() => {
    try {
      const saved = localStorage.getItem('reza_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [cpuUsage, setCpuUsage] = useState(24);
  const [backgroundActive, setBackgroundActive] = useState<boolean>(() => {
    return localStorage.getItem('reza_bg_active') === 'true';
  });

  // Messages log
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('reza_chat_history');
      if (saved && settings.historyEnabled) {
        return JSON.parse(saved);
      }
    } catch {}
    return [
      {
        id: 'init-1',
        sender: 'reza',
        text: "REZA Core AI Online. Iron Man-inspired desktop & mobile command station ready. Background assistance mode and live global web search enabled. Available in English, Hindi (हिन्दी), and Nepali (नेपाली).",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      },
    ];
  });

  // Keep sound effects config synchronized
  useEffect(() => {
    soundEffects.enabled = settings.soundEffects;
  }, [settings.soundEffects]);

  // Keep speech engine synchronized
  useEffect(() => {
    speechService.setLanguage(settings.language);
    speechService.setVoiceSpeed(settings.voiceSpeed);
    speechService.setVoicePitch(settings.voicePitch);
    if (settings.selectedVoiceName) {
      speechService.setVoiceByName(settings.selectedVoiceName);
    }
  }, [settings.language, settings.voiceSpeed, settings.voicePitch, settings.selectedVoiceName]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('reza_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Save chat history to localStorage
  useEffect(() => {
    if (settings.historyEnabled) {
      try {
        localStorage.setItem('reza_chat_history', JSON.stringify(messages.slice(-50)));
      } catch {}
    }
  }, [messages, settings.historyEnabled]);

  // Telemetry ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(18 + Math.random() * 26));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Background assistance initialization
  useEffect(() => {
    if (backgroundActive) {
      backgroundManager.startAudioKeepAlive();
      backgroundManager.requestWakeLock();
    }
  }, [backgroundActive]);

  const toggleBackgroundMode = async () => {
    soundEffects.playConfirmation();
    if (backgroundActive) {
      backgroundManager.stopAudioKeepAlive();
      setBackgroundActive(false);
      localStorage.setItem('reza_bg_active', 'false');
      addMessage({
        sender: 'reza',
        text: 'Background assistance deactivated. Standard foreground mode restored.',
        type: 'text',
      });
    } else {
      backgroundManager.startAudioKeepAlive();
      await backgroundManager.requestWakeLock();
      await backgroundManager.requestNotificationPermission();
      setBackgroundActive(true);
      localStorage.setItem('reza_bg_active', 'true');
      backgroundManager.sendNotification(
        'REZA Assistant Online',
        'Running in background. Ready to assist with search, tasks, and voice commands.'
      );
      addMessage({
        sender: 'reza',
        text: 'Background assistance engaged! Screen WakeLock and audio keepalive activated. REZA will remain alert even while using other apps or in the background.',
        type: 'text',
      });
    }
  };

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>): Message => {
    const newMsg: Message = {
      ...msg,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);

    // Send notification if app is in background or hidden
    if (document.visibilityState === 'hidden' && backgroundActive && msg.sender === 'reza') {
      backgroundManager.sendNotification('REZA Assistant', msg.text.slice(0, 120));
    }

    return newMsg;
  };

  // Main Command Processor
  const handleSendCommand = async (commandText: string) => {
    const text = commandText.trim();
    if (!text) return;

    // Add user message
    addMessage({
      sender: 'user',
      text,
      type: 'text',
    });

    setStatus('processing');
    soundEffects.playProcessingPulse();

    try {
      const textLower = text.toLowerCase();

      // Background mode toggle command
      if (textLower.includes('background') || textLower.includes('ब्याकग्राउन्ड') || textLower.includes('बैकग्राउंड')) {
        toggleBackgroundMode();
        return;
      }

      // Live Internet search command
      if (
        textLower.startsWith('search') ||
        textLower.includes('search for') ||
        textLower.includes('google') ||
        textLower.includes('खोज्नुहोस्') ||
        textLower.includes('खोजिए')
      ) {
        const query = textLower
          .replace(/^(reza,?\s*)?(search\s+(for\s+)?|google\s+|खोज्नुहोस्\s*|खोजिए\s*)/i, '')
          .trim();
        const searchRes = await searchInternet(query || text);
        const replyMsg = addMessage({
          sender: 'reza',
          text: `[${searchRes.sourceName.toUpperCase()}]\n${searchRes.snippet}`,
          type: 'text',
          isLiveInfo: searchRes.isLive,
        });
        speakAndSetState(replyMsg.text);
        return;
      }

      const response = await aiService.generateReply(text, settings.language);

      // Check detected actions
      if (response.detectedAction) {
        const act = response.detectedAction;

        if (act.type === 'weather') {
          const city = act.param || 'Kathmandu';
          const weather = await fetchLiveWeather(city);
          const replyMsg = addMessage({
            sender: 'reza',
            text: `Atmospheric telemetry retrieved for ${weather.city}, ${weather.country}: ${weather.description} at ${weather.temperature}°C.`,
            type: 'weather',
            weatherData: weather,
            isLiveInfo: weather.isLive,
          });
          speakAndSetState(replyMsg.text);
          return;
        }

        if (act.type === 'system') {
          setActiveModal('system');
          const replyMsg = addMessage({
            sender: 'reza',
            text: response.text,
            type: 'system',
          });
          speakAndSetState(replyMsg.text);
          return;
        }

        if (act.type === 'screen') {
          setActiveModal('screen');
          const replyMsg = addMessage({
            sender: 'reza',
            text: response.text,
            type: 'vision',
          });
          speakAndSetState(replyMsg.text);
          return;
        }

        if (act.type === 'dictation') {
          setActiveModal('dictation');
          const replyMsg = addMessage({
            sender: 'reza',
            text: response.text,
            type: 'text',
          });
          speakAndSetState(replyMsg.text);
          return;
        }

        if (act.type === 'files') {
          setActiveModal('files');
          const replyMsg = addMessage({
            sender: 'reza',
            text: response.text,
            type: 'text',
          });
          speakAndSetState(replyMsg.text);
          return;
        }
      }

      // Standard response
      const replyMsg = addMessage({
        sender: 'reza',
        text: response.text,
        type: response.codeSnippet ? 'code' : 'text',
        codeSnippet: response.codeSnippet,
      });

      speakAndSetState(replyMsg.text);
    } catch (err) {
      console.error('Command processing error:', err);
      setStatus('error');
      soundEffects.playAlert();
      addMessage({
        sender: 'system',
        text: 'Error processing command. Telemetry link degraded; fallback subsystem active.',
        type: 'text',
      });
    }
  };

  const speakAndSetState = (text: string) => {
    setIsSpeaking(true);
    setStatus('speaking');
    speechService.speak(text, settings.language, () => {
      setIsSpeaking(false);
      setStatus(isListening ? 'listening' : 'idle');
    });
  };

  const handleToggleListen = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setStatus('idle');
      soundEffects.playStop();
    } else {
      setIsListening(true);
      setStatus('listening');
      const ok = speechService.startListening(
        (recognizedText, isFinal) => {
          if (isFinal) {
            handleSendCommand(recognizedText);
            if (!settings.continuousListening) {
              setIsListening(false);
              setStatus('idle');
            }
          }
        },
        (st) => {
          setStatus(st);
          if (st === 'idle' && !settings.continuousListening) {
            setIsListening(false);
          }
        }
      );
      if (!ok) {
        setIsListening(false);
        setStatus('error');
      }
    }
  };

  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setStatus('idle');
    soundEffects.playStop();
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setSettings((prev) => ({ ...prev, language: lang }));
    speechService.setLanguage(lang);
    const greeting = lang === 'ne' 
      ? 'भाषा नेपालीमा परिवर्तन गरियो। म तपाईंलाई कसरी सहयोग गर्न सक्छु?' 
      : lang === 'hi'
      ? 'भाषा हिन्दी में परिवर्तित की गई। मैं आपकी क्या सहायता कर सकता हूँ?'
      : 'Language switched to English. How can I assist you?';
    addMessage({
      sender: 'reza',
      text: greeting,
      type: 'text',
    });
    speakAndSetState(greeting);
  };

  const handleLaunchApp = (appName: string) => {
    setActiveModal(null);
    let msg = `Authorized desktop launch confirmed for ${appName}.`;
    if (appName === 'browser') {
      window.open('https://google.com', '_blank');
      msg = 'Web browser launched in external window.';
    } else if (appName === 'calculator') {
      msg = 'Calculator utility initialized.';
    } else if (appName === 'editor') {
      setActiveModal('dictation');
      msg = 'Text editor and dictation canvas active.';
    } else if (appName === 'terminal') {
      setActiveModal('python');
      msg = 'Python automation terminal opened.';
    }
    addMessage({
      sender: 'reza',
      text: msg,
      type: 'action',
    });
    speakAndSetState(msg);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#04070d] text-[#c5d8ea] overflow-hidden relative pointer-events-auto">
      {/* Decorative scanline overlay safely isolated as pointer-events-none layer */}
      <div className="fixed inset-0 pointer-events-none scanlines-overlay z-40 opacity-35" />

      {/* 1. Header HUD with World Clocks, Status, Background toggle, and Language */}
      <HeaderHUD
        currentLanguage={settings.language}
        onLanguageChange={handleLanguageChange}
        soundEffectsEnabled={settings.soundEffects}
        onToggleSoundEffects={() =>
          setSettings((prev) => ({ ...prev, soundEffects: !prev.soundEffects }))
        }
        cpuUsage={cpuUsage}
        backgroundActive={backgroundActive}
        onToggleBackground={toggleBackgroundMode}
      />

      {/* 2. Quick Actions Toolbar */}
      <QuickActions
        onOpenWeather={() => setActiveModal('weather')}
        onOpenSearch={() => setActiveModal('search')}
        onOpenSystem={() => setActiveModal('system')}
        onOpenScreen={() => setActiveModal('screen')}
        onOpenDictation={() => setActiveModal('dictation')}
        onOpenCode={() => setActiveModal('code')}
        onOpenFiles={() => setActiveModal('files')}
        onOpenPythonSuite={() => setActiveModal('python')}
        onOpenSettings={() => setActiveModal('settings')}
        activeModal={activeModal}
      />

      {/* 3. Center Command Area: Arc Reactor + Telemetry Sidebar + Live Chat Stream */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        {/* Left Side: Arc Reactor & Real-Time Battery/System Telemetry */}
        <div className="w-full md:w-80 bg-[#060c18]/90 border-b md:border-b-0 md:border-r border-cyan-950 flex flex-col items-center justify-start p-3 sm:p-4 overflow-y-auto space-y-3.5 flex-shrink-0">
          <div className="w-full flex justify-between items-center text-[10px] font-mono text-cyan-500/80 px-1">
            <span>NEURAL MATRIX: 100%</span>
            <span>FREQ: 432.8 MHz</span>
          </div>

          {/* Central Arc Reactor */}
          <div className="py-1">
            <ArcReactor status={status} onClick={handleToggleListen} />
          </div>

          {/* Live System Battery Percentage Monitor using Browser Battery Status API */}
          <BatteryTelemetry />

          {/* Core System Status Card */}
          <div className="w-full p-2.5 rounded-lg bg-[#040812] border border-cyan-950 text-[11px] font-mono text-cyan-400 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">VOICE ENGINE:</span>
              <span className="text-cyan-300 font-bold">{settings.language.toUpperCase()} / TTS ACTIVE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">MICROPHONE:</span>
              <span className={isListening ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-400'}>
                {isListening ? '● RECORDING' : '○ STANDBY'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">BACKGROUND ASSIST:</span>
              <span className={backgroundActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {backgroundActive ? 'RUNNING (PERSISTENT)' : 'STANDBY'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">GLOBAL SEARCH:</span>
              <span className="text-cyan-400">MOBILE / LAPTOP READY</span>
            </div>
          </div>
        </div>

        {/* Right Side: Conversation Feed */}
        <div className="flex-1 flex flex-col bg-[#050a14] overflow-hidden">
          <ChatPanel
            messages={messages}
            onSpeakText={(text) => speakAndSetState(text)}
          />
        </div>
      </main>

      {/* 4. Bottom Voice & Command Dock */}
      <VoiceController
        isListening={isListening}
        isSpeaking={isSpeaking}
        onToggleListen={handleToggleListen}
        onStopSpeaking={handleStopSpeaking}
        onSendCommand={handleSendCommand}
        status={status}
        continuousListening={settings.continuousListening}
        onToggleContinuousListening={() =>
          setSettings((prev) => ({
            ...prev,
            continuousListening: !prev.continuousListening,
          }))
        }
      />

      {/* 5. Modals for Deep Functionalities */}
      <InternetSearchModal
        isOpen={activeModal === 'search'}
        onClose={() => setActiveModal(null)}
        onSelectResultAsPrompt={(p) => handleSendCommand(p)}
        onSpeakText={(txt) => speakAndSetState(txt)}
      />

      <WeatherModal
        isOpen={activeModal === 'weather'}
        onClose={() => setActiveModal(null)}
        onSpeakWeather={(txt) => speakAndSetState(txt)}
      />

      <SystemModal
        isOpen={activeModal === 'system'}
        onClose={() => setActiveModal(null)}
        onLaunchApp={handleLaunchApp}
      />

      <ScreenVisionModal
        isOpen={activeModal === 'screen'}
        onClose={() => setActiveModal(null)}
        onSpeakAnalysis={(txt) => speakAndSetState(txt)}
      />

      <CodeStudioModal
        isOpen={activeModal === 'code'}
        onClose={() => setActiveModal(null)}
        currentLanguage={settings.language}
        onSpeakJoke={(txt) => speakAndSetState(txt)}
      />

      <DictationModal
        isOpen={activeModal === 'dictation'}
        onClose={() => setActiveModal(null)}
        currentLanguage={settings.language}
      />

      <FileManagerModal
        isOpen={activeModal === 'files'}
        onClose={() => setActiveModal(null)}
      />

      <PythonSuiteModal
        isOpen={activeModal === 'python'}
        onClose={() => setActiveModal(null)}
      />

      <SettingsModal
        isOpen={activeModal === 'settings'}
        onClose={() => setActiveModal(null)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
        onClearHistory={() => {
          setMessages([]);
          localStorage.removeItem('reza_chat_history');
        }}
      />
    </div>
  );
}
