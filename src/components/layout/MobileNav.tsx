import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calendar,
  BarChart3,
  AlertTriangle,
  GraduationCap,
  FileText,
  Settings,
  X
} from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { NavigationSection } from '../../types';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { activeSection, setActiveSection, state, missedStats } = useWorkPulse();

  if (!isOpen) return null;

  const openBlockersCount = state.blockers.filter(b => b.status !== 'Resolved').length;
  const missedCount = missedStats.missed.length;

  const navItems = [
    { id: 'dashboard' as NavigationSection, label: 'DASHBOARD', icon: LayoutDashboard },
    { 
      id: 'daily-logs' as NavigationSection, 
      label: 'DAILY WORK LOGS', 
      icon: BookOpen,
      badge: missedCount > 0 ? missedCount : undefined
    },
    { id: 'tasks' as NavigationSection, label: 'TASK MANAGER', icon: CheckSquare },
    { id: 'calendar' as NavigationSection, label: 'CALENDAR', icon: Calendar },
    { id: 'analytics' as NavigationSection, label: 'ANALYTICS', icon: BarChart3 },
    { 
      id: 'blockers' as NavigationSection, 
      label: 'BLOCKERS & DOUBTS', 
      icon: AlertTriangle,
      badge: openBlockersCount > 0 ? openBlockersCount : undefined
    },
    { id: 'learning' as NavigationSection, label: 'LEARNING JOURNAL', icon: GraduationCap },
    { id: 'reports' as NavigationSection, label: 'REPORTS & EXPORT', icon: FileText },
    { id: 'settings' as NavigationSection, label: 'SETTINGS', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[85%] bg-navy-900 border-r border-navy-500 flex flex-col justify-between h-full z-10 shadow-2xl">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-navy-500 flex items-center justify-between bg-navy-950">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl tracking-wider text-cream-200">
                WORK<span className="text-gold-500">PULSE</span>
              </span>
              <span className="w-1.5 h-1.5 bg-red-500" />
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-350 hover:text-cream-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-left text-xs font-semibold tracking-wider transition-colors ${
                    isActive
                      ? 'bg-navy-800 text-cream-200 border-l-4 border-gold-500'
                      : 'text-slate-350 hover:bg-navy-800/40 hover:text-cream-200 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-gold-500' : 'text-slate-450'}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-navy-500 bg-navy-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-navy-800 border border-gold-500 flex items-center justify-center font-display text-gold-500 text-xs">
              {state.userSettings.userInitials}
            </div>
            <div className="text-xs">
              <div className="font-bold text-cream-200">{state.userSettings.userName}</div>
              <div className="text-[10px] text-slate-450">{state.userSettings.userRole}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

