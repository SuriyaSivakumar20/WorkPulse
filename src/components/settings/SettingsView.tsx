import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Clock,
  Calendar,
  Shield,
  RotateCcw,
  Trash2,
  Save,
  Check,
  Download,
  AlertTriangle,
  Plus,
  Bell,
  Smartphone,
  Volume2,
  Send,
  CheckCircle2,
  Share2,
  PlusSquare,
  Info,
  X
} from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { TrackingSchedule, TrackingFrequency } from '../../types';
import { StorageService } from '../../services/storageService';
import { CURRENT_DATE_STR } from '../../services/sampleData';
import { notificationService, NextReminderInfo } from '../../services/notificationService';

const TIMEZONES = [
  'Asia/Kolkata',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const SettingsView: React.FC = () => {
  const {
    state,
    updateUserSettings,
    saveSchedule,
    deleteSchedule,
    resetToSampleData,
    clearAllData,
    showToast,
    pwaState,
    installApp,
    sendTestNotification,
    requestNotificationPermission
  } = useWorkPulse();

  const [permissionStatus, setPermissionStatus] = useState(notificationService.getPermissionStatus());
  const [nextReminder, setNextReminder] = useState<NextReminderInfo>(() => notificationService.getNextWeekday10PM());
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const update = () => {
      setPermissionStatus(notificationService.getPermissionStatus());
      setNextReminder(notificationService.getNextWeekday10PM());
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
    setPermissionStatus(notificationService.getPermissionStatus());
    setNextReminder(notificationService.getNextWeekday10PM());
  };

  const handleTestNotification = async () => {
    setIsSendingTest(true);
    await sendTestNotification();
    setIsSendingTest(false);
    setPermissionStatus(notificationService.getPermissionStatus());
  };

  const handleInstallClick = async () => {
    const outcome = await installApp();
    if (outcome === 'ios') {
      setShowIosGuide(true);
    }
  };

  // Profile Form state
  const [userName, setUserName] = useState(state.userSettings.userName);
  const [userRole, setUserRole] = useState(state.userSettings.userRole);
  const [userInitials, setUserInitials] = useState(state.userSettings.userInitials);
  const [timezone, setTimezone] = useState(state.userSettings.timezone);
  const [reminderTime, setReminderTime] = useState(state.userSettings.reminderTime);

  // Auto-sync form if userSettings change from reset
  React.useEffect(() => {
    setUserName(state.userSettings.userName);
    setUserRole(state.userSettings.userRole);
    setUserInitials(state.userSettings.userInitials);
    setTimezone(state.userSettings.timezone);
    setReminderTime(state.userSettings.reminderTime);
  }, [state.userSettings]);

  const handleNameChange = (val: string) => {
    setUserName(val);
    const parts = val.trim().split(/\s+/).filter(Boolean);
    if (parts.length > 0) {
      const generatedInitials = parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
      setUserInitials(generatedInitials);
    }
  };

  // New Schedule Modal state
  const [isNewSchedOpen, setIsNewSchedOpen] = useState(false);
  const [schedName, setSchedName] = useState('');
  const [schedFreq, setSchedFreq] = useState<TrackingFrequency>('Daily');
  const [schedDays, setSchedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserSettings({
      ...state.userSettings,
      userName: userName.trim(),
      userRole: userRole.trim(),
      userInitials: userInitials.trim().toUpperCase(),
      timezone,
      reminderTime
    });
  };

  const handleToggleSchedule = (sched: TrackingSchedule) => {
    saveSchedule({
      ...sched,
      isActive: !sched.isActive
    });
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedName.trim()) return;

    saveSchedule({
      id: `sched-${Date.now()}`,
      name: schedName.trim(),
      frequency: schedFreq,
      startDate: CURRENT_DATE_STR,
      expectedDays: schedDays,
      reminderTime,
      timezone,
      isActive: true
    });

    setIsNewSchedOpen(false);
    setSchedName('');
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset workspace to a fresh clean state for a new user? All tasks and logs will be wiped.')) {
      resetToSampleData();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('DANGER: Clear all personal journal entries, tasks, and historical logs? Your profile settings will be kept.')) {
      clearAllData();
    }
  };

  const toggleDaySelection = (dayIdx: number) => {
    setSchedDays(prev => 
      prev.includes(dayIdx) ? prev.filter(d => d !== dayIdx) : [...prev, dayIdx].sort()
    );
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-gold-500" />
            <h1 className="font-display text-3xl tracking-wider text-cream-200">
              PREFERENCES & GOVERNANCE
            </h1>
          </div>
          <p className="text-xs text-slate-350 mt-1">
            Personal identity preferences, tracking cadences, timezones, and offline data retention.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: User Profile & Preferences */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-navy-800 border border-navy-500 p-6 chamfer-tr">
            <div className="flex items-center gap-2 pb-3 border-b border-navy-500 mb-4">
              <User className="w-4 h-4 text-gold-500" />
              <h3 className="font-display text-lg tracking-wider text-cream-200">
                USER PROFILE & CADENCE
              </h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-350 uppercase mb-1">
                  FULL DISPLAY NAME
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-navy-900 border border-navy-500 px-3 py-2 text-xs text-cream-200 focus:border-gold-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                    ROLE / TITLE
                  </label>
                  <input
                    type="text"
                    value={userRole}
                    onChange={e => setUserRole(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-500 px-3 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                    AVATAR INITIALS
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={userInitials}
                    onChange={e => setUserInitials(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-500 px-3 py-1.5 text-xs text-gold-500 font-bold focus:border-gold-500 focus:outline-none font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                    TIMEZONE
                  </label>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-500 px-2 py-1.5 text-xs text-slate-350 focus:border-gold-500 focus:outline-none font-mono"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                    REMINDER TIME
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={e => setReminderTime(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-500 px-3 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs tracking-wider shadow-geometric-gold"
                >
                  <Save className="w-4 h-4" />
                  <span>SAVE PREFERENCES</span>
                </button>
              </div>
            </form>
          </div>

          {/* Web Application (PWA) & Device Installation Card */}
          <div className="bg-navy-800 border-2 border-gold-500/50 p-6 chamfer-tr shadow-geometric-gold">
            <div className="flex items-center justify-between pb-3 border-b border-navy-500 mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gold-500" />
                <h3 className="font-display text-lg tracking-wider text-cream-200">
                  WEB APPLICATION (PWA) ON PHONE
                </h3>
              </div>

              {pwaState.isInstalled ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/50 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  INSTALLED
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-gold-500/20 border border-gold-500/50 text-gold-400">
                  BROWSER MODE
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs text-slate-350">
              <p>
                WorkPulse is configured as an installable Progressive Web Application (PWA). You can install it directly to your phone's home screen to access it like a native mobile app without browser bars.
              </p>

              {!pwaState.isInstalled ? (
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs font-mono tracking-wider transition-colors shadow-geometric-gold"
                  >
                    <Download className="w-4 h-4" />
                    <span>INSTALL ON THIS DEVICE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowIosGuide(true)}
                    className="px-4 py-2.5 bg-navy-900 hover:bg-navy-750 text-slate-350 border border-navy-600 text-xs font-mono transition-colors"
                  >
                    IPHONE (IOS) INSTRUCTIONS
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-navy-900 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WorkPulse is running in standalone web application mode on this device.</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-450 pt-1">
                <div className="p-2 bg-navy-900 border border-navy-600">
                  <span className="text-cream-200 block font-bold mb-0.5">STANDALONE DISPLAY</span>
                  Runs edge-to-edge full screen
                </div>
                <div className="p-2 bg-navy-900 border border-navy-600">
                  <span className="text-cream-200 block font-bold mb-0.5">OFFLINE READY</span>
                  Service worker cached assets
                </div>
              </div>
            </div>
          </div>

          {/* Theme & Palette Specs Reference Card */}
          <div className="bg-navy-800 border border-navy-500 p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-navy-500 mb-3">
              <Shield className="w-4 h-4 text-gold-500" />
              <h3 className="font-display text-lg tracking-wider text-cream-200">
                BRAND SYSTEM & SPECIFICATIONS
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-350">
              <p>
                WorkPulse operates as a pure client-side application governed by a strict Swiss graphic design system and sports editorial color tokens:
              </p>
              <div className="grid grid-cols-3 gap-2 font-mono text-[10px] pt-1">
                <div className="p-2 bg-[#0F1432] border border-navy-500 text-cream-200">
                  PRIMARY NAVY<br />#0F1432
                </div>
                <div className="p-2 bg-[#FFAA00] text-navy-950 font-bold">
                  CROWS GOLD<br />#FFAA00
                </div>
                <div className="p-2 bg-[#FF001E] text-cream-200 font-bold">
                  CROWS RED<br />#FF001E
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tracking Schedules & Data Governance */}
        <div className="lg:col-span-6 space-y-6">
          {/* 10:00 PM Weekday Notifications Card */}
          <div className="bg-navy-800 border-2 border-gold-500/50 p-6 chamfer-tr shadow-geometric-gold">
            <div className="flex items-center justify-between pb-3 border-b border-navy-500 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gold-500" />
                <h3 className="font-display text-lg tracking-wider text-cream-200">
                  10:00 PM WEEKDAY NOTIFICATIONS
                </h3>
              </div>

              {permissionStatus === 'granted' ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/50 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  ACTIVE
                </span>
              ) : permissionStatus === 'denied' ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-red-500/20 border border-red-500/50 text-red-400">
                  <AlertTriangle className="w-3 h-3" />
                  BLOCKED
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-gold-500/20 border border-gold-500/50 text-gold-400">
                  PERMISSION NEEDED
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs text-slate-350">
              <p>
                Get automatic daily reminders at <strong>10:00 PM</strong> every weekday (<strong>Monday through Friday</strong>) to review your tasks, log blockers, and set tomorrow's priorities. Weekends (<strong>Saturday & Sunday</strong>) are strictly excluded.
              </p>

              {/* Next reminder pill */}
              <div className="p-3 bg-navy-900 border border-navy-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold-500 shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono text-slate-450 uppercase">NEXT SCHEDULED REMINDER</div>
                    <div className="font-bold text-cream-200 font-mono text-xs">
                      {nextReminder.formattedText}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-mono bg-navy-800 text-gold-400 border border-navy-600">
                  MON-FRI ONLY
                </span>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-1">
                {permissionStatus !== 'granted' && (
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs font-mono tracking-wider transition-colors shadow-geometric-gold"
                  >
                    <Bell className="w-4 h-4" />
                    <span>ENABLE 10:00 PM NOTIFICATIONS</span>
                  </button>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    disabled={isSendingTest}
                    onClick={handleTestNotification}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-navy-900 hover:bg-navy-750 text-gold-400 border border-gold-500/60 font-mono text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingTest ? 'SENDING TEST...' : 'SEND TEST NOTIFICATION NOW'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => notificationService.playChime()}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-navy-900 hover:bg-navy-750 text-slate-350 border border-navy-600 font-mono text-xs transition-colors"
                    title="Play chime sound"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-gold-400" />
                    <span>TEST SOUND</span>
                  </button>
                </div>
              </div>

              {/* Mobile Notification Hints */}
              <div className="p-3 bg-navy-950 border border-navy-700 space-y-1.5 text-[11px] text-slate-450 font-mono">
                <div className="flex items-center gap-1.5 text-slate-350 font-bold">
                  <Info className="w-3.5 h-3.5 text-gold-500" />
                  <span>MOBILE NOTIFICATION TIPS:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li><strong>Android:</strong> Allow notifications when prompted by Chrome. Vibration and sound are supported.</li>
                  <li><strong>iOS (iPhone):</strong> iOS 16.4+ requires adding WorkPulse to your Home Screen to receive Web Push notifications.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tracking Schedules Manager */}
          <div className="bg-navy-800 border border-navy-500 p-6 chamfer-tr">
            <div className="flex items-center justify-between pb-3 border-b border-navy-500 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-500" />
                <h3 className="font-display text-lg tracking-wider text-cream-200">
                  TRACKING SCHEDULES ({state.schedules.length})
                </h3>
              </div>

              <button
                onClick={() => setIsNewSchedOpen(true)}
                className="flex items-center gap-1 text-xs font-mono text-gold-500 hover:text-gold-400"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>NEW SCHEDULE</span>
              </button>
            </div>

            <div className="space-y-3">
              {state.schedules.map(sched => (
                <div
                  key={sched.id}
                  className="p-3.5 bg-navy-900 border border-navy-600/70 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-cream-200">
                        {sched.name}
                      </h4>
                      <span className="px-1.5 py-0.2 text-[9px] font-mono bg-navy-800 border border-navy-500 text-gold-400">
                        {sched.frequency.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-450 mt-1">
                      {sched.frequency === 'Daily' &&
                        `Expected: ${sched.expectedDays.map(d => WEEKDAY_NAMES[d]).join(', ')}`}
                      {sched.frequency === 'Weekly' &&
                        `Expected: ${WEEKDAY_NAMES[sched.expectedDays[0] || 5]}`}
                      {sched.frequency === 'Monthly' &&
                        `Expected: ${sched.expectedDays[0] || 28}th of month`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleSchedule(sched)}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold border transition-colors ${
                        sched.isActive
                          ? 'bg-gold-500/15 border-gold-500 text-gold-400'
                          : 'bg-navy-800 border-navy-600 text-slate-500'
                      }`}
                    >
                      {sched.isActive ? 'ACTIVE' : 'PAUSED'}
                    </button>

                    {state.schedules.length > 1 && (
                      <button
                        onClick={() => deleteSchedule(sched.id)}
                        className="p-1 text-slate-500 hover:text-red-400"
                        title="Delete Schedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Offline Data Controls & Sample Data Management */}
          <div className="bg-navy-800 border border-navy-500 p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-navy-500 mb-4">
              <RotateCcw className="w-4 h-4 text-gold-500" />
              <h3 className="font-display text-lg tracking-wider text-cream-200">
                STORAGE & DATA MANAGEMENT
              </h3>
            </div>

            <div className="space-y-4 text-xs text-slate-350">
              <p>
                WorkPulse persists all records privately in your browser's LocalStorage under schema <code className="text-gold-400">v1.0.0</code>. No server sync or external APIs are involved.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleResetDemo}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-750 text-gold-400 border border-gold-500/60 font-mono text-xs font-bold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET TO CLEAN SLATE</span>
                </button>

                <button
                  onClick={handleClearAll}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-500 font-mono text-xs font-bold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>CLEAR ALL RECORDS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Schedule Modal */}
      {isNewSchedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-navy-900 border-2 border-gold-500 p-6 space-y-4 shadow-2xl chamfer-tr">
            <h3 className="font-display text-xl text-cream-200 tracking-wider">
              CREATE TRACKING SCHEDULE
            </h3>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-350 uppercase mb-1">
                  SCHEDULE NAME
                </label>
                <input
                  type="text"
                  value={schedName}
                  onChange={e => setSchedName(e.target.value)}
                  placeholder="e.g. SRE Incident On-Call Cadence..."
                  className="w-full bg-navy-800 border border-navy-500 px-3 py-2 text-xs text-cream-200 focus:border-gold-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                  FREQUENCY
                </label>
                <select
                  value={schedFreq}
                  onChange={e => setSchedFreq(e.target.value as TrackingFrequency)}
                  className="w-full bg-navy-800 border border-navy-500 px-2 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              {schedFreq === 'Daily' && (
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                    EXPECTED REPORTING DAYS
                  </label>
                  <div className="flex items-center gap-1.5">
                    {WEEKDAY_NAMES.map((name, idx) => {
                      const isSelected = schedDays.includes(idx);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => toggleDaySelection(idx)}
                          className={`w-9 h-8 text-[11px] font-mono font-bold border transition-colors ${
                            isSelected
                              ? 'bg-gold-500 text-navy-950 border-gold-400'
                              : 'bg-navy-800 text-slate-450 border-navy-600'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-navy-700">
                <button
                  type="button"
                  onClick={() => setIsNewSchedOpen(false)}
                  className="px-4 py-2 bg-navy-800 text-slate-350 text-xs font-mono"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold-500 text-navy-950 font-black text-xs font-mono shadow-geometric-gold"
                >
                  ADD SCHEDULE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* iOS Installation Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-navy-900 border-2 border-gold-500 p-6 space-y-4 shadow-2xl chamfer-tr text-cream-200">
            <div className="flex items-center justify-between pb-3 border-b border-navy-500">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-gold-500" />
                <h3 className="font-display text-lg tracking-wider text-cream-200">
                  INSTALL ON IPHONE / IPAD
                </h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="text-slate-450 hover:text-cream-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-350">
              To install WorkPulse on your iPhone or iPad, follow these simple steps in Safari:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-start gap-3 p-3 bg-navy-800 border border-navy-600/60">
                <div className="p-1.5 bg-navy-900 border border-navy-500 text-gold-400 shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-cream-200">Step 1: Tap Share</span>
                  <p className="text-[11px] text-slate-450 mt-0.5">
                    Tap the Share icon at the bottom of Safari (the square with an arrow pointing up).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-navy-800 border border-navy-600/60">
                <div className="p-1.5 bg-navy-900 border border-navy-500 text-gold-400 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-cream-200">Step 2: Add to Home Screen</span>
                  <p className="text-[11px] text-slate-450 mt-0.5">
                    Scroll down and select <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-navy-800 border border-navy-600/60">
                <div className="p-1.5 bg-navy-900 border border-navy-500 text-gold-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-cream-200">Step 3: Tap Add</span>
                  <p className="text-[11px] text-slate-450 mt-0.5">
                    Tap <strong>"Add"</strong> in the top right corner. WorkPulse will appear on your Home Screen as a full web app with 10:00 PM push reminders!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowIosGuide(false)}
                className="px-5 py-2 bg-gold-500 text-navy-950 font-black text-xs font-mono tracking-wider shadow-geometric-gold"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

