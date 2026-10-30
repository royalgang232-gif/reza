// Background Service Manager for REZA
// Manages Screen WakeLock, Notifications, Service Worker Keepalive, and Audio Background Loop

class BackgroundManager {
  private wakeLock: any = null;
  private isRunningInBackground: boolean = false;
  private audioKeepAlive: HTMLAudioElement | null = null;
  private onNotificationCallback: ((msg: string) => void) | null = null;

  constructor() {
    this.initVisibilityListener();
  }

  // Request WakeLock to prevent device from sleeping while assisting in background
  public async requestWakeLock(): Promise<boolean> {
    try {
      if ('wakeLock' in navigator && (navigator as any).wakeLock) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
        return true;
      }
    } catch (err) {
      console.warn('[Background] WakeLock request notice:', err);
    }
    return false;
  }

  // Release WakeLock
  public async releaseWakeLock() {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
      } catch {}
      this.wakeLock = null;
    }
  }

  // Request Notification permission for background alerts
  public async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        return true;
      }
      if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
    }
    return false;
  }

  // Send background system alert
  public sendNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: 'reza-assistant-alert',
        });
      } catch (err) {
        console.warn('[Background] Notification error:', err);
      }
    }
  }

  // Background Audio Keep-Alive: Plays an ultra-low frequency silent buffer so mobile browsers keep web worker/threads alive
  public startAudioKeepAlive() {
    try {
      if (!this.audioKeepAlive) {
        // Generates 1-second silent WAV data URI
        const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
        this.audioKeepAlive = new Audio(silentWav);
        this.audioKeepAlive.loop = true;
      }
      this.audioKeepAlive.play().catch(() => {});
      this.isRunningInBackground = true;
      this.requestWakeLock();
    } catch {}
  }

  public stopAudioKeepAlive() {
    if (this.audioKeepAlive) {
      try {
        this.audioKeepAlive.pause();
      } catch {}
    }
    this.releaseWakeLock();
    this.isRunningInBackground = false;
  }

  public isBackgroundActive(): boolean {
    return this.isRunningInBackground;
  }

  // Re-acquire wake lock if tab becomes visible again
  private initVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isRunningInBackground) {
          this.requestWakeLock();
        }
      });
    }
  }
}

export const backgroundManager = new BackgroundManager();
