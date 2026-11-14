import { WorkPulseState, DailyReport, Task, TrackingSchedule, Blocker, Doubt, LearningEntry, InAppNotification, UserSettings } from '../types';
import { INITIAL_SAMPLE_STATE, CURRENT_DATE_STR } from './sampleData';

const STORAGE_KEY = 'workpulse_storage_v2';
const CURRENT_SCHEMA_VERSION = '1.0.0';

export interface MissedPeriod {
  scheduleId: string;
  scheduleName: string;
  date: string; // YYYY-MM-DD
  dayName: string;
  isToday: boolean;
}

export class StorageService {
  /**
   * Load entire application state from LocalStorage, with fallback to initial clean state
   */
  public static loadState(): WorkPulseState {
    try {
      // Remove deprecated v1 storage containing previous demonstration entries if present
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('workpulse_storage_v1');
      }

      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        // First run - seed with initial clean state for new user
        this.saveState(INITIAL_SAMPLE_STATE);
        return INITIAL_SAMPLE_STATE;
      }

      const parsed = JSON.parse(serialized);

      // If the stored data is from the old mock user Kavya Sharma or has mock tasks, wipe it clean
      if (
        parsed?.userSettings?.userName === 'Kavya Sharma' ||
        (Array.isArray(parsed?.tasks) && parsed.tasks.some((t: any) => t.id === 'task-101'))
      ) {
        console.info('Clearing old mock entries for new user...');
        this.saveState(INITIAL_SAMPLE_STATE);
        return INITIAL_SAMPLE_STATE;
      }

      // Validate schema version
      if (!parsed || typeof parsed !== 'object' || !parsed.version) {
        console.warn('Storage schema missing or corrupted. Restoring default state.');
        return INITIAL_SAMPLE_STATE;
      }

      // Check for version migrations if needed
      return this.migrateState(parsed);
    } catch (err) {
      console.error('Failed to load WorkPulse state from LocalStorage:', err);
      return INITIAL_SAMPLE_STATE;
    }
  }

  /**
   * Persist full application state to LocalStorage
   */
  public static saveState(state: WorkPulseState): void {
    try {
      const stateToSave: WorkPulseState = {
        ...state,
        version: CURRENT_SCHEMA_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.error('Failed to write WorkPulse state to LocalStorage:', err);
    }
  }

  /**
   * Schema migration handler
   */
  private static migrateState(stored: any): WorkPulseState {
    if (stored.version === '1.0.0') {
      const mergedSettings = { ...INITIAL_SAMPLE_STATE.userSettings, ...(stored.userSettings || {}) };
      // Upgrade default reminder to 22:00 (10:00 PM) if it was still the old 17:30 default
      if (mergedSettings.reminderTime === '17:30') {
        mergedSettings.reminderTime = '22:00';
      }
      if (mergedSettings.notificationEnabled === undefined) {
        mergedSettings.notificationEnabled = true;
      }
      if (mergedSettings.excludeWeekends === undefined) {
        mergedSettings.excludeWeekends = true;
      }

      // Upgrade default schedule reminder if needed
      const schedules = (Array.isArray(stored.schedules) ? stored.schedules : INITIAL_SAMPLE_STATE.schedules).map((s: TrackingSchedule) => {
        if (s.id === 'sched-default' && s.reminderTime === '17:30') {
          return { ...s, reminderTime: '22:00', name: 'Core Workdays Schedule (10:00 PM Reminder)' };
        }
        return s;
      });

      return {
        version: '1.0.0',
        userSettings: mergedSettings,
        tasks: Array.isArray(stored.tasks) ? stored.tasks : INITIAL_SAMPLE_STATE.tasks,
        dailyReports: Array.isArray(stored.dailyReports) ? stored.dailyReports : INITIAL_SAMPLE_STATE.dailyReports,
        schedules,
        blockers: Array.isArray(stored.blockers) ? stored.blockers : INITIAL_SAMPLE_STATE.blockers,
        doubts: Array.isArray(stored.doubts) ? stored.doubts : INITIAL_SAMPLE_STATE.doubts,
        learningEntries: Array.isArray(stored.learningEntries) ? stored.learningEntries : INITIAL_SAMPLE_STATE.learningEntries,
        notifications: Array.isArray(stored.notifications) ? stored.notifications : INITIAL_SAMPLE_STATE.notifications,
      };
    }
    return INITIAL_SAMPLE_STATE;
  }

  /**
   * Reset data to demonstration data
   */
  public static resetToDemonstrationData(): WorkPulseState {
    this.saveState(INITIAL_SAMPLE_STATE);
    return INITIAL_SAMPLE_STATE;
  }

  /**
   * Clear all user data to clean blank slate
   */
  public static clearAllData(userSettings?: UserSettings): WorkPulseState {
    const blankState: WorkPulseState = {
      version: CURRENT_SCHEMA_VERSION,
      userSettings: userSettings || INITIAL_SAMPLE_STATE.userSettings,
      tasks: [],
      dailyReports: [],
      schedules: [
        {
          id: 'sched-default',
          name: 'Core Workdays Schedule (10:00 PM Reminder)',
          frequency: 'Daily',
          startDate: CURRENT_DATE_STR,
          expectedDays: [1, 2, 3, 4, 5],
          reminderTime: userSettings?.reminderTime || '22:00',
          timezone: userSettings?.timezone || INITIAL_SAMPLE_STATE.userSettings.timezone,
          isActive: true
        }
      ],
      blockers: [],
      doubts: [],
      learningEntries: [],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          type: 'system',
          title: 'Workspace Ready',
          message: 'All records have been cleared. Ready for fresh logging.',
          date: new Date().toISOString(),
          read: false,
          linkSection: 'daily-logs'
        }
      ]
    };
    this.saveState(blankState);
    return blankState;
  }

  /**
   * Compute missed reporting periods deterministically without background timers.
   * Evaluates active schedules from their startDate up to the reference date (e.g. today).
   */
  public static calculateMissedEntries(
    schedules: TrackingSchedule[],
    dailyReports: DailyReport[],
    referenceDateStr: string = CURRENT_DATE_STR
  ): { missed: MissedPeriod[]; pendingToday: MissedPeriod[]; completedCount: number } {
    const existingDates = new Set(dailyReports.map(r => r.date));
    const missed: MissedPeriod[] = [];
    const pendingToday: MissedPeriod[] = [];
    let completedCount = 0;

    const refDate = new Date(referenceDateStr + 'T00:00:00');

    schedules.forEach(schedule => {
      if (!schedule.isActive) return;

      const startDate = new Date(schedule.startDate + 'T00:00:00');
      if (startDate > refDate) return;

      // Check dates starting from startDate up to refDate
      // For daily schedules: limit to max 30 days lookback to keep UI fast & clean
      const maxLookbackDays = 30;
      const effectiveStart = new Date(Math.max(startDate.getTime(), refDate.getTime() - maxLookbackDays * 86400000));
      
      const iter = new Date(effectiveStart);
      while (iter <= refDate) {
        const yyyy = iter.getFullYear();
        const mm = String(iter.getMonth() + 1).padStart(2, '0');
        const dd = String(iter.getDate()).padStart(2, '0');
        const dateKey = `${yyyy}-${mm}-${dd}`;
        const dayOfWeek = iter.getDay(); // 0 = Sun, 1 = Mon ...
        const dayOfMonth = iter.getDate();

        let isExpected = false;
        if (schedule.frequency === 'Daily') {
          isExpected = schedule.expectedDays.includes(dayOfWeek);
        } else if (schedule.frequency === 'Weekly') {
          isExpected = schedule.expectedDays.includes(dayOfWeek);
        } else if (schedule.frequency === 'Monthly') {
          isExpected = schedule.expectedDays.includes(dayOfMonth);
        }

        if (isExpected) {
          if (existingDates.has(dateKey)) {
            completedCount++;
          } else {
            const isToday = dateKey === referenceDateStr;
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const entry: MissedPeriod = {
              scheduleId: schedule.id,
              scheduleName: schedule.name,
              date: dateKey,
              dayName: dayNames[dayOfWeek],
              isToday,
            };

            if (isToday) {
              pendingToday.push(entry);
            } else {
              missed.push(entry);
            }
          }
        }

        iter.setDate(iter.getDate() + 1);
      }
    });

    // Deduplicate missed entries by date
    const uniqueMissedMap = new Map<string, MissedPeriod>();
    missed.forEach(m => uniqueMissedMap.set(m.date, m));
    const uniqueMissed = Array.from(uniqueMissedMap.values()).sort((a, b) => b.date.localeCompare(a.date));

    return {
      missed: uniqueMissed,
      pendingToday,
      completedCount
    };
  }

  /**
   * Export database as validated JSON file
   */
  public static exportJSON(state: WorkPulseState): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `workpulse-backup-${CURRENT_DATE_STR}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Validate uploaded JSON backup before applying
   */
  public static validateBackupJSON(jsonString: string): { valid: boolean; error?: string; state?: WorkPulseState } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'File does not contain a valid JSON object.' };
      }
      if (!parsed.version) {
        return { valid: false, error: 'Backup is missing the WorkPulse schema version header.' };
      }
      if (!Array.isArray(parsed.tasks)) {
        return { valid: false, error: 'Invalid backup: tasks collection is missing or malformed.' };
      }
      if (!Array.isArray(parsed.dailyReports)) {
        return { valid: false, error: 'Invalid backup: dailyReports collection is missing or malformed.' };
      }
      return { valid: true, state: parsed as WorkPulseState };
    } catch (e: any) {
      return { valid: false, error: `Invalid JSON syntax: ${e.message || 'Parsing error'}` };
    }
  }

  /**
   * CSV Export: Tasks
   */
  public static exportTasksCSV(tasks: Task[]): void {
    const headers = ['ID', 'Task Name', 'Project', 'Assigned By', 'Status', 'Priority', 'Est Hours', 'Actual Hours', 'Created Date', 'Completed Date', 'Archived'];
    const rows = tasks.map(t => [
      `"${t.id}"`,
      `"${t.name.replace(/"/g, '""')}"`,
      `"${t.project.replace(/"/g, '""')}"`,
      `"${t.assignedBy.replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${t.priority}"`,
      t.estimatedHours,
      t.actualHours,
      `"${t.createdAt}"`,
      `"${t.completedAt || ''}"`,
      t.archived ? 'Yes' : 'No'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.triggerDownload(csvContent, `workpulse-tasks-${CURRENT_DATE_STR}.csv`, 'text/csv');
  }

  /**
   * CSV Export: Daily Reports
   */
  public static exportDailyReportsCSV(reports: DailyReport[]): void {
    const headers = ['Report Date', 'Performance Rating', 'Rating Explanation', 'Reflection', 'Next Day Plan', 'Task Count'];
    const rows = reports.map(r => [
      `"${r.date}"`,
      r.performanceRating,
      `"${(r.ratingExplanation || '').replace(/"/g, '""')}"`,
      `"${r.reflection.replace(/"/g, '""')}"`,
      `"${r.nextDayPlan.replace(/"/g, '""')}"`,
      r.taskEntries.length
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.triggerDownload(csvContent, `workpulse-daily-reports-${CURRENT_DATE_STR}.csv`, 'text/csv');
  }

  /**
   * CSV Export: Blockers
   */
  public static exportBlockersCSV(blockers: Blocker[]): void {
    const headers = ['ID', 'Title', 'Severity', 'Status', 'Reported Date', 'Related Task', 'Description', 'Resolution Notes'];
    const rows = blockers.map(b => [
      `"${b.id}"`,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.severity}"`,
      `"${b.status}"`,
      `"${b.reportedDate}"`,
      `"${(b.relatedTaskName || '').replace(/"/g, '""')}"`,
      `"${b.description.replace(/"/g, '""')}"`,
      `"${(b.resolutionNotes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.triggerDownload(csvContent, `workpulse-blockers-${CURRENT_DATE_STR}.csv`, 'text/csv');
  }

  private static triggerDownload(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

