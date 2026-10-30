import { ManagedFile, SystemMetrics } from '../types';

export class SystemService {
  private files: ManagedFile[] = [
    { id: '1', name: 'main.py', path: '/workspace/reza/main.py', sizeMB: 0.12, type: 'file', category: 'code', lastModified: '2026-10-29', isTrash: false },
    { id: '2', name: 'voice_engine.py', path: '/workspace/reza/voice_engine.py', sizeMB: 0.18, type: 'file', category: 'code', lastModified: '2026-10-29', isTrash: false },
    { id: '3', name: 'automation.py', path: '/workspace/reza/automation.py', sizeMB: 0.15, type: 'file', category: 'code', lastModified: '2026-10-29', isTrash: false },
    { id: '4', name: 'system_info.py', path: '/workspace/reza/system_info.py', sizeMB: 0.22, type: 'file', category: 'code', lastModified: '2026-10-29', isTrash: false },
    { id: '5', name: 'jarvis_training_dataset.bin', path: '/data/models/jarvis_training_dataset.bin', sizeMB: 1420.5, type: 'file', category: 'system', lastModified: '2026-10-15', isTrash: false },
    { id: '6', name: 'screen_recording_4k.mp4', path: '/videos/screen_recording_4k.mp4', sizeMB: 840.0, type: 'file', category: 'media', lastModified: '2026-10-20', isTrash: false },
    { id: '7', name: 'reza_architecture_spec.pdf', path: '/docs/reza_architecture_spec.pdf', sizeMB: 3.4, type: 'file', category: 'document', lastModified: '2026-10-28', isTrash: false },
    { id: '8', name: 'backup_archive_2026.zip', path: '/backups/backup_archive_2026.zip', sizeMB: 650.0, type: 'file', category: 'system', lastModified: '2026-10-01', isTrash: false },
    { id: '9', name: 'scratchpad.txt', path: '/desktop/scratchpad.txt', sizeMB: 0.05, type: 'file', category: 'document', lastModified: '2026-10-27', isTrash: false },
    { id: '10', name: 'deprecated_module.py', path: '/trash/deprecated_module.py', sizeMB: 0.08, type: 'file', category: 'code', lastModified: '2026-10-10', isTrash: true },
  ];

  public async getSystemMetrics(): Promise<SystemMetrics> {
    const cores = navigator.hardwareConcurrency || 8;
    
    // Attempt to read battery API
    let batteryLevel: number | null = 88;
    let isCharging: boolean | null = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      if (typeof nav.getBattery === 'function') {
        const battery = await nav.getBattery();
        batteryLevel = Math.round(battery.level * 100);
        isCharging = battery.charging;
      }
    } catch {
      // fallback
    }

    // Determine OS
    const userAgent = navigator.userAgent;
    let osName = 'Linux / Unix System';
    if (userAgent.indexOf('Win') !== -1) osName = 'Windows 11 / Pro';
    if (userAgent.indexOf('Mac') !== -1) osName = 'macOS Ventura / Sonoma';
    if (userAgent.indexOf('Android') !== -1) osName = 'Android Mobile OS';

    // Memory info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const perfMemory = (performance as any).memory;
    const ramTotalGB = perfMemory ? Math.round(perfMemory.jsHeapSizeLimit / (1024 * 1024 * 1024) * 4) : 16;
    const ramUsedGB = perfMemory ? Number((perfMemory.usedJSHeapSize / (1024 * 1024 * 1024) * 3.5).toFixed(1)) : 6.4;
    const ramUsage = Math.round((ramUsedGB / ramTotalGB) * 100);

    return {
      cpuUsage: Math.floor(18 + Math.random() * 24),
      cpuCores: cores,
      ramUsage,
      ramTotalGB,
      ramUsedGB,
      batteryLevel,
      isCharging,
      osName,
      platform: navigator.platform || 'x86_64',
      networkOnline: navigator.onLine,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      networkType: (navigator as any).connection?.effectiveType || 'high-speed 5G/Fiber',
      diskUsedGB: 184.2,
      diskTotalGB: 512.0,
      securityStatus: {
        firewallActive: true,
        antivirusActive: true,
        updatesPending: 1,
        lastScanDate: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    };
  }

  public getFiles(includeTrash: boolean = false): ManagedFile[] {
    return this.files.filter(f => includeTrash ? f.isTrash : !f.isTrash);
  }

  public getLargeFiles(thresholdMB: number = 500): ManagedFile[] {
    return this.files.filter(f => !f.isTrash && f.sizeMB >= thresholdMB);
  }

  public moveFileToTrash(id: string): boolean {
    const file = this.files.find(f => f.id === id);
    if (file) {
      file.isTrash = true;
      return true;
    }
    return false;
  }

  public restoreFileFromTrash(id: string): boolean {
    const file = this.files.find(f => f.id === id);
    if (file) {
      file.isTrash = false;
      return true;
    }
    return false;
  }

  public permanentlyDeleteFile(id: string): boolean {
    const index = this.files.findIndex(f => f.id === id);
    if (index !== -1) {
      this.files.splice(index, 1);
      return true;
    }
    return false;
  }

  public createNewFile(name: string, category: 'document' | 'code' = 'document', sizeMB: number = 0.02): ManagedFile {
    const newFile: ManagedFile = {
      id: Date.now().toString(),
      name,
      path: `/workspace/${name}`,
      sizeMB,
      type: 'file',
      category,
      lastModified: new Date().toISOString().split('T')[0],
      isTrash: false,
    };
    this.files.push(newFile);
    return newFile;
  }
}

export const systemService = new SystemService();
