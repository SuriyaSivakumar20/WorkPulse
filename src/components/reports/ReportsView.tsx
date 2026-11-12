import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Upload,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Star,
  Clock,
  Sparkles,
  HelpCircle,
  Table,
  FileCode,
  ShieldAlert
} from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { StorageService } from '../../services/storageService';
import { CURRENT_DATE_STR } from '../../services/sampleData';
import { WorkPulseState } from '../../types';

export const ReportsView: React.FC = () => {
  const { state, restoreFromJSON, showToast } = useWorkPulse();

  const [period, setPeriod] = useState<'current_week' | 'last_week' | 'current_month' | 'all_time'>('current_week');
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<WorkPulseState | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Filter records based on selected period
  const periodFiltered = useMemo(() => {
    const curr = new Date(CURRENT_DATE_STR + 'T00:00:00');
    const dayOfWeek = curr.getDay();
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mondayThisWeek = new Date(curr.getTime() + diffToMon * 86400000);
    const sundayThisWeek = new Date(mondayThisWeek.getTime() + 6 * 86400000);

    const formatDate = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    let start = formatDate(mondayThisWeek);
    let end = formatDate(sundayThisWeek);

    if (period === 'last_week') {
      const mondayLastWeek = new Date(mondayThisWeek.getTime() - 7 * 86400000);
      const sundayLastWeek = new Date(mondayThisWeek.getTime() - 1 * 86400000);
      start = formatDate(mondayLastWeek);
      end = formatDate(sundayLastWeek);
    } else if (period === 'current_month') {
      const firstDay = new Date(curr.getFullYear(), curr.getMonth(), 1);
      const lastDay = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
      start = formatDate(firstDay);
      end = formatDate(lastDay);
    } else if (period === 'all_time') {
      start = '2000-01-01';
      end = '2099-12-31';
    }

    const reports = state.dailyReports.filter(r => r.date >= start && r.date <= end);
    const tasks = state.tasks.filter(t => t.createdAt <= end);
    const blockers = state.blockers.filter(b => b.reportedDate >= start && b.reportedDate <= end);
    const doubts = state.doubts.filter(d => d.dateRaised >= start && d.dateRaised <= end);
    const learning = state.learningEntries.filter(l => l.learningDate >= start && l.learningDate <= end);

    const completedTasks = tasks.filter(t => t.status === 'Completed' || t.status === 'Done');
    const carriedTasks = tasks.filter(t => t.history.length > 1);
    const pendingTasks = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Done');

    const totalHours = reports.reduce(
      (sum, r) => sum + r.taskEntries.reduce((acc, e) => acc + (e.actualHours || 0), 0),
      0
    );

    const ratings = reports.map(r => r.performanceRating);
    const avgRating = ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : '0.0';

    return {
      start,
      end,
      reports,
      tasks,
      completedTasks,
      carriedTasks,
      pendingTasks,
      blockers,
      doubts,
      learning,
      totalHours,
      avgRating
    };
  }, [state, period]);

  // Handle JSON restore file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const result = StorageService.validateBackupJSON(content);
      if (!result.valid || !result.state) {
        setRestoreError(result.error || 'Invalid backup format.');
        setPendingRestoreData(null);
      } else {
        setRestoreError(null);
        setPendingRestoreData(result.state);
      }
      setIsRestoreModalOpen(true);
    };
    reader.readAsText(file);
    // Reset file input value so same file can be re-selected
    e.target.value = '';
  };

  const confirmRestore = () => {
    if (pendingRestoreData) {
      restoreFromJSON(pendingRestoreData);
      setIsRestoreModalOpen(false);
      setPendingRestoreData(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-gold-500" />
            <h1 className="font-display text-3xl tracking-wider text-cream-200">
              REPORTS & AUDIT EXPORTS
            </h1>
          </div>
          <p className="text-xs text-slate-350 mt-1">
            Weekly and monthly productivity synthesis, structured CSV exports, and offline JSON backup restores.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center bg-navy-800 border border-navy-500 p-0.5 font-mono text-xs">
          <button
            onClick={() => setPeriod('current_week')}
            className={`px-3 py-1 font-bold transition-colors ${
              period === 'current_week' ? 'bg-gold-500 text-navy-950' : 'text-slate-350 hover:text-cream-200'
            }`}
          >
            CURRENT WEEK
          </button>
          <button
            onClick={() => setPeriod('last_week')}
            className={`px-3 py-1 font-bold transition-colors ${
              period === 'last_week' ? 'bg-gold-500 text-navy-950' : 'text-slate-350 hover:text-cream-200'
            }`}
          >
            LAST WEEK
          </button>
          <button
            onClick={() => setPeriod('current_month')}
            className={`px-3 py-1 font-bold transition-colors ${
              period === 'current_month' ? 'bg-gold-500 text-navy-950' : 'text-slate-350 hover:text-cream-200'
            }`}
          >
            MONTH (NOV 2026)
          </button>
          <button
            onClick={() => setPeriod('all_time')}
            className={`px-3 py-1 font-bold transition-colors ${
              period === 'all_time' ? 'bg-gold-500 text-navy-950' : 'text-slate-350 hover:text-cream-200'
            }`}
          >
            ALL TIME
          </button>
        </div>
      </div>

      {/* Export & Backup Tools Card */}
      <div className="bg-navy-800 border border-navy-500 p-5 chamfer-tr">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg tracking-wider text-cream-200">
              DATA PORTABILITY & LOCAL ARCHIVES
            </h3>
            <p className="text-xs text-slate-350">
              Export pure CSV sheets for spreadsheets or download a tamper-checked JSON snapshot.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => StorageService.exportTasksCSV(state.tasks)}
              className="flex items-center gap-1.5 px-3 py-2 bg-navy-900 hover:bg-navy-750 text-slate-350 hover:text-gold-400 border border-navy-600 text-xs font-mono"
            >
              <Table className="w-3.5 h-3.5" />
              <span>TASKS CSV</span>
            </button>

            <button
              onClick={() => StorageService.exportDailyReportsCSV(state.dailyReports)}
              className="flex items-center gap-1.5 px-3 py-2 bg-navy-900 hover:bg-navy-750 text-slate-350 hover:text-gold-400 border border-navy-600 text-xs font-mono"
            >
              <Table className="w-3.5 h-3.5" />
              <span>DAILY LOGS CSV</span>
            </button>

            <button
              onClick={() => StorageService.exportBlockersCSV(state.blockers)}
              className="flex items-center gap-1.5 px-3 py-2 bg-navy-900 hover:bg-navy-750 text-slate-350 hover:text-gold-400 border border-navy-600 text-xs font-mono"
            >
              <Table className="w-3.5 h-3.5" />
              <span>BLOCKERS CSV</span>
            </button>

            <button
              onClick={() => StorageService.exportJSON(state)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs font-mono shadow-geometric-gold"
            >
              <Download className="w-4 h-4" />
              <span>BACKUP JSON</span>
            </button>

            <label className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-750 text-cream-200 border border-gold-500/60 text-xs font-mono cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-gold-500" />
              <span>RESTORE JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Synthesis Executive Summary */}
      <div className="bg-navy-850 border border-navy-500 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-navy-500">
          <div>
            <span className="text-[10px] font-mono font-bold text-gold-500 uppercase tracking-widest">
              PRODUCTIVITY SYNTHESIS
            </span>
            <h2 className="font-display text-2xl text-cream-200 tracking-wider">
              PERIOD PERFORMANCE REPORT: {period.replace('_', ' ').toUpperCase()}
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-450">
            RANGE: {periodFiltered.start} TO {periodFiltered.end}
          </div>
        </div>

        {/* Aggregated KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 bg-navy-800 border border-navy-600/70">
            <div className="text-[10px] font-mono text-slate-450 uppercase">HOURS LOGGED</div>
            <div className="font-display text-2xl text-cream-200">{periodFiltered.totalHours}h</div>
          </div>
          <div className="p-3.5 bg-navy-800 border border-navy-600/70">
            <div className="text-[10px] font-mono text-gold-500 uppercase font-bold">COMPLETED</div>
            <div className="font-display text-2xl text-gold-500">{periodFiltered.completedTasks.length}</div>
          </div>
          <div className="p-3.5 bg-navy-800 border border-navy-600/70">
            <div className="text-[10px] font-mono text-slate-450 uppercase">CARRIED FORWARD</div>
            <div className="font-display text-2xl text-cream-200">{periodFiltered.carriedTasks.length}</div>
          </div>
          <div className="p-3.5 bg-navy-800 border border-navy-600/70">
            <div className="text-[10px] font-mono text-slate-450 uppercase">ACTIVE PENDING</div>
            <div className="font-display text-2xl text-cream-200">{periodFiltered.pendingTasks.length}</div>
          </div>
          <div className="p-3.5 bg-navy-800 border border-navy-600/70">
            <div className="text-[10px] font-mono text-gold-400 uppercase font-bold">AVG RATING</div>
            <div className="font-display text-2xl text-cream-200">{periodFiltered.avgRating}/5</div>
          </div>
          <div className="p-3.5 bg-navy-800 border border-navy-600/70">
            <div className="text-[10px] font-mono text-red-400 uppercase font-bold">BLOCKERS</div>
            <div className="font-display text-2xl text-red-400">{periodFiltered.blockers.length}</div>
          </div>
        </div>

        {/* Breakdown Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Completed Deliverables */}
          <div className="p-4 bg-navy-800 border border-navy-600/70 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-navy-700">
              <CheckCircle className="w-4 h-4 text-gold-500" />
              <h4 className="font-display text-base tracking-wider text-cream-200">
                DELIVERED MILESTONES ({periodFiltered.completedTasks.length})
              </h4>
            </div>

            {periodFiltered.completedTasks.length === 0 ? (
              <div className="text-xs text-slate-500 py-4">No completed tasks in this window.</div>
            ) : (
              <ul className="space-y-2 text-xs">
                {periodFiltered.completedTasks.map(t => (
                  <li key={t.id} className="p-2.5 bg-navy-900 border border-navy-700/60">
                    <div className="font-bold text-cream-200">{t.name}</div>
                    <div className="text-[10px] font-mono text-slate-450 mt-1 flex justify-between">
                      <span>{t.project}</span>
                      <span className="text-gold-500 font-bold">{t.actualHours}h</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Column 2: Blockers & Questions Resolved */}
          <div className="p-4 bg-navy-800 border border-navy-600/70 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-navy-700">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h4 className="font-display text-base tracking-wider text-cream-200">
                IMPEDIMENTS & DISCUSSIONS
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              {periodFiltered.blockers.map(b => (
                <div key={b.id} className="p-2.5 bg-navy-900 border-l-2 border-l-red-500 border border-navy-700/60">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-red-400 font-bold">{b.severity}</span>
                    <span className="text-slate-500">{b.status}</span>
                  </div>
                  <div className="font-bold text-cream-200 mt-0.5">{b.title}</div>
                </div>
              ))}

              {periodFiltered.doubts.map(d => (
                <div key={d.id} className="p-2.5 bg-navy-900 border-l-2 border-l-gold-500 border border-navy-700/60">
                  <div className="text-[10px] font-mono text-gold-400">{d.topic}</div>
                  <div className="text-cream-200 font-medium mt-0.5 line-clamp-2">{d.question}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Learning & Technical Growth */}
          <div className="p-4 bg-navy-800 border border-navy-600/70 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-navy-700">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <h4 className="font-display text-base tracking-wider text-cream-200">
                GROWTH ACHIEVEMENTS ({periodFiltered.learning.length})
              </h4>
            </div>

            {periodFiltered.learning.length === 0 ? (
              <div className="text-xs text-slate-500 py-4">No learning records in this period.</div>
            ) : (
              <ul className="space-y-2 text-xs">
                {periodFiltered.learning.map(l => (
                  <li key={l.id} className="p-2.5 bg-navy-900 border border-navy-700/60">
                    <div className="text-[10px] font-mono text-gold-400 font-bold">{l.technology}</div>
                    <div className="font-bold text-cream-200 mt-0.5">{l.topic}</div>
                    <div className="text-[11px] text-slate-450 mt-1 line-clamp-2">{l.description}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* JSON Restore Confirmation Modal */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-navy-900 border-2 border-gold-500 p-6 space-y-4 shadow-2xl chamfer-tr">
            <div className="flex items-center gap-2.5 text-gold-500 pb-2 border-b border-navy-700">
              <ShieldAlert className="w-6 h-6 text-gold-500" />
              <h3 className="font-display text-xl text-cream-200 tracking-wider">
                CONFIRM BACKUP RESTORATION
              </h3>
            </div>

            {restoreError ? (
              <div className="p-3 bg-red-950/80 border border-red-500 text-red-200 text-xs">
                {restoreError}
              </div>
            ) : pendingRestoreData ? (
              <div className="space-y-3 text-xs text-slate-350">
                <p>
                  You are about to restore a WorkPulse snapshot with schema version{' '}
                  <strong className="text-gold-500">{pendingRestoreData.version}</strong>.
                </p>
                <div className="bg-navy-950 p-3 border border-navy-700 font-mono text-[11px] space-y-1">
                  <div>Tasks to restore: {pendingRestoreData.tasks?.length || 0}</div>
                  <div>Daily Logs: {pendingRestoreData.dailyReports?.length || 0}</div>
                  <div>Blockers: {pendingRestoreData.blockers?.length || 0}</div>
                  <div>User: {pendingRestoreData.userSettings?.userName}</div>
                </div>
                <p className="text-red-400 font-bold">
                  WARNING: This will replace current LocalStorage data with the backup file.
                </p>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-700">
              <button
                onClick={() => setIsRestoreModalOpen(false)}
                className="px-4 py-2 bg-navy-800 text-slate-350 text-xs font-mono hover:text-cream-200"
              >
                CANCEL
              </button>
              {pendingRestoreData && (
                <button
                  onClick={confirmRestore}
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs font-mono shadow-geometric-gold"
                >
                  CONFIRM & RESTORE
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

