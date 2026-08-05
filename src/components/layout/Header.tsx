import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppDataContext';
import { Sun, Moon, Flame, Download, History, Target, Plus, Minus, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const { entries, settings, updateSettings, currentStreak } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showQuickHistory, setShowQuickHistory] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    updateSettings({ theme: isDark ? 'light' : 'dark' });
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleGoalChange = (delta: number) => {
    updateSettings({ dailyGoal: Math.max(1, settings.dailyGoal + delta) });
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-50/85 dark:bg-zinc-950/85 border-b border-slate-200/60 dark:border-zinc-800/60 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* App Title & Date */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-500 flex items-center justify-center shadow-accent-glow text-white font-black text-base tracking-tighter">
              DC
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                Daily Counter
              </h1>
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-2">
            {/* Streak Flame Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-xs"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{currentStreak}d</span>
            </motion.div>

            {/* Quick History & Target Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowQuickHistory(!showQuickHistory)}
              className={`p-2 rounded-xl border transition ${
                showQuickHistory
                  ? 'bg-accent-500 text-white border-accent-500 shadow-accent-glow'
                  : 'bg-slate-200/60 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-300/60'
              }`}
              title="Recent Activity & Target Goal"
              aria-label="Recent activity log and target setting"
            >
              <History className="w-4 h-4" />
            </motion.button>

            {/* PWA Install Button if eligible */}
            {deferredPrompt && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleInstallClick}
                className="p-2 rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-400 border border-accent-500/20 hover:bg-accent-500/20 transition"
                title="Install PWA"
              >
                <Download className="w-4 h-4" />
              </motion.button>
            )}

            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.9, rotate: 15 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-200/60 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-300/60 dark:hover:bg-zinc-700/60 transition"
              aria-label="Toggle theme"
            >
              <Sun className="w-4 h-4 hidden dark:block" />
              <Moon className="w-4 h-4 block dark:hidden" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Quick Activity History & Target Goal Popover/Modal */}
      <AnimatePresence>
        {showQuickHistory && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 max-w-md w-full shadow-floating space-y-4"
            >
              {/* Header with Close */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4 text-accent-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Quick Activity & Target Goal
                  </h3>
                </div>
                <button
                  onClick={() => setShowQuickHistory(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Quick Set Target Goal Section */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-accent-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block leading-tight">
                      Daily Goal Target
                    </span>
                    <span className="text-[10px] text-slate-400">Target count per day</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleGoalChange(-5)}
                    className="w-7 h-7 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs"
                    title="-5 target"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => handleGoalChange(-1)}
                    className="w-7 h-7 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white px-1">
                    {settings.dailyGoal}
                  </span>
                  <button
                    onClick={() => handleGoalChange(1)}
                    className="w-7 h-7 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleGoalChange(5)}
                    className="w-7 h-7 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs"
                    title="+5 target"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* 2. Recent Date & Time Wise Point History Feed */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                  Recent Point Additions & Removals
                </span>

                {entries.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50/50 dark:bg-zinc-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                    <Clock className="w-6 h-6 text-slate-300 dark:text-zinc-700 mx-auto mb-1" />
                    <span className="text-xs font-medium text-slate-400 block">No points logged yet</span>
                    <span className="text-[10px] text-slate-400">Use [+] or [-] buttons to log momentum!</span>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60 pr-1">
                    {entries.slice(0, 20).map((entry) => {
                      const entryDate = new Date(entry.timestamp);
                      const isToday = entry.date === new Date().toISOString().split('T')[0];
                      const dateDisplay = isToday
                        ? 'Today'
                        : entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      const timeDisplay = entryDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      const isPositive = entry.count >= 0;

                      return (
                        <div
                          key={entry.id}
                          className="py-2 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <div className="flex items-baseline space-x-1.5">
                              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                {dateDisplay}
                              </span>
                              <span className="text-[10px] text-slate-400">{timeDisplay}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 font-extrabold">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] ${
                                isPositive
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {isPositive ? `+${entry.count}` : entry.count} count
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
