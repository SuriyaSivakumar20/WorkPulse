import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare, CheckCircle2, Bell } from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';

export const InstallPromptBanner: React.FC = () => {
  const { pwaState, installApp, requestNotificationPermission, sendTestNotification } = useWorkPulse();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('workpulse_install_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('workpulse_install_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    const outcome = await installApp();
    if (outcome === 'ios') {
      setShowIosModal(true);
    }
  };

  // If already running in standalone mode (installed), don't show the install banner
  if (pwaState.isInstalled || isDismissed) {
    return null;
  }

  return (
    <>
      <div className="bg-navy-950 border-b border-gold-500/40 px-4 py-2.5 sm:px-6 relative overflow-hidden">
        {/* Subtle geometric background line */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gold-500/5 -skew-x-12 pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-navy-800 border border-gold-500/60 text-gold-400 shrink-0 chamfer-tr">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display tracking-wider text-xs sm:text-sm text-cream-200">
                  INSTALL ON PHONE & ENABLE 10:00 PM REMINDERS
                </span>
                <span className="hidden md:inline px-1.5 py-0.2 bg-gold-500/20 border border-gold-500/50 text-gold-400 text-[9px] font-mono font-bold">
                  PWA WEB APP
                </span>
              </div>
              <p className="text-[11px] text-slate-350 line-clamp-1">
                Install as a standalone web app on your home screen for daily 10 PM weekday reminders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs tracking-wider transition-colors shadow-geometric-gold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>INSTALL APP</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-450 hover:text-cream-200 transition-colors"
              title="Dismiss banner"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIosModal && (
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
                onClick={() => setShowIosModal(false)}
                className="text-slate-450 hover:text-cream-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-350">
              Apple Safari requires adding web applications to the Home Screen using the browser Share menu:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-start gap-3 p-3 bg-navy-800 border border-navy-600/60">
                <div className="p-1.5 bg-navy-900 border border-navy-500 text-gold-400 shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-cream-200">Step 1: Tap Share</span>
                  <p className="text-[11px] text-slate-450 mt-0.5">
                    Tap the Safari Share button at the bottom navigation bar.
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
                    Scroll down in the Share sheet and select <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-navy-800 border border-navy-600/60">
                <div className="p-1.5 bg-navy-900 border border-navy-500 text-gold-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-cream-200">Step 3: Launch from Home Screen</span>
                  <p className="text-[11px] text-slate-450 mt-0.5">
                    Tap <strong>"Add"</strong> in the top right. WorkPulse will open like a native app with push notifications enabled!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowIosModal(false)}
                className="px-5 py-2 bg-gold-500 text-navy-950 font-black text-xs font-mono tracking-wider shadow-geometric-gold"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

