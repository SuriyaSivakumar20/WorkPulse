import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Star,
  Plus,
  Trash2,
  Save,
  X,
  AlertCircle,
  HelpCircle,
  Folder,
  User,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { DailyReport, DailyReportTaskEntry, TaskStatus, TrackingFrequency } from '../../types';
import { CURRENT_DATE_STR } from '../../services/sampleData';

interface DailyReportEditorProps {
  initialDate?: string;
  onClose: () => void;
}

const RATING_DESCRIPTIONS = [
  '1 – Poor (Heavy blockers, minimal progress)',
  '2 – Below expectations (Disrupted flow, missed milestones)',
  '3 – Meets expectations (Solid output, on schedule)',
  '4 – Good (High velocity, proactive resolution)',
  '5 – Excellent (Breakthrough delivery, exceptional quality)'
];

export const DailyReportEditor: React.FC<DailyReportEditorProps> = ({ initialDate, onClose }) => {
  const { state, saveDailyReport, showToast } = useWorkPulse();

  const targetDate = initialDate || CURRENT_DATE_STR;

  // Check if a report already exists for this date
  const existingReport = state.dailyReports.find(r => r.date === targetDate);

  const [date, setDate] = useState<string>(targetDate);
  const [performanceRating, setPerformanceRating] = useState<1 | 2 | 3 | 4 | 5>(
    existingReport?.performanceRating || 4
  );
  const [ratingExplanation, setRatingExplanation] = useState<string>(
    existingReport?.ratingExplanation || ''
  );
  const [reflection, setReflection] = useState<string>(
    existingReport?.reflection || ''
  );
  const [nextDayPlan, setNextDayPlan] = useState<string>(
    existingReport?.nextDayPlan || ''
  );

  // Task entries
  const [taskEntries, setTaskEntries] = useState<DailyReportTaskEntry[]>(() => {
    if (existingReport && existingReport.taskEntries.length > 0) {
      return existingReport.taskEntries;
    }
    // Pre-populate with active tasks if starting a new report
    const activeTasks = state.tasks.filter(
      t => !t.archived && t.status !== 'Completed' && t.status !== 'Done'
    ).slice(0, 3);

    if (activeTasks.length > 0) {
      return activeTasks.map(t => ({
        taskId: t.id,
        taskName: t.name,
        assignedBy: t.assignedBy,
        project: t.project,
        trackingFrequency: t.trackingFrequency,
        status: t.status,
        estimatedHours: t.estimatedHours,
        actualHours: 3.5,
        progressNotes: t.latestNotes || '',
        blockers: '',
        doubts: ''
      }));
    }

    return [
      {
        taskId: `task-${Date.now()}`,
        taskName: '',
        assignedBy: 'Self-Directed',
        project: 'Core Platform',
        trackingFrequency: 'Daily',
        status: 'In Progress',
        estimatedHours: 4,
        actualHours: 4,
        progressNotes: '',
        blockers: '',
        doubts: ''
      }
    ];
  });

  // Active step for progressive disclosure (1: Performance & Reflection, 2: Tasks & Progress, 3: Next Day Plan)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(2);

  // Helper to add new task entry
  const handleAddTaskEntry = () => {
    setTaskEntries(prev => [
      ...prev,
      {
        taskId: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        taskName: '',
        assignedBy: 'Self-Directed',
        project: 'General',
        trackingFrequency: 'Daily',
        status: 'In Progress',
        estimatedHours: 4,
        actualHours: 2,
        progressNotes: '',
        blockers: '',
        doubts: ''
      }
    ]);
  };

  // Helper to prefill entry from existing task
  const handleSelectExistingTask = (index: number, taskId: string) => {
    const existing = state.tasks.find(t => t.id === taskId);
    if (!existing) return;

    setTaskEntries(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        taskId: existing.id,
        taskName: existing.name,
        assignedBy: existing.assignedBy,
        project: existing.project,
        trackingFrequency: existing.trackingFrequency,
        status: existing.status,
        estimatedHours: existing.estimatedHours,
        progressNotes: existing.latestNotes || copy[index].progressNotes
      };
      return copy;
    });
  };

  const handleUpdateEntry = (index: number, field: keyof DailyReportTaskEntry, val: any) => {
    setTaskEntries(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleRemoveEntry = (index: number) => {
    if (taskEntries.length <= 1) {
      showToast('A daily report must contain at least one task entry.');
      return;
    }
    setTaskEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!date) {
      showToast('Reporting date is required.');
      return;
    }

    const invalidEntry = taskEntries.find(e => !e.taskName.trim());
    if (invalidEntry) {
      showToast('Please provide a name for all logged task entries.');
      setActiveStep(2);
      return;
    }

    const report: DailyReport = {
      id: existingReport?.id || `rep-${date}`,
      date,
      performanceRating,
      ratingExplanation: ratingExplanation.trim(),
      reflection: reflection.trim() || 'Work executed according to sprint milestones.',
      nextDayPlan: nextDayPlan.trim() || 'Continue active task queue.',
      taskEntries,
      createdAt: existingReport?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveDailyReport(report);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-navy-900 border-2 border-navy-500 shadow-2xl my-8 overflow-hidden chamfer-tr">
        {/* Modal Top Bar */}
        <div className="bg-navy-950 p-5 border-b border-navy-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold-500 text-navy-950 flex items-center justify-center font-display text-lg font-bold">
              WP
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wider text-cream-200">
                {existingReport ? 'EDIT DAILY REPORT' : 'CREATE DAILY WORK REPORT'}
              </h2>
              <div className="text-xs font-mono text-slate-450">
                DATE: <span className="text-gold-500 font-bold">{date}</span>
                {existingReport && ' (UPDATE MODE)'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-350 hover:text-cream-200 hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Progressive Disclosure Step Navigation */}
          <div className="grid grid-cols-3 border border-navy-500 bg-navy-950">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`py-3 px-2 text-xs font-mono font-bold tracking-wider transition-colors border-r border-navy-500 flex items-center justify-center gap-2 ${
                activeStep === 1
                  ? 'bg-navy-800 text-gold-500 border-b-2 border-b-gold-500'
                  : 'text-slate-450 hover:text-cream-200'
              }`}
            >
              <span>1. RATING & DATE</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`py-3 px-2 text-xs font-mono font-bold tracking-wider transition-colors border-r border-navy-500 flex items-center justify-center gap-2 ${
                activeStep === 2
                  ? 'bg-navy-800 text-gold-500 border-b-2 border-b-gold-500'
                  : 'text-slate-450 hover:text-cream-200'
              }`}
            >
              <span>2. TASK ENTRIES ({taskEntries.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`py-3 px-2 text-xs font-mono font-bold tracking-wider transition-colors flex items-center justify-center gap-2 ${
                activeStep === 3
                  ? 'bg-navy-800 text-gold-500 border-b-2 border-b-gold-500'
                  : 'text-slate-450 hover:text-cream-200'
              }`}
            >
              <span>3. REFLECTION & NEXT DAY</span>
            </button>
          </div>

          {/* STEP 1: DATE & PERFORMANCE RATING */}
          {activeStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date Input */}
                <div className="bg-navy-800 p-4 border border-navy-500">
                  <label className="block text-xs font-mono font-bold text-slate-350 uppercase mb-2">
                    REPORTING DATE
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-500 px-3 py-2 text-sm text-cream-200 font-mono focus:border-gold-500 focus:outline-none"
                    required
                  />
                  <p className="text-[11px] text-slate-450 mt-2 font-mono">
                    Can be set to any missed date to record a backfill report.
                  </p>
                </div>

                {/* Performance Rating */}
                <div className="bg-navy-800 p-4 border border-navy-500">
                  <label className="block text-xs font-mono font-bold text-slate-350 uppercase mb-2">
                    DAILY PERFORMANCE RATING (1–5)
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    {([1, 2, 3, 4, 5] as const).map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPerformanceRating(num)}
                        className={`w-10 h-10 font-display text-xl transition-all border ${
                          performanceRating === num
                            ? 'bg-gold-500 text-navy-950 font-bold border-gold-400 shadow-geometric-gold'
                            : 'bg-navy-900 text-slate-350 border-navy-500 hover:border-gold-500/60'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-mono text-gold-400">
                    {RATING_DESCRIPTIONS[performanceRating - 1]}
                  </div>
                </div>
              </div>

              {/* Rating Explanation */}
              <div className="bg-navy-800 p-4 border border-navy-500">
                <label className="block text-xs font-mono font-bold text-slate-350 uppercase mb-2">
                  RATING JUSTIFICATION & CONTEXT (OPTIONAL)
                </label>
                <textarea
                  rows={2}
                  value={ratingExplanation}
                  onChange={e => setRatingExplanation(e.target.value)}
                  placeholder="Explain the factors behind today's score (e.g., uninterrupted flow, unexpected blocker, swift delivery)..."
                  className="w-full bg-navy-900 border border-navy-500 p-3 text-xs text-cream-200 focus:border-gold-500 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-navy-950 text-xs font-black tracking-wider hover:bg-gold-400"
                >
                  <span>NEXT: TASK ENTRIES</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TASK ENTRIES (MULTIPLE TASKS PER REPORT) */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-navy-500">
                <span className="text-xs font-mono text-slate-350">
                  LOG EACH TASK WORKED ON TODAY ({taskEntries.length} TASKS)
                </span>
                <button
                  type="button"
                  onClick={handleAddTaskEntry}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-800 hover:bg-navy-750 text-gold-500 text-xs font-mono border border-gold-500/50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD ANOTHER TASK</span>
                </button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {taskEntries.map((entry, index) => (
                  <div
                    key={index}
                    className="p-4 bg-navy-800 border border-navy-500 space-y-3 relative group"
                  >
                    {/* Entry Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-navy-900 border border-gold-500 flex items-center justify-center font-mono text-xs text-gold-500 font-bold">
                          {index + 1}
                        </span>
                        <span className="text-xs font-mono text-slate-350">
                          TASK ENTRY
                        </span>
                      </div>

                      {taskEntries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEntry(index)}
                          className="text-slate-450 hover:text-red-400 p-1 text-xs"
                          title="Remove Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Pre-fill existing task picker or input name */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-8">
                        <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                          TASK NAME
                        </label>
                        <input
                          type="text"
                          value={entry.taskName}
                          onChange={e => handleUpdateEntry(index, 'taskName', e.target.value)}
                          placeholder="e.g. Implement telemetry fallback retry queue..."
                          className="w-full bg-navy-900 border border-navy-500 px-3 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                          OR LINK ACTIVE TASK
                        </label>
                        <select
                          onChange={e => handleSelectExistingTask(index, e.target.value)}
                          className="w-full bg-navy-900 border border-navy-500 px-2 py-1.5 text-xs text-slate-350 focus:border-gold-500 focus:outline-none font-mono"
                        >
                          <option value="">-- Choose Task --</option>
                          {state.tasks
                            .filter(t => !t.archived)
                            .map(t => (
                              <option key={t.id} value={t.id}>
                                {t.name.slice(0, 35)}...
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Project, Assigned By, Status */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                          PROJECT / CATEGORY
                        </label>
                        <input
                          type="text"
                          value={entry.project}
                          onChange={e => handleUpdateEntry(index, 'project', e.target.value)}
                          className="w-full bg-navy-900 border border-navy-500 px-2 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                          ASSIGNED BY
                        </label>
                        <input
                          type="text"
                          value={entry.assignedBy}
                          onChange={e => handleUpdateEntry(index, 'assignedBy', e.target.value)}
                          className="w-full bg-navy-900 border border-navy-500 px-2 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                          CURRENT STATUS
                        </label>
                        <select
                          value={entry.status}
                          onChange={e => handleUpdateEntry(index, 'status', e.target.value as TaskStatus)}
                          className="w-full bg-navy-900 border border-navy-500 px-2 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
                        >
                          <option value="Started">Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Testing">Testing</option>
                          <option value="Debugging">Debugging</option>
                          <option value="Completed">Completed</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                          HOURS SPENT TODAY
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="24"
                          value={entry.actualHours}
                          onChange={e => handleUpdateEntry(index, 'actualHours', parseFloat(e.target.value) || 0)}
                          className="w-full bg-navy-900 border border-navy-500 px-2 py-1.5 text-xs text-gold-500 font-bold focus:border-gold-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Progress Notes */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                        PROGRESS NOTES & MILESTONES ACHIEVED
                      </label>
                      <input
                        type="text"
                        value={entry.progressNotes}
                        onChange={e => handleUpdateEntry(index, 'progressNotes', e.target.value)}
                        placeholder="What specific progress or test was concluded today?..."
                        className="w-full bg-navy-900 border border-navy-500 px-3 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none placeholder:text-slate-600"
                      />
                    </div>

                    {/* Blockers & Doubts inline indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-red-400 uppercase mb-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-red-500" />
                          BLOCKERS ENCOUNTERED
                        </label>
                        <input
                          type="text"
                          value={entry.blockers}
                          onChange={e => handleUpdateEntry(index, 'blockers', e.target.value)}
                          placeholder="Any impediments? (Leave blank if none)"
                          className="w-full bg-navy-900 border border-navy-600 px-2.5 py-1 text-xs text-red-300 placeholder:text-slate-600 focus:border-red-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gold-400 uppercase mb-1 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-gold-500" />
                          DOUBTS / QUESTIONS TO DISCUSS
                        </label>
                        <input
                          type="text"
                          value={entry.doubts}
                          onChange={e => handleUpdateEntry(index, 'doubts', e.target.value)}
                          placeholder="Questions for leads or architecture review?"
                          className="w-full bg-navy-900 border border-navy-600 px-2.5 py-1 text-xs text-gold-300 placeholder:text-slate-600 focus:border-gold-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 bg-navy-800 text-slate-350 text-xs font-mono hover:text-cream-200"
                >
                  ← BACK TO RATING
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-navy-950 text-xs font-black tracking-wider hover:bg-gold-400"
                >
                  <span>NEXT: REFLECTION & PLAN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DAILY REFLECTION & NEXT DAY PLAN */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Daily Reflection */}
              <div className="bg-navy-800 p-4 border border-navy-500">
                <label className="block text-xs font-mono font-bold text-gold-500 uppercase mb-2">
                  DAILY REFLECTION & TAKEAWAYS
                </label>
                <textarea
                  rows={3}
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  placeholder="Reflect on your focus, engineering decisions, or productivity breakthroughs today..."
                  className="w-full bg-navy-900 border border-navy-500 p-3 text-xs text-cream-200 focus:border-gold-500 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              {/* Next-Day Plan */}
              <div className="bg-navy-800 p-4 border border-navy-500">
                <label className="block text-xs font-mono font-bold text-cream-200 uppercase mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold-500" />
                  TOMORROW'S PRIORITIES & EXECUTION PLAN
                </label>
                <textarea
                  rows={3}
                  value={nextDayPlan}
                  onChange={e => setNextDayPlan(e.target.value)}
                  placeholder="Define your top 1-3 tasks planned for the next working day..."
                  className="w-full bg-navy-900 border border-navy-500 p-3 text-xs text-cream-200 focus:border-gold-500 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-navy-500">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 bg-navy-800 text-slate-350 text-xs font-mono hover:text-cream-200"
                >
                  ← BACK TO TASKS
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 bg-navy-800 text-slate-350 text-xs font-mono hover:text-cream-200"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs tracking-wider shadow-geometric-gold"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE DAILY REPORT</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

