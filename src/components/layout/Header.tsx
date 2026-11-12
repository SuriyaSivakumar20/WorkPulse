import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  AlertCircle,
  Clock,
  Plus,
  Menu,
  X,
  FileEdit,
  ExternalLink
} from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { CURRENT_DATE_STR } from '../../services/sampleData';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const {
    state,
    setActiveSection,
    setSelectedReportDate,
    markNotificationRead,
    markAllNotificationsRead,
    isTodayReportSubmitted
  } = useWorkPulse();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifications = state.notifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;

  // Format date
  const dateObj = new Date(CURRENT_DATE_STR + 'T12:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();

  // Dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  const handleOpenReport = () => {
    setSelectedReportDate(CURRENT_DATE_STR);
    setActiveSection('daily-logs');
  };

  return (
    <header className="h-20 bg-navy-900 border-b border-navy-500 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Greeting & Date */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-350 hover:text-cream-200 hover:bg-navy-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl tracking-wider text-cream-200">
              {getGreeting()}, {state.userSettings.userName.split(' ')[0].toUpperCase()}
            </h1>
            <span className="w-1.5 h-1.5 bg-gold-500" />
          </div>
          <p className="text-xs text-slate-350 italic">
            "Let's make today productive."
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Date display pill with geometric border */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-navy-800 border border-navy-500 text-xs font-mono text-slate-350 chamfer-tr">
          <Calendar className="w-3.5 h-3.5 text-gold-500" />
          <span className="font-semibold text-cream-200">{formattedDate}</span>
          <span className="text-[10px] text-slate-450 border-l border-navy-500 pl-2">
            {state.userSettings.timezone}
          </span>
        </div>

        {/* Create/Edit Daily Report Fast Action */}
        <button
          onClick={handleOpenReport}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold tracking-wider transition-all duration-150 shadow-geometric-navy ${
            isTodayReportSubmitted
              ? 'bg-navy-800 hover:bg-navy-700 text-gold-500 border border-gold-500/60'
              : 'bg-gold-500 hover:bg-gold-400 text-navy-950 font-black'
          }`}
        >
          {isTodayReportSubmitted ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>EDIT TODAY'S LOG</span>
            </>
          ) : (
            <>
              <FileEdit className="w-4 h-4" />
              <span>LOG TODAY'S WORK</span>
            </>
          )}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            className={`relative p-2.5 bg-navy-800 border border-navy-500 text-slate-350 hover:text-cream-200 transition-colors ${
              unreadCount > 0 ? 'text-gold-500 border-gold-500/40' : ''
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-cream-200 font-mono text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-navy-800 border-2 border-navy-500 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 bg-navy-900 border-b border-navy-500 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm tracking-wider text-cream-200">
                    NOTIFICATIONS
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-mono">
                      {unreadCount} UNREAD
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-gold-500 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-navy-600/50">
                {state.notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-450">
                    No notifications right now.
                  </div>
                ) : (
                  state.notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.linkSection) {
                          if (notif.actionDate) {
                            setSelectedReportDate(notif.actionDate);
                          }
                          setActiveSection(notif.linkSection);
                        }
                        setIsNotifOpen(false);
                      }}
                      className={`p-3.5 cursor-pointer hover:bg-navy-700/60 transition-colors flex items-start gap-3 ${
                        !notif.read ? 'bg-navy-750/70 border-l-2 border-gold-500' : 'opacity-80'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'blocker' ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : notif.type === 'missed_report' ? (
                          <Clock className="w-4 h-4 text-red-400" />
                        ) : (
                          <Bell className="w-4 h-4 text-gold-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-cream-200 truncate">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-350 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-navy-900 border-t border-navy-500 text-center">
                <button
                  onClick={() => {
                    setActiveSection('settings');
                    setIsNotifOpen(false);
                  }}
                  className="text-[11px] text-slate-350 hover:text-cream-200 transition-colors"
                >
                  Configure schedule reminders in Settings →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

