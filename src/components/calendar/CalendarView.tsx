import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { DailyReportEditor } from '../daily-log/DailyReportEditor';
import { CURRENT_DATE_STR } from '../../services/sampleData';

export const CalendarView: React.FC = () => {
  const { state, missedStats, setSelectedReportDate, setActiveSection } = useWorkPulse();

  const [currentDate, setCurrentDate] = useState(() => new Date(CURRENT_DATE_STR + 'T00:00:00'));
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [activeDateModal, setActiveDateModal] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(CURRENT_DATE_STR + 'T00:00:00'));
  };

  const reportsByDate = new Map<string, typeof state.dailyReports[0]>();
  state.dailyReports.forEach(r => reportsByDate.set(r.date, r));

  const missedDateSet = new Set(missedStats.missed.map(m => m.date));

  // Determine active schedules
  const activeDaily = state.schedules.find(s => s.isActive && s.frequency === 'Daily');
  const expectedDays = activeDaily ? activeDaily.expectedDays : [1, 2, 3, 4, 5];

  // Generate Month Days
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    monthCells.push({ empty: true, dateStr: '', day: 0 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    monthCells.push({ empty: false, dateStr, day: d });
  }

  // Generate Week Days
  const currDayOfWeek = currentDate.getDay();
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currDayOfWeek); // Sunday

  const weekCells = [];
  for (let i = 0; i < 7; i++) {
    const iter = new Date(weekStart);
    iter.setDate(weekStart.getDate() + i);
    const yyyy = iter.getFullYear();
    const mm = String(iter.getMonth() + 1).padStart(2, '0');
    const dd = String(iter.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    weekCells.push({ dateStr, day: iter.getDate(), dayName: iter.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() });
  }

  const handleCellClick = (dateStr: string) => {
    if (!dateStr) return;
    setActiveDateModal(dateStr);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-gold-500" />
            <h1 className="font-display text-3xl tracking-wider text-cream-200">
              CALENDAR & CADENCE
            </h1>
          </div>
          <p className="text-xs text-slate-350 mt-1">
            Visual inspection of reporting commitments, sprint cadences, and historical daily submissions.
          </p>
        </div>

        {/* View Mode & Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-navy-800 border border-navy-500 p-0.5 font-mono text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 font-bold transition-colors ${
                viewMode === 'month' ? 'bg-gold-500 text-navy-950' : 'text-slate-350 hover:text-cream-200'
              }`}
            >
              MONTH
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 font-bold transition-colors ${
                viewMode === 'week' ? 'bg-gold-500 text-navy-950' : 'text-slate-350 hover:text-cream-200'
              }`}
            >
              WEEK
            </button>
          </div>

          <div className="flex items-center gap-1 bg-navy-800 border border-navy-500 p-1">
            <button
              onClick={handlePrev}
              className="p-1 text-slate-350 hover:text-cream-200 hover:bg-navy-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-0.5 text-xs font-mono font-bold text-slate-350 hover:text-gold-400"
            >
              TODAY
            </button>
            <button
              onClick={handleNext}
              className="p-1 text-slate-350 hover:text-cream-200 hover:bg-navy-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Label */}
      <div className="flex items-center justify-between font-mono text-sm text-gold-500 font-bold bg-navy-800 border border-navy-500 px-4 py-2.5">
        <span>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
        </span>
        <span className="text-xs text-slate-450 font-normal">
          Active Timezone: {state.userSettings.timezone}
        </span>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-navy-800 border border-navy-500 overflow-hidden chamfer-tr">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-navy-500 bg-navy-950 text-center text-xs font-mono font-bold text-slate-450 py-2.5">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-navy-600/50">
            {monthCells.map((cell, idx) => {
              if (cell.empty) {
                return (
                  <div key={`empty-${idx}`} className="h-28 bg-navy-900/40 p-2" />
                );
              }

              const dateStr = cell.dateStr;
              const report = reportsByDate.get(dateStr);
              const isMissed = missedDateSet.has(dateStr);
              const isToday = dateStr === CURRENT_DATE_STR;
              const isFuture = dateStr > CURRENT_DATE_STR;

              const dayOfWeek = new Date(year, month, cell.day).getDay();
              const isScheduled = expectedDays.includes(dayOfWeek);

              return (
                <div
                  key={dateStr}
                  onClick={() => handleCellClick(dateStr)}
                  className={`h-28 p-2 flex flex-col justify-between cursor-pointer transition-colors hover:bg-navy-750/80 relative group ${
                    isToday ? 'bg-navy-750/90 border-2 border-gold-500' : 'bg-navy-850'
                  }`}
                >
                  {/* Date number & Status dot */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isToday ? 'text-gold-500' : 'text-cream-200'
                      }`}
                    >
                      {cell.day}
                    </span>

                    {report && (
                      <span className="px-1.5 py-0.2 bg-gold-500 text-navy-950 font-mono text-[9px] font-black">
                        {report.performanceRating}★
                      </span>
                    )}
                    {isMissed && (
                      <span className="px-1.5 py-0.2 bg-red-500 text-cream-200 font-mono text-[9px] font-bold">
                        MISSED
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1">
                    {report ? (
                      <div className="text-[10px] text-slate-350 truncate">
                        <span className="text-gold-400 font-bold">{report.taskEntries.length} tasks</span> logged
                      </div>
                    ) : isMissed ? (
                      <div className="text-[10px] text-red-400 font-mono font-bold flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Backfill Entry
                      </div>
                    ) : isFuture && isScheduled ? (
                      <div className="text-[10px] text-slate-500 font-mono">
                        Scheduled
                      </div>
                    ) : null}
                  </div>

                  {/* Bottom indicator strip */}
                  <div className="h-1 w-full bg-transparent group-hover:bg-gold-500/50 transition-colors" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekCells.map(cell => {
            const dateStr = cell.dateStr;
            const report = reportsByDate.get(dateStr);
            const isMissed = missedDateSet.has(dateStr);
            const isToday = dateStr === CURRENT_DATE_STR;

            return (
              <div
                key={dateStr}
                onClick={() => handleCellClick(dateStr)}
                className={`bg-navy-800 border p-4 cursor-pointer hover:border-gold-500 transition-colors flex flex-col justify-between min-h-[300px] ${
                  isToday ? 'border-2 border-gold-500' : 'border-navy-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-navy-500 mb-3">
                    <span className="font-mono text-xs font-bold text-slate-450">
                      {cell.dayName}
                    </span>
                    <span className={`font-display text-xl ${isToday ? 'text-gold-500' : 'text-cream-200'}`}>
                      {cell.day}
                    </span>
                  </div>

                  {report ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gold-400 font-bold">RATING</span>
                        <span className="px-1.5 py-0.5 bg-gold-500 text-navy-950 font-bold">
                          {report.performanceRating}/5
                        </span>
                      </div>

                      <div className="text-xs text-slate-350">
                        <div className="font-bold text-cream-200 mb-1">Tasks Logged:</div>
                        <ul className="space-y-1">
                          {report.taskEntries.map((t, idx) => (
                            <li key={idx} className="text-[11px] text-slate-450 truncate">
                              • {t.taskName} ({t.actualHours}h)
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : isMissed ? (
                    <div className="p-3 bg-red-950/60 border border-red-500 text-center space-y-1">
                      <div className="text-xs text-red-400 font-bold font-mono">MISSED REPORT</div>
                      <div className="text-[10px] text-red-300">Click to backfill log</div>
                    </div>
                  ) : isToday ? (
                    <div className="p-3 bg-navy-900 border border-gold-500/60 text-center space-y-1">
                      <div className="text-xs text-gold-400 font-bold font-mono">TODAY PENDING</div>
                      <div className="text-[10px] text-slate-450">Log your progress</div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 text-center py-8">
                      No report recorded
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-navy-600/50 flex justify-end">
                  <span className="text-[10px] font-mono text-gold-500">OPEN LOG →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Daily Report Editor Modal for clicked date */}
      {activeDateModal && (
        <DailyReportEditor
          initialDate={activeDateModal}
          onClose={() => setActiveDateModal(null)}
        />
      )}
    </div>
  );
};

