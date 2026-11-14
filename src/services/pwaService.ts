// PWA Service to handle Service Worker registration and App Installation prompts

export interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  swRegistered: boolean;
}

type PWAInstallListener = (state: PWAInstallState) => void;

class PWAServiceManager {
  private deferredPrompt: any = null;
  private listeners: Set<PWAInstallListener> = new Set();
  private registration: ServiceWorkerRegistration | null = null;
  private state: PWAInstallState = {
    isInstallable: false,
    isInstalled: false,
    isIOS: false,
    isAndroid: false,
    swRegistered: false
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.detectPlatform();
      this.checkInstalled();
      this.initListeners();
      this.registerServiceWorker();
    }
  }

  private detectPlatform() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    this.state.isIOS = /iphone|ipad|ipod/.test(userAgent);
    this.state.isAndroid = /android/.test(userAgent);
  }

  private checkInstalled() {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    this.state.isInstalled = isStandalone;
  }

  private initListeners() {
    // Android / Chromium beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.state.isInstallable = true;
      this.notifyListeners();
    });

    // App installed event
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.state.isInstallable = false;
      this.state.isInstalled = true;
      this.notifyListeners();
      console.log('[PWA] WorkPulse was successfully installed on device.');
    });

    // Display-mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      this.state.isInstalled = e.matches;
      this.notifyListeners();
    });
  }

  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.registration = reg;
      this.state.swRegistered = true;
      this.notifyListeners();
      console.log('[PWA] Service Worker registered successfully with scope:', reg.scope);

      // Check for updates periodically
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New version of WorkPulse is available.');
            }
          });
        }
      });

      return reg;
    } catch (err) {
      console.error('[PWA] Service Worker registration failed:', err);
      return null;
    }
  }

  public async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (this.registration) return this.registration;
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      this.registration = (await navigator.serviceWorker.getRegistration('/')) || null;
      return this.registration;
    }
    return null;
  }

  public async promptInstall(): Promise<'accepted' | 'dismissed' | 'ios' | 'unavailable'> {
    if (this.state.isInstalled) {
      return 'accepted';
    }

    // Android/Desktop prompt
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        this.deferredPrompt = null;
        this.state.isInstallable = false;
        this.notifyListeners();
        return 'accepted';
      } else {
        return 'dismissed';
      }
    }

    // iOS doesn't have programmatic prompt - guide user through Safari Add to Home Screen
    if (this.state.isIOS) {
      return 'ios';
    }

    return 'unavailable';
  }

  public getState(): PWAInstallState {
    return { ...this.state };
  }

  public subscribe(listener: PWAInstallListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.getState()));
  }
}

export const pwaService = new PWAServiceManager();

