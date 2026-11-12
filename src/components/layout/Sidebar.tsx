import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calendar as CalendarIcon,
  BarChart3,
  AlertTriangle,
  GraduationCap,
  FileText,
  Settings,
  Flame,
  Clock
} from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { NavigationSection } from '../../types';

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: 'red' | 'gold';
}

export const Sidebar: React.FC = () => {
  const { activeSection, setActiveSection, state, missedStats } = useWorkPulse();

  const openBlockersCount = state.blockers.filter(b => b.status !== 'Resolved').length;
  const missedCount = missedStats.missed.length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { 
      id: 'daily-logs', 
      label: 'DAILY WORK LOGS', 
      icon: BookOpen,
      badge: missedCount > 0 ? missedCount : undefined,
      badgeColor: 'red'
    },
    { id: 'tasks', label: 'TASK MANAGER', icon: CheckSquare },
    { id: 'calendar', label: 'CALENDAR', icon: CalendarIcon },
    { id: 'analytics', label: 'ANALYTICS', icon: BarChart3 },
    { 
      id: 'blockers', 
      label: 'BLOCKERS & DOUBTS', 
      icon: AlertTriangle,
      badge: openBlockersCount > 0 ? openBlockersCount : undefined,
      badgeColor: 'red'
    },
    { id: 'learning', label: 'LEARNING JOURNAL', icon: GraduationCap },
    { id: 'reports', label: 'REPORTS & EXPORT', icon: FileText },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-500 flex flex-col justify-between shrink-0 select-none z-20 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-navy-500 bg-navy-950/60 relative overflow-hidden">
          {/* Subtle geometric line backdrop */}
          <div className="absolute right-0 top-0 bottom-0 w-24 opacity-10 pointer-events-none editorial-stripe" />
          <div className="flex items-center gap-3">
            {/* Geometric brand icon */}
            <div className="relative w-9 h-9 bg-navy-800 border border-gold-500 flex items-center justify-center chamfer-tr shadow-geometric-gold">
              <div className="w-2.5 h-2.5 bg-red-500 rotate-45 transform" />
              <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-gold-500" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-2xl tracking-wider text-cream-200">
                  WORK<span className="text-gold-500">PULSE</span>
                </span>
                <span className="w-1.5 h-1.5 bg-red-500" />
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-350">
                Performance Journal
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-semibold tracking-wider transition-all duration-150 relative group ${
                  isActive
                    ? 'bg-navy-800 text-cream-200 border-l-4 border-gold-500 shadow-inner'
                    : 'text-slate-350 hover:bg-navy-800/50 hover:text-cream-200 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-gold-500' : 'text-slate-450 group-hover:text-cream-200'
                    }`}
                  />
                  <span className="font-medium text-[13px]">{item.label}</span>
                </div>

                {/* Optional Badges */}
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-none font-mono ${
                      item.badgeColor === 'red'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                        : 'bg-gold-500/20 text-gold-400 border border-gold-500/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile section */}
      <div className="p-4 border-t border-navy-500 bg-navy-950/40">
        <div 
          onClick={() => setActiveSection('settings')}
          className="flex items-center gap-3 p-2 hover:bg-navy-800/80 cursor-pointer transition-colors border border-transparent hover:border-navy-500"
        >
          {/* User initials in gold-accented badge */}
          <div className="w-9 h-9 bg-navy-800 border-2 border-gold-500 flex items-center justify-center font-display text-sm text-gold-500 font-bold tracking-wider">
            {state.userSettings.userInitials}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-cream-200 truncate flex items-center gap-1.5">
              <span>{state.userSettings.userName}</span>
            </div>
            <div className="text-[10px] text-slate-350 truncate">
              {state.userSettings.userRole}
            </div>
          </div>
        </div>

        {/* Micro system status ticker */}
        <div className="mt-3 pt-2.5 border-t border-navy-500/60 flex items-center justify-between text-[10px] text-slate-450 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            STANDALONE LOCAL
          </span>
          <span className="text-gold-500/80 font-bold">V1.0</span>
        </div>
      </div>
    </aside>
  );
};

