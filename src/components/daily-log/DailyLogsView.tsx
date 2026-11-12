import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Calendar,
  Star,
  Clock,
  Edit2,
  Trash2,
  AlertTriangle,
  Folder,
  User,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { DailyReportEditor } from './DailyReportEditor';
import { CURRENT_DATE_STR } from '../../services/sampleData';

export const DailyLogsView: React.FC = () => {
  const {
    state,
    deleteDailyReport,
    selectedReportDate,
    setSelectedReportDate,
    missedStats
  } = useWorkPulse();

  const [isEditorOpen, setIsEditorOpen] = useState(Boolean(selectedReportDate));
  const [editingDate, setEditingDate] = useState<string>(selectedReportDate || CURRENT_DATE_STR);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterProject, setFilterProject] = useState<string>('all');

  // List of all unique projects from task entries
  const allProjects = useMemo(() => {
    const set = new Set<string>();
    state.dailyReports.forEach(r => {
      r.taskEntries.forEach(e => {
        if (e.project) set.add(e.project);
      });
    });
    return Array.from(set);
  }, [state.dailyReports]);

  // Filtered reports sorted reverse chronologically
  const filteredReports = useMemo(() => {
    return state.dailyReports
      .filter(report => {
        // Rating filter
        if (filterRating !== 'all' && report.performanceRating !== filterRating) {
          return false;
        }

        // Project filter
        if (filterProject !== 'all') {
          const hasProject = report.taskEntries.some(e => e.project === filterProject);
          if (!hasProject) return false;
        }

        // Search term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchesDate = report.date.toLowerCase().includes(q);
          const matchesReflection = report.reflection.toLowerCase().includes(q);
          const matchesPlan = report.nextDayPlan.toLowerCase().includes(q);
          const matchesTasks = report.taskEntries.some(
            e => e.taskName.toLowerCase().includes(q) || e.progressNotes.toLowerCase().includes(q)
          );
          if (!matchesDate && !matchesReflection && !matchesPlan && !matchesTasks) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.dailyReports, filterRating, filterProject, searchTerm]);

  const handleOpenEditor = (date: string) => {
    setEditingDate(date);
    setIsEditorOpen(true);
  };

  const handleDelete = (reportId: string, date: string) => {
    if (window.confirm(`Are you sure you want to delete the daily report for ${date}?`)) {
      deleteDailyReport(reportId);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500" />
            <h1 className="font-display text-3xl tracking-wider text-cream-200">
              DAILY WORK LOGS
            </h1>
          </div>
          <p className="text-xs text-slate-350 mt-1">
            Historical records of daily engineering focus, logged hours, and strategic reflections.
          </p>
        </div>

        <button
          onClick={() => handleOpenEditor(CURRENT_DATE_STR)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs tracking-wider shadow-geometric-gold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>LOG TODAY'S WORK ({CURRENT_DATE_STR})</span>
        </button>
      </div>

      {/* Missed Periods Backfill Alert Banner */}
      {missedStats.missed.length > 0 && (
        <div className="bg-red-950/60 border-2 border-red-500/80 p-4 relative overflow-hidden chamfer-tr">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-lg tracking-wider text-cream-200">
                  MISSED REPORTING PERIODS DETECTED ({missedStats.missed.length} DAYS)
                </h3>
                <p className="text-xs text-red-200/90 mt-0.5">
                  The following scheduled workdays are missing logs. You can backfill entries now to maintain unbroken streak data.
                </p>

                {/* Backfill date pills */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {missedStats.missed.map(item => (
                    <button
                      key={item.date}
                      onClick={() => handleOpenEditor(item.date)}
                      className="px-2.5 py-1 bg-navy-900 border border-red-500 text-cream-200 hover:bg-red-500 hover:text-navy-950 text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
                    >
                      <span>{item.date} ({item.dayName.slice(0, 3)})</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-navy-800 border border-navy-500 p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-450 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search logs by keyword, task, or reflections..."
            className="w-full bg-navy-900 border border-navy-500 pl-9 pr-3 py-2 text-xs text-cream-200 placeholder:text-slate-500 focus:border-gold-500 focus:outline-none"
          />
        </div>

        {/* Rating Filter */}
        <div className="md:col-span-3">
          <select
            value={filterRating}
            onChange={e => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full bg-navy-900 border border-navy-500 px-3 py-2 text-xs text-slate-350 focus:border-gold-500 focus:outline-none font-mono"
          >
            <option value="all">Rating: All Scores</option>
            <option value="5">5 – Excellent</option>
            <option value="4">4 – Good</option>
            <option value="3">3 – Meets Expectations</option>
            <option value="2">2 – Below Expectations</option>
            <option value="1">1 – Poor</option>
          </select>
        </div>

        {/* Project Filter */}
        <div className="md:col-span-3">
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            className="w-full bg-navy-900 border border-navy-500 px-3 py-2 text-xs text-slate-350 focus:border-gold-500 focus:outline-none font-mono"
          >
            <option value="all">Project: All Projects</option>
            {allProjects.map(proj => (
              <option key={proj} value={proj}>
                {proj}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-navy-800 border border-navy-500 p-12 text-center text-slate-450">
          <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-cream-200">No daily reports found.</p>
          <p className="text-xs text-slate-450 mt-1">
            Try adjusting your search query or create a new daily log.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map(report => {
            const dateObj = new Date(report.date + 'T12:00:00');
            const formatted = dateObj.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }).toUpperCase();

            const totalHours = report.taskEntries.reduce((acc, e) => acc + (e.actualHours || 0), 0);

            return (
              <div
                key={report.id}
                className="bg-navy-800 border border-navy-500 overflow-hidden chamfer-tr relative hover:border-gold-500/50 transition-colors"
              >
                {/* Header Strip */}
                <div className="p-4 bg-navy-850 border-b border-navy-500 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gold-500 rotate-45" />
                    <div>
                      <div className="font-display text-lg text-cream-200 tracking-wider">
                        {formatted}
                      </div>
                      <div className="text-[11px] font-mono text-slate-450">
                        {report.taskEntries.length} TASKS LOGGED • {totalHours}H TOTAL RECORDED
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Performance rating badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gold-500/15 border border-gold-500 text-gold-400 font-mono text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-gold-500" />
                      <span>RATING: {report.performanceRating}/5</span>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleOpenEditor(report.date)}
                      className="p-1.5 bg-navy-800 hover:bg-navy-700 text-slate-350 hover:text-gold-400 border border-navy-500 transition-colors"
                      title="Edit Log"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(report.id, report.date)}
                      className="p-1.5 bg-navy-800 hover:bg-navy-700 text-slate-350 hover:text-red-400 border border-navy-500 transition-colors"
                      title="Delete Log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Rating Context if present */}
                  {report.ratingExplanation && (
                    <div className="text-xs text-gold-400/90 font-mono bg-navy-900/60 p-2.5 border-l-2 border-gold-500">
                      RATING CONTEXT: {report.ratingExplanation}
                    </div>
                  )}

                  {/* Task entries grid */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono font-bold text-slate-450 uppercase">
                      WORK DELIVERABLES ({report.taskEntries.length})
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {report.taskEntries.map((task, idx) => (
                        <div
                          key={task.taskId + idx}
                          className="p-3 bg-navy-900 border border-navy-600/60 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-cream-200">
                              {task.taskName}
                            </span>
                            <span className="font-mono text-[10px] text-gold-500 bg-gold-500/10 px-1.5 py-0.5 shrink-0 border border-gold-500/30">
                              {task.actualHours}h
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-450 mt-1">
                            <span>{task.project}</span>
                            <span>•</span>
                            <span className="text-slate-350">{task.status}</span>
                          </div>

                          {task.progressNotes && (
                            <p className="mt-2 text-slate-350 italic text-[11px] border-t border-navy-700/50 pt-1.5">
                              "{task.progressNotes}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reflection and Next-Day Plan Split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="bg-navy-900/80 p-3 border border-navy-600/50">
                      <div className="text-[10px] font-mono font-bold text-gold-500 uppercase mb-1">
                        DAILY REFLECTION
                      </div>
                      <p className="text-xs text-slate-350 leading-relaxed">
                        {report.reflection}
                      </p>
                    </div>

                    <div className="bg-navy-900/80 p-3 border border-navy-600/50">
                      <div className="text-[10px] font-mono font-bold text-cream-200 uppercase mb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-gold-500" />
                        NEXT-DAY PRIORITIES
                      </div>
                      <p className="text-xs text-slate-350 leading-relaxed">
                        {report.nextDayPlan}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Daily Report Editor Modal */}
      {isEditorOpen && (
        <DailyReportEditor
          initialDate={editingDate}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedReportDate(null);
          }}
        />
      )}
    </div>
  );
};

