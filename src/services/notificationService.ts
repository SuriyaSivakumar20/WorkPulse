// WorkPulse Notification Engine: Scheduled 10:00 PM Weekday Reminders & Web Push
import { pwaService } from './pwaService';

export interface NextReminderInfo {
  targetDate: Date;
  msUntil: number;
  formattedText: string;
  isToday: boolean;
  dayName: string;
}

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

type ReminderTriggerCallback = (reminderDate: Date) => void;

class NotificationServiceManager {
  private reminderTimerId: any = null;
  private onTriggerCallbacks: Set<ReminderTriggerCallback> = new Set();
  private lastTriggeredDateStr: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Re-evaluate schedule when the browser wakes up or tab gains focus
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.checkAndReschedule();
        }
      });
      window.addEventListener('focus', () => {
        this.checkAndReschedule();
      });

      // Start initial scheduling
      this.reschedule();
    }
  }

  /**
   * Check browser notification permission status
   */
  public getPermissionStatus(): NotificationPermissionStatus {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission as NotificationPermissionStatus;
  }

  /**
   * Request browser permission for notifications
   */
  public async requestPermission(): Promise<NotificationPermissionStatus> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.reschedule();
      }
      return permission as NotificationPermissionStatus;
    } catch (err) {
      console.error('[NotificationService] Permission request failed:', err);
      return 'denied';
    }
  }

  /**
   * Calculate next 10:00 PM occurrence on a weekday (Mon, Tue, Wed, Thu, Fri), strictly excluding Sat & Sun
   */
  public getNextWeekday10PM(now: Date = new Date()): NextReminderInfo {
    const target = new Date(now.getTime());
    target.setHours(22, 0, 0, 0); // 10:00:00 PM

    const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    if (dayOfWeek === 6) {
      // Saturday -> move to Monday (+2 days)
      target.setDate(target.getDate() + 2);
    } else if (dayOfWeek === 0) {
      // Sunday -> move to Monday (+1 day)
      target.setDate(target.getDate() + 1);
    } else {
      // Monday to Friday
      if (now.getTime() >= target.getTime()) {
        // 10:00 PM already passed today
        if (dayOfWeek === 5) {
          // Friday passed -> next is Monday (+3 days)
          target.setDate(target.getDate() + 3);
        } else {
          // Mon-Thu passed -> next is tomorrow (+1 day)
          target.setDate(target.getDate() + 1);
        }
      }
    }

    const msUntil = Math.max(0, target.getTime() - now.getTime());
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayOfWeek = target.getDay();

    const isToday =
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate();

    const isTomorrow =
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate() + 1;

    let formattedText = '';
    if (isToday) {
      formattedText = 'Tonight at 10:00 PM';
    } else if (isTomorrow) {
      formattedText = 'Tomorrow at 10:00 PM';
    } else {
      formattedText = `${dayNames[targetDayOfWeek]} at 10:00 PM`;
    }

    return {
      targetDate: target,
      msUntil,
      formattedText,
      isToday,
      dayName: dayNames[targetDayOfWeek]
    };
  }

  /**
   * Play an audible notification chime via Web Audio API (works without external audio files)
   */
  public playChime() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Dual harmonic chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      osc2.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc2.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.8);
      osc2.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio playback silently ignored if blocked by autoplay policy
    }
  }

  /**
   * Trigger native system notification & mobile vibration
   */
  public async showNotification(title: string, options: any = {}): Promise<boolean> {
    const defaultOptions: any = {
      body: "It's 10:00 PM! Don't forget to submit your daily work log, record blockers, and prepare tomorrow's plan.",
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'workpulse-daily-reminder',
      renotify: true,
      vibrate: [200, 100, 200, 100, 300],
      data: { url: '/?section=daily-logs' },
      ...options
    };

    // Play chime sound
    this.playChime();

    // Vibrate device if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 300]);
      } catch {
        // ignore
      }
    }

    // Try service worker notification first (native mobile push behavior)
    try {
      const reg = await pwaService.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, defaultOptions);
        return true;
      }
    } catch (err) {
      console.warn('[NotificationService] Service worker showNotification error:', err);
    }

    // Fallback to standard Window Notification constructor
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, defaultOptions);
        return true;
      } catch (err) {
        console.warn('[NotificationService] Window Notification constructor error:', err);
      }
    }

    return false;
  }

  /**
   * Schedule the next 10:00 PM weekday reminder
   */
  public reschedule() {
    if (this.reminderTimerId) {
      clearTimeout(this.reminderTimerId);
      this.reminderTimerId = null;
    }

    const next = this.getNextWeekday10PM();
    console.log(`[NotificationService] Next 10:00 PM reminder scheduled for: ${next.formattedText} (in ${Math.round(next.msUntil / 1000 / 60)} minutes)`);

    // JavaScript setTimeout has a 32-bit int limit (~24.8 days), 1 day is well within limits
    const maxSafeTimeout = 2147483647;
    const delay = Math.min(next.msUntil, maxSafeTimeout);

    this.reminderTimerId = setTimeout(() => {
      this.handleScheduledTrigger(next.targetDate);
    }, delay);
  }

  /**
   * Handle the reminder trigger event
   */
  private async handleScheduledTrigger(targetDate: Date) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (this.lastTriggeredDateStr === todayStr) {
      // Already triggered today
      this.reschedule();
      return;
    }

    this.lastTriggeredDateStr = todayStr;

    // Check if it's currently a weekday (not Sat or Sun)
    const day = new Date().getDay();
    if (day !== 0 && day !== 6) {
      await this.showNotification('WorkPulse — Daily Log Reminder (10:00 PM)', {
        body: "It's 10:00 PM! Time to record your daily work log, blockers, and set tomorrow's priorities."
      });

      // Notify in-app subscribers
      this.onTriggerCallbacks.forEach(cb => cb(targetDate));
    }

    // Schedule next
    this.reschedule();
  }

  /**
   * Checks if a notification was missed during backgrounding
   */
  public checkAndReschedule() {
    const now = new Date();
    const day = now.getDay();
    const todayStr = now.toISOString().split('T')[0];

    // If it's a weekday and past 22:00 (10 PM), and hasn't triggered today yet
    if (day !== 0 && day !== 6 && now.getHours() >= 22) {
      if (this.lastTriggeredDateStr !== todayStr) {
        // User opened app after 10 PM and hasn't received reminder yet today
        const minutesPast = (now.getHours() - 22) * 60 + now.getMinutes();
        if (minutesPast <= 120) {
          // Within 2 hours of 10 PM
          this.handleScheduledTrigger(now);
          return;
        }
      }
    }

    this.reschedule();
  }

  /**
   * Fire immediate test notification so the user can verify on their phone right now
   */
  public async sendTestNotification(): Promise<boolean> {
    const perm = await this.requestPermission();
    if (perm !== 'granted') {
      return false;
    }

    return this.showNotification('WorkPulse — Notification Test', {
      body: 'Notifications are configured! You will receive daily reminders at 10:00 PM every weekday (Mon-Fri).',
      tag: 'workpulse-test'
    });
  }

  /**
   * Subscribe to reminder trigger events
   */
  public onReminderTrigger(cb: ReminderTriggerCallback): () => void {
    this.onTriggerCallbacks.add(cb);
    return () => {
      this.onTriggerCallbacks.delete(cb);
    };
  }
}

export const notificationService = new NotificationServiceManager();
