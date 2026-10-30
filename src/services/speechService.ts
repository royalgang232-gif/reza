import { SupportedLanguage } from '../types';
import { soundEffects } from './soundEffects';

// Interface declaration for SpeechRecognition in browsers
interface IWindowSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

const LANGUAGE_CODES: Record<SupportedLanguage, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  ne: 'ne-NP',
};

class SpeechService {
  private recognition: IWindowSpeechRecognition | null = null;
  private isListening: boolean = false;
  private onResultCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onStatusChangeCallback: ((status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error') => void) | null = null;
  private currentLanguage: SupportedLanguage = 'en';
  private voiceSpeed: number = 1.0;
  private voicePitch: number = 1.0;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.availableVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }
    return this.availableVoices;
  }

  public setLanguage(lang: SupportedLanguage) {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = LANGUAGE_CODES[lang];
    }
  }

  public setVoiceSpeed(speed: number) {
    this.voiceSpeed = Math.max(0.5, Math.min(2.0, speed));
  }

  public setVoicePitch(pitch: number) {
    this.voicePitch = Math.max(0.5, Math.min(1.5, pitch));
  }

  public setVoiceByName(name: string) {
    const v = this.availableVoices.find(voice => voice.name === name);
    if (v) this.selectedVoice = v;
  }

  public isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onStatusChange: (status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error') => void
  ): boolean {
    if (!this.isSpeechRecognitionSupported()) {
      onStatusChange('error');
      return false;
    }

    this.onResultCallback = onResult;
    this.onStatusChangeCallback = onStatusChange;

    try {
      // Abort any existing instance
      if (this.recognition) {
        try { this.recognition.abort(); } catch {}
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      
      if (!this.recognition) return false;

      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = LANGUAGE_CODES[this.currentLanguage];

      this.recognition.onstart = () => {
        this.isListening = true;
        soundEffects.playWakeChime();
        this.onStatusChangeCallback?.('listening');
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        if (finalTranscript) {
          soundEffects.playConfirmation();
          this.onResultCallback?.(finalTranscript.trim(), true);
        } else if (interimTranscript) {
          this.onResultCallback?.(interimTranscript.trim(), false);
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error !== 'no-speech') {
          soundEffects.playAlert();
          this.onStatusChangeCallback?.('error');
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onStatusChangeCallback?.('idle');
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      this.onStatusChangeCallback?.('error');
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        soundEffects.playStop();
      } catch {}
    }
    this.isListening = false;
    this.onStatusChangeCallback?.('idle');
  }

  public speak(
    text: string, 
    langOverride?: SupportedLanguage, 
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isSpeechSynthesisSupported()) {
        resolve();
        return;
      }

      this.stopSpeaking();

      // Clean markdown, symbols, code blocks for clean speech
      const cleanedText = text
        .replace(/```[\s\S]*?```/g, 'Code block generated.')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[#*_~\[\]]/g, '')
        .replace(/https?:\/\/\S+/g, 'link')
        .slice(0, 500); // limit speech chunk length

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const targetLang = langOverride || this.currentLanguage;
      utterance.lang = LANGUAGE_CODES[targetLang];
      utterance.rate = this.voiceSpeed;
      utterance.pitch = this.voicePitch;

      // Select suitable voice
      const voices = this.getAvailableVoices();
      if (this.selectedVoice && this.selectedVoice.lang.startsWith(targetLang)) {
        utterance.voice = this.selectedVoice;
      } else {
        // Find best match for language
        const match = voices.find(v => v.lang.toLowerCase().startsWith(targetLang.toLowerCase()))
          || (targetLang === 'ne' ? voices.find(v => v.lang.toLowerCase().startsWith('hi')) : null)
          || voices.find(v => v.lang.startsWith('en'))
          || voices[0];
        if (match) utterance.voice = match;
      }

      utterance.onstart = () => {
        this.onStatusChangeCallback?.('speaking');
      };

      utterance.onend = () => {
        this.onStatusChangeCallback?.('idle');
        onEnd?.();
        resolve();
      };

      utterance.onerror = () => {
        this.onStatusChangeCallback?.('idle');
        onEnd?.();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public stopSpeaking() {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.onStatusChangeCallback?.('idle');
    }
  }
}

export const speechService = new SpeechService();
