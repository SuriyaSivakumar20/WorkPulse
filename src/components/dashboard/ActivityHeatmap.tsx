import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { CURRENT_DATE_STR } from '../../services/sampleData';

export const ActivityHeatmap: React.FC = () => {
  const { state, missedStats, setActiveSection, setSelectedReportDate } = useWorkPulse();

  // Selected viewing month/year
  const [viewDate, setViewDate] = useState(() => {
    const today = new Date(CURRENT_DATE_STR + 'T00:00:00');
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleResetCurrent = () => {
    const today = new Date(CURRENT_DATE_STR + 'T00:00:00');
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

  // Build grid of days for the month
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const totalDays = new Date(year, month + 1, 0).getDate();

  const reportDateSet = new Set(state.dailyReports.map(r => r.date));
  const missedDateSet = new Set(missedStats.missed.map(m => m.date));

  // Determine scheduled days from active schedules
  const activeDaily = state.schedules.find(s => s.isActive && s.frequency === 'Daily');
  const expectedDays = activeDaily ? activeDaily.expectedDays : [1, 2, 3, 4, 5];

  const days = [];
  // Empty padding cells for start of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ day: null, dateStr: '' });
  }
  // Days of month
  for (let d = 1; d <= totalDays; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    days.push({ day: d, dateStr });
  }

  const handleDateClick = (dateStr: string) => {
    if (!dateStr) return;
    setSelectedReportDate(dateStr);
    setActiveSection('daily-logs');
  };

  return (
    <div className="bg-navy-800 border border-navy-500 p-5 relative">
      {/* Header with Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-navy-500 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-gold-500 rotate-45" />
          <h2 className="font-display text-xl tracking-wider text-cream-200">
            ACTIVITY HEATMAP
          </h2>
          <span className="font-mono text-xs text-gold-500 font-bold ml-1">
            {monthName}
          </span>
        </div>

        {/* Month switcher */}
        <div className="flex items-center gap-1.5 bg-navy-900 border border-navy-500 p-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-navy-750 text-slate-350 hover:text-cream-200 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetCurrent}
            className="px-2 py-0.5 text-[10px] font-mono font-bold text-slate-350 hover:text-gold-500"
          >
            TODAY
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-navy-750 text-slate-350 hover:text-cream-200 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-slate-450 mb-2 font-bold">
        <span>SUN</span>
        <span>MON</span>
        <span>TUE</span>
        <span>WED</span>
        <span>THU</span>
        <span>FRI</span>
        <span>SAT</span>
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((item, index) => {
          if (!item.day) {
            return <div key={`empty-${index}`} className="h-10 bg-transparent" />;
          }

          const dateStr = item.dateStr;
          const hasReport = reportDateSet.has(dateStr);
          const isMissed = missedDateSet.has(dateStr);
          const isToday = dateStr === CURRENT_DATE_STR;
          const isFuture = dateStr > CURRENT_DATE_STR;

          const dayOfWeek = new Date(year, month, item.day).getDay();
          const isExpected = expectedDays.includes(dayOfWeek);

          let cellClass = 'bg-navy-900 text-slate-450 border border-navy-600/40'; // neutral
          let statusText = 'No report scheduled';

          if (hasReport) {
            cellClass = 'bg-gold-500 text-navy-950 font-black border border-gold-400 shadow-sm';
            statusText = 'Report Submitted';
          } else if (isMissed) {
            cellClass = 'bg-red-500/25 text-red-400 border border-red-500 font-bold';
            statusText = 'Missed Report Period';
          } else if (isFuture) {
            cellClass = isExpected 
              ? 'bg-navy-750 text-slate-350 border border-navy-500/60' 
              : 'bg-navy-900/60 text-slate-600 border border-navy-700/30';
            statusText = 'Upcoming';
          } else if (isToday) {
            cellClass = 'bg-navy-750 text-gold-400 border-2 border-gold-500 font-bold';
            statusText = 'Today (Pending)';
          }

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(dateStr)}
              title={`${dateStr}: ${statusText}`}
              className={`h-10 flex flex-col items-center justify-center p-1 text-xs transition-all relative group hover:scale-105 ${cellClass}`}
            >
              <span className="font-mono text-xs">{item.day}</span>
              {hasReport && (
                <span className="w-1 h-1 bg-navy-950 rounded-full mt-0.5" />
              )}
              {isMissed && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-none rotate-45 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend & Instructions */}
      <div className="mt-4 pt-3 border-t border-navy-500/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-350">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-gold-500 inline-block border border-gold-400" />
            Report Submitted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-500/30 inline-block border border-red-500" />
            Missed Period
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-navy-750 inline-block border border-navy-500" />
            Upcoming
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-navy-900 inline-block border border-navy-700" />
            Neutral
          </span>
        </div>
        <span className="text-slate-450 italic">
          Click any date to open / backfill log
        </span>
      </div>
    </div>
  );
};

