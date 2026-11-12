import { WorkPulseState } from '../types';

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const CURRENT_DATE_STR = getTodayDateString();

// Clean default state for a new user
export const INITIAL_NEW_USER_STATE: WorkPulseState = {
  version: '1.0.0',
  userSettings: {
    userName: 'New User',
    userRole: 'Software Engineer',
    userInitials: 'NU',
    timezone: typeof Intl !== 'undefined' && Intl.DateTimeFormat ? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata') : 'Asia/Kolkata',
    reminderTime: '17:30',
    defaultFrequency: 'Daily',
    defaultExpectedDays: [1, 2, 3, 4, 5], // Monday to Friday
  },
  schedules: [
    {
      id: 'sched-default',
      name: 'Core Workdays Schedule',
      frequency: 'Daily',
      startDate: CURRENT_DATE_STR,
      expectedDays: [1, 2, 3, 4, 5],
      reminderTime: '17:30',
      timezone: typeof Intl !== 'undefined' && Intl.DateTimeFormat ? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata') : 'Asia/Kolkata',
      isActive: true,
    }
  ],
  tasks: [],
  dailyReports: [],
  blockers: [],
  doubts: [],
  learningEntries: [],
  notifications: [
    {
      id: 'notif-welcome',
      type: 'system',
      title: 'Welcome to WorkPulse',
      message: "Your personal performance journal is ready. Start by logging today's work or adding your first task.",
      date: new Date().toISOString(),
      read: false,
      linkSection: 'daily-logs'
    }
  ]
};

// Aliased as INITIAL_SAMPLE_STATE so existing imports continue working smoothly
export const INITIAL_SAMPLE_STATE: WorkPulseState = INITIAL_NEW_USER_STATE;
