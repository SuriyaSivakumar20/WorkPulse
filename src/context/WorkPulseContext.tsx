import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  WorkPulseState,
  NavigationSection,
  DailyReport,
  Task,
  TrackingSchedule,
  Blocker,
  Doubt,
  LearningEntry,
  InAppNotification,
  UserSettings,
  DailyReportTaskEntry
} from '../types';
import { StorageService, MissedPeriod } from '../services/storageService';
import { CURRENT_DATE_STR } from '../services/sampleData';
import { notificationService } from '../services/notificationService';
import { pwaService, PWAInstallState } from '../services/pwaService';

interface WorkPulseContextType {
  state: WorkPulseState;
  activeSection: NavigationSection;
  setActiveSection: (sec: NavigationSection) => void;
  selectedReportDate: string | null;
  setSelectedReportDate: (date: string | null) => void;
  missedStats: { missed: MissedPeriod[]; pendingToday: MissedPeriod[]; completedCount: number };
  
  // Daily Reports
  todayReport: DailyReport | undefined;
  isTodayReportSubmitted: boolean;
  saveDailyReport: (report: DailyReport) => void;
  deleteDailyReport: (id: string) => void;
  
  // Tasks
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'history'>) => Task;
  updateTask: (task: Task) => void;
  archiveTask: (id: string) => void;
  deleteTask: (id: string) => void;
  
  // Blockers & Doubts
  saveBlocker: (blocker: Blocker) => void;
  deleteBlocker: (id: string) => void;
  saveDoubt: (doubt: Doubt) => void;
  deleteDoubt: (id: string) => void;
  
  // Learning
  saveLearningEntry: (entry: LearningEntry) => void;
  deleteLearningEntry: (id: string) => void;
  
  // Schedules
  saveSchedule: (schedule: TrackingSchedule) => void;
  deleteSchedule: (id: string) => void;
  
  // Settings & Notifications
  updateUserSettings: (settings: UserSettings) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  sendTestNotification: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<string>;
  
  // PWA App Installation
  pwaState: PWAInstallState;
  installApp: () => Promise<'accepted' | 'dismissed' | 'ios' | 'unavailable'>;
  
  // Data actions
  resetToSampleData: () => void;
  clearAllData: () => void;
  restoreFromJSON: (newState: WorkPulseState) => void;
  
  // Notification toast helper
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const WorkPulseContext = createContext<WorkPulseContextType | undefined>(undefined);

export const WorkPulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WorkPulseState>(() => StorageService.loadState());
  const [activeSection, setActiveSection] = useState<NavigationSection>('dashboard');
  const [selectedReportDate, setSelectedReportDate] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to LocalStorage whenever state changes
  useEffect(() => {
    StorageService.saveState(state);
  }, [state]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Compute missed reporting periods
  const missedStats = useMemo(() => {
    return StorageService.calculateMissedEntries(state.schedules, state.dailyReports, CURRENT_DATE_STR);
  }, [state.schedules, state.dailyReports]);

  // Today's report
  const todayReport = useMemo(() => {
    return state.dailyReports.find(r => r.date === CURRENT_DATE_STR);
  }, [state.dailyReports]);

  const isTodayReportSubmitted = Boolean(todayReport);

  // Daily Report saving with automatic task history preservation!
  const saveDailyReport = useCallback((report: DailyReport) => {
    setState(prev => {
      // 1. Update or append daily report
      const existingIdx = prev.dailyReports.findIndex(r => r.date === report.date);
      const updatedReports = [...prev.dailyReports];
      if (existingIdx >= 0) {
        updatedReports[existingIdx] = { ...report, updatedAt: new Date().toISOString() };
      } else {
        updatedReports.push({ ...report, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }

      // 2. Synchronize task history without erasing previous progress
      const updatedTasks = prev.tasks.map(task => {
        const matchingEntry = report.taskEntries.find(e => e.taskId === task.id);
        if (!matchingEntry) return task;

        // Check if a history update already exists for this date
        const existingHistIdx = task.history.findIndex(h => h.date === report.date);
        const newHistory = [...task.history];
        
        const historyUpdate = {
          id: existingHistIdx >= 0 ? newHistory[existingHistIdx].id : `hist-${task.id}-${Date.now()}`,
          date: report.date,
          status: matchingEntry.status,
          timeSpentHours: matchingEntry.actualHours,
          notes: matchingEntry.progressNotes,
          timestamp: new Date().toISOString()
        };

        if (existingHistIdx >= 0) {
          newHistory[existingHistIdx] = historyUpdate;
        } else {
          newHistory.push(historyUpdate);
        }

        // Recalculate total actual hours from history
        const totalActual = newHistory.reduce((acc, h) => acc + (h.timeSpentHours || 0), 0);

        return {
          ...task,
          status: matchingEntry.status,
          actualHours: totalActual > 0 ? totalActual : task.actualHours,
          latestNotes: matchingEntry.progressNotes || task.latestNotes,
          completedAt: (matchingEntry.status === 'Completed' || matchingEntry.status === 'Done') ? (task.completedAt || report.date) : task.completedAt,
          history: newHistory
        };
      });

      // 3. Automatically add new tasks from entries if they did not exist in task list
      report.taskEntries.forEach(entry => {
        const exists = updatedTasks.some(t => t.id === entry.taskId);
        if (!exists && entry.taskName.trim()) {
          updatedTasks.push({
            id: entry.taskId,
            name: entry.taskName,
            assignedBy: entry.assignedBy || 'Self-Directed',
            project: entry.project || 'General',
            trackingFrequency: entry.trackingFrequency || 'Daily',
            status: entry.status,
            priority: 'Medium',
            estimatedHours: entry.estimatedHours || 4,
            actualHours: entry.actualHours || 0,
            createdAt: report.date,
            archived: false,
            latestNotes: entry.progressNotes,
            completedAt: (entry.status === 'Completed' || entry.status === 'Done') ? report.date : undefined,
            history: [
              {
                id: `hist-${entry.taskId}-${Date.now()}`,
                date: report.date,
                status: entry.status,
                timeSpentHours: entry.actualHours,
                notes: entry.progressNotes,
                timestamp: new Date().toISOString()
              }
            ]
          });
        }
      });

      return {
        ...prev,
        dailyReports: updatedReports,
        tasks: updatedTasks
      };
    });

    showToast(`Daily Report for ${report.date} saved successfully.`);
  }, [showToast]);

  const deleteDailyReport = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      dailyReports: prev.dailyReports.filter(r => r.id !== id)
    }));
    showToast('Daily Report removed.');
  }, [showToast]);

  // Task actions
  const createTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'history'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: CURRENT_DATE_STR,
      history: [
        {
          id: `hist-init-${Date.now()}`,
          date: CURRENT_DATE_STR,
          status: taskData.status,
          timeSpentHours: taskData.actualHours || 0,
          notes: taskData.latestNotes || 'Task initiated.',
          timestamp: new Date().toISOString()
        }
      ]
    };

    setState(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));

    showToast(`Task "${newTask.name}" created.`);
    return newTask;
  }, [showToast]);

  const updateTask = useCallback((updatedTask: Task) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    }));
    showToast(`Task "${updatedTask.name}" updated.`);
  }, [showToast]);

  const archiveTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, archived: !t.archived } : t)
    }));
    showToast('Task archive state toggled.');
  }, [showToast]);

  const deleteTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
    showToast('Task deleted.');
  }, [showToast]);

  // Blockers
  const saveBlocker = useCallback((blocker: Blocker) => {
    setState(prev => {
      const idx = prev.blockers.findIndex(b => b.id === blocker.id);
      if (idx >= 0) {
        const updated = [...prev.blockers];
        updated[idx] = blocker;
        return { ...prev, blockers: updated };
      }
      return { ...prev, blockers: [blocker, ...prev.blockers] };
    });
    showToast(`Blocker "${blocker.title}" saved.`);
  }, [showToast]);

  const deleteBlocker = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      blockers: prev.blockers.filter(b => b.id !== id)
    }));
    showToast('Blocker removed.');
  }, [showToast]);

  // Doubts
  const saveDoubt = useCallback((doubt: Doubt) => {
    setState(prev => {
      const idx = prev.doubts.findIndex(d => d.id === doubt.id);
      if (idx >= 0) {
        const updated = [...prev.doubts];
        updated[idx] = doubt;
        return { ...prev, doubts: updated };
      }
      return { ...prev, doubts: [doubt, ...prev.doubts] };
    });
    showToast('Question saved.');
  }, [showToast]);

  const deleteDoubt = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      doubts: prev.doubts.filter(d => d.id !== id)
    }));
    showToast('Question removed.');
  }, [showToast]);

  // Learning
  const saveLearningEntry = useCallback((entry: LearningEntry) => {
    setState(prev => {
      const idx = prev.learningEntries.findIndex(e => e.id === entry.id);
      if (idx >= 0) {
        const updated = [...prev.learningEntries];
        updated[idx] = entry;
        return { ...prev, learningEntries: updated };
      }
      return { ...prev, learningEntries: [entry, ...prev.learningEntries] };
    });
    showToast(`Learning entry "${entry.topic}" saved.`);
  }, [showToast]);

  const deleteLearningEntry = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      learningEntries: prev.learningEntries.filter(e => e.id !== id)
    }));
    showToast('Learning entry removed.');
  }, [showToast]);

  // Schedules
  const saveSchedule = useCallback((sched: TrackingSchedule) => {
    setState(prev => {
      const idx = prev.schedules.findIndex(s => s.id === sched.id);
      if (idx >= 0) {
        const updated = [...prev.schedules];
        updated[idx] = sched;
        return { ...prev, schedules: updated };
      }
      return { ...prev, schedules: [...prev.schedules, sched] };
    });
    showToast(`Schedule "${sched.name}" updated.`);
  }, [showToast]);

  const deleteSchedule = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      schedules: prev.schedules.filter(s => s.id !== id)
    }));
    showToast('Schedule removed.');
  }, [showToast]);

  // Settings & Notifications
  const updateUserSettings = useCallback((settings: UserSettings) => {
    setState(prev => ({
      ...prev,
      userSettings: settings
    }));
    showToast('User preferences updated.');
  }, [showToast]);

  const markNotificationRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
    showToast('All notifications marked as read.');
  }, [showToast]);

  const [pwaState, setPwaState] = useState<PWAInstallState>(() => pwaService.getState());

  // Subscribe to PWA install state updates
  useEffect(() => {
    return pwaService.subscribe((newState) => {
      setPwaState(newState);
    });
  }, []);

  // Listen to scheduled 10:00 PM weekday reminder triggers
  useEffect(() => {
    const unsubscribe = notificationService.onReminderTrigger((date) => {
      const newNotif: InAppNotification = {
        id: `notif-reminder-${Date.now()}`,
        type: 'reminder',
        title: '10:00 PM Daily Log Reminder',
        message: "It's 10:00 PM! Don't forget to submit your daily work log, record blockers, and prepare tomorrow's plan.",
        date: date.toISOString(),
        read: false,
        linkSection: 'daily-logs'
      };
      setState(prev => ({
        ...prev,
        notifications: [newNotif, ...prev.notifications]
      }));
      showToast("10:00 PM Reminder: Time to log today's work.");
    });
    return unsubscribe;
  }, [showToast]);

  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    const success = await notificationService.sendTestNotification();
    if (success) {
      showToast('Test notification sent! Check your device notifications.');
    } else {
      showToast('Notification permission is required to receive reminders.');
    }
    return success;
  }, [showToast]);

  const requestNotificationPermission = useCallback(async (): Promise<string> => {
    const result = await notificationService.requestPermission();
    if (result === 'granted') {
      showToast('Notifications enabled! Daily 10:00 PM reminders are active.');
    } else if (result === 'denied') {
      showToast('Notifications blocked in browser settings. Please enable them to get reminders.');
    }
    return result;
  }, [showToast]);

  const installApp = useCallback(async () => {
    const outcome = await pwaService.promptInstall();
    if (outcome === 'accepted') {
      showToast('WorkPulse installed successfully!');
    }
    return outcome;
  }, [showToast]);

  // Restore & Reset
  const resetToSampleData = useCallback(() => {
    const defaultState = StorageService.resetToDemonstrationData();
    setState(defaultState);
    showToast('Restored demonstration data successfully.');
  }, [showToast]);

  const clearAllData = useCallback(() => {
    const blank = StorageService.clearAllData(state.userSettings);
    setState(blank);
    showToast('All journal records cleared.');
  }, [state.userSettings, showToast]);

  const restoreFromJSON = useCallback((newState: WorkPulseState) => {
    StorageService.saveState(newState);
    setState(newState);
    showToast('Backup restored successfully!');
  }, [showToast]);

  return (
    <WorkPulseContext.Provider
      value={{
        state,
        activeSection,
        setActiveSection,
        selectedReportDate,
        setSelectedReportDate,
        missedStats,
        todayReport,
        isTodayReportSubmitted,
        saveDailyReport,
        deleteDailyReport,
        createTask,
        updateTask,
        archiveTask,
        deleteTask,
        saveBlocker,
        deleteBlocker,
        saveDoubt,
        deleteDoubt,
        saveLearningEntry,
        deleteLearningEntry,
        saveSchedule,
        deleteSchedule,
        updateUserSettings,
        markNotificationRead,
        markAllNotificationsRead,
        sendTestNotification,
        requestNotificationPermission,
        pwaState,
        installApp,
        resetToSampleData,
        clearAllData,
        restoreFromJSON,
        toastMessage,
        showToast
      }}
    >
      {children}
    </WorkPulseContext.Provider>
  );
};

export const useWorkPulse = () => {
  const context = useContext(WorkPulseContext);
  if (!context) {
    throw new Error('useWorkPulse must be used within a WorkPulseProvider');
  }
  return context;
};

