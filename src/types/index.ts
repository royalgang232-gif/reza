export type SupportedLanguage = 'en' | 'hi' | 'ne';

export interface Message {
  id: string;
  sender: 'user' | 'reza' | 'system';
  text: string;
  timestamp: string;
  type?: 'text' | 'code' | 'weather' | 'system' | 'action' | 'joke' | 'vision';
  codeSnippet?: {
    code: string;
    language: string;
    explanation?: string;
  };
  weatherData?: {
    city: string;
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
    isLive: boolean;
  };
  actionData?: {
    actionType: string;
    details: string;
    status: 'pending' | 'success' | 'cancelled';
  };
  isLiveInfo?: boolean;
}

export interface SystemMetrics {
  cpuUsage: number;
  cpuCores: number;
  ramUsage: number;
  ramTotalGB: number;
  ramUsedGB: number;
  batteryLevel: number | null;
  isCharging: boolean | null;
  osName: string;
  platform: string;
  networkOnline: boolean;
  networkType: string;
  diskUsedGB: number;
  diskTotalGB: number;
  securityStatus: {
    firewallActive: boolean;
    antivirusActive: boolean;
    updatesPending: number;
    lastScanDate: string;
  };
}

export interface AssistantSettings {
  language: SupportedLanguage;
  voiceSpeed: number; // 0.75 - 1.5
  voicePitch: number; // 0.8 - 1.2
  continuousListening: boolean;
  wakeWordEnabled: boolean;
  soundEffects: boolean;
  historyEnabled: boolean;
  selectedVoiceName: string;
  customApiKey: string;
}

export interface ManagedFile {
  id: string;
  name: string;
  path: string;
  sizeMB: number;
  type: 'file' | 'folder';
  category: 'document' | 'code' | 'media' | 'system';
  lastModified: string;
  isTrash: boolean;
}
