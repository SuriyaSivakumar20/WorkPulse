
export type TaskStatus =
  | 'Started'
  | 'In Progress'
  | 'Testing'
  | 'Debugging'
  | 'Completed'
  | 'Done';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TrackingFrequency = 'Daily' | 'Weekly' | 'Monthly';

export interface TaskProgressUpdate {
  id: string;
  date: string; // YYYY-MM-DD
  status: TaskStatus;
  timeSpentHours: number;
  notes: string;
  timestamp: string; // ISO string
}

export interface Task {
  id: string;
  name: string;
  assignedBy: string;
  project: string;
  trackingFrequency: TrackingFrequency;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours: number;
  actualHours: number;
  createdAt: string; // YYYY-MM-DD
  completedAt?: string; // YYYY-MM-DD
  archived: boolean;
  history: TaskProgressUpdate[];
  blockers?: string[];
  doubts?: string[];
  latestNotes?: string;
}

export interface DailyReportTaskEntry {
  taskId: string;
  taskName: string;
  assignedBy: string;
  project: string;
  trackingFrequency: TrackingFrequency;
  status: TaskStatus;
  estimatedHours: number;
  actualHours: number;
  progressNotes: string;
  blockers: string;
  doubts: string;
}

export interface DailyReport {
  id: string;
  date: string; // YYYY-MM-DD, unique index
  performanceRating: 1 | 2 | 3 | 4 | 5;
  ratingExplanation?: string;
  reflection: string;
  nextDayPlan: string;
  taskEntries: DailyReportTaskEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface TrackingSchedule {
  id: string;
  name: string;
  frequency: TrackingFrequency;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  expectedDays: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun. For monthly: day of month (e.g. 28)
  reminderTime: string; // HH:mm
  timezone: string;
  isActive: boolean;
}

export type BlockerSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type BlockerStatus = 'Open' | 'In Progress' | 'Resolved';

export interface Blocker {
  id: string;
  title: string;
  description: string;
  relatedTaskId?: string;
  relatedTaskName?: string;
  reportedDate: string; // YYYY-MM-DD
  severity: BlockerSeverity;
  status: BlockerStatus;
  resolutionNotes?: string;
  resolvedDate?: string;
}

export type DoubtStatus = 'To Discuss' | 'Discussed' | 'Resolved';

export interface Doubt {
  id: string;
  question: string;
  relatedTaskId?: string;
  relatedTaskName?: string;
  topic: string;
  dateRaised: string; // YYYY-MM-DD
  status: DoubtStatus;
  discussionNotes?: string;
  discussedDate?: string;
}

export interface LearningEntry {
  id: string;
  topic: string;
  technology: string;
  description: string;
  learningDate: string; // YYYY-MM-DD
  resources: string;
  personalNotes: string;
  confidenceLevel: 1 | 2 | 3 | 4 | 5; // 1=Beginner, 5=Mastery
}

export type NotificationType =
  | 'reminder'
  | 'missed_report'
  | 'blocker'
  | 'upcoming_task'
  | 'carried_forward'
  | 'system';

export interface InAppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string; // ISO
  read: boolean;
  linkSection?: NavigationSection;
  actionDate?: string; // Optional target date (e.g. for backfilling a missed report)
}

export interface UserSettings {
  userName: string;
  userRole: string;
  userInitials: string;
  timezone: string;
  reminderTime: string;
  defaultFrequency: TrackingFrequency;
  defaultExpectedDays: number[];
  notificationEnabled?: boolean;
  excludeWeekends?: boolean;
}

export interface WorkPulseState {
  version: string;
  userSettings: UserSettings;
  tasks: Task[];
  dailyReports: DailyReport[];
  schedules: TrackingSchedule[];
  blockers: Blocker[];
  doubts: Doubt[];
  learningEntries: LearningEntry[];
  notifications: InAppNotification[];
}

export type NavigationSection =
  | 'dashboard'
  | 'daily-logs'
  | 'tasks'
  | 'calendar'
  | 'analytics'
  | 'blockers'
  | 'learning'
  | 'reports'
  | 'settings';
