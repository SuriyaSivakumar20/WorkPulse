import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { TrackingSchedule, TrackingFrequency } from '../../types';
import { StorageService } from '../../services/storageService';
import { CURRENT_DATE_STR } from '../../services/sampleData';

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
    showToast
  } = useWorkPulse();

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
    </div>
  );
};

