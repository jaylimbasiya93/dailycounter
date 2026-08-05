import React, { useState } from 'react';
import { useApp } from '../context/AppDataContext';
import { RollingNumber } from '../components/ui/RollingNumber';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Plus, Minus, Flame, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardView: React.FC = () => {
  const {
    todayCount,
    lifetimeCount,
    todayValue,
    settings,
    currentStreak,
    longestStreak,
    weeklyAverage,
    monthlyAverage,
    incrementMomentum,
    decrementMomentum,
    analytics,
    setActiveTab,
  } = useApp();

  const [ripplePlus, setRipplePlus] = useState(false);
  const [rippleMinus, setRippleMinus] = useState(false);

  // Time-of-day greeting generator
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handlePlus = () => {
    setRipplePlus(true);
    setTimeout(() => setRipplePlus(false), 300);
    incrementMomentum(1);
  };

  const handleMinus = () => {
    setRippleMinus(true);
    setTimeout(() => setRippleMinus(false), 300);
    decrementMomentum(1);
  };

  const isGoalReached = todayCount >= settings.dailyGoal;
  const goalRemaining = Math.max(0, settings.dailyGoal - todayCount);

  return (
    <div className="pb-36 pt-2 px-4 max-w-md mx-auto space-y-6 select-none">
      {/* 1. Large Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            {getGreeting()}
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {settings.userName || 'Jay'}
          </h2>
        </div>
        <div className="px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs font-medium text-slate-600 dark:text-zinc-400">
          Target: <span className="font-bold text-slate-900 dark:text-white">{settings.dailyGoal}</span>
        </div>
      </motion.div>

      {/* 2. Hero Current Daily Momentum Display (Largest Element) */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-950 p-6 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-lg text-center"
      >
        {/* Subtle accent backdrop blur element */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent-500/10 dark:bg-accent-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1">
            Today's Momentum
          </span>

          {/* Largest Element: Rolling Counter */}
          <div className="my-2">
            <RollingNumber
              value={todayCount}
              className="text-6xl sm:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tighter leading-none"
            />
          </div>

          {/* Financial Value in Rupees (₹) */}
          <div className="mt-1 flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <span>Today's Value:</span>
            <RollingNumber value={todayValue} prefix="₹" />
          </div>

          {/* Secondary Stats Row */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 w-full grid grid-cols-2 gap-4 text-center">
            <div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 block">
                Lifetime Total
              </span>
              <RollingNumber
                value={lifetimeCount}
                className="text-base font-bold text-slate-800 dark:text-zinc-200"
              />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 block">
                Value Rate
              </span>
              <span className="text-base font-bold text-slate-800 dark:text-zinc-200">
                ₹{settings.valuePerMomentum}/cnt
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Progress Ring & Streak Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Daily Goal Ring Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-3xl bg-white dark:bg-zinc-900 p-4 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm flex flex-col items-center justify-between text-center"
        >
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-2">
            Daily Goal
          </span>
          <ProgressRing current={todayCount} goal={settings.dailyGoal} size={110} strokeWidth={10} />
          <div className="mt-3 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            {isGoalReached ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Goal Completed! 🎉</span>
            ) : (
              <span>{goalRemaining} counts left</span>
            )}
          </div>
        </motion.div>

        {/* Current Streak Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-3xl bg-white dark:bg-zinc-900 p-4 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Active Streak
            </span>
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>

          <div className="my-2">
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {currentStreak}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-zinc-400">days</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 dark:text-zinc-500">Longest Streak</span>
            <span className="font-bold text-slate-700 dark:text-zinc-300">{longestStreak} days</span>
          </div>
        </motion.div>
      </div>

      {/* 4. Averages Card (Weekly & Monthly) */}
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-3xl bg-white dark:bg-zinc-900 p-5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-accent-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              Performance Averages
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('analytics')}
            className="text-xs font-semibold text-accent-600 dark:text-accent-400 flex items-center hover:underline"
          >
            Analytics <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/60">
            <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 block mb-1">
              7-Day Avg
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {weeklyAverage}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">counts/day</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/60">
            <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 block mb-1">
              30-Day Avg
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {monthlyAverage}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">counts/day</span>
          </div>
        </div>
      </motion.div>

      {/* 5. Quick Insights Banner */}
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-3xl bg-accent-500/5 dark:bg-accent-500/10 p-4 border border-accent-500/20 flex items-start space-x-3"
      >
        <div className="p-2 rounded-2xl bg-accent-500 text-white shadow-accent-glow shrink-0 mt-0.5">
          <Zap className="w-4 h-4 fill-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            Daily Insight
          </h4>
          <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
            {analytics.trendPercentage >= 0 ? (
              <>You are performing <span className="font-bold text-accent-600 dark:text-accent-400">+{analytics.trendPercentage}% higher</span> than the previous 7 days!</>
            ) : (
              <>Keep pushing! Consistency score is at <span className="font-bold text-emerald-600 dark:text-emerald-400">{analytics.consistencyScore}%</span> this month.</>
            )}
          </p>
        </div>
      </motion.div>

      {/* 6. Ergonomic Fixed Floating Circular Action Buttons [-] and [+] */}
      {/* Positioned right above bottom navigation bar, minimum 72px (80px), thumb-friendly */}
      <div className="fixed bottom-20 left-0 right-0 z-30 pointer-events-none px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Decrement Button (-) */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.88 }}
            onClick={handleMinus}
            disabled={todayCount <= 0}
            className={`pointer-events-auto relative w-20 h-20 rounded-full flex items-center justify-center shadow-floating transition-all border outline-none select-none ${
              todayCount <= 0
                ? 'bg-slate-200/80 dark:bg-zinc-800/80 text-slate-400 dark:text-zinc-600 border-slate-300/40 dark:border-zinc-700/40 cursor-not-allowed opacity-60'
                : 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-white border-slate-200/90 dark:border-zinc-800 active:bg-slate-100'
            }`}
            aria-label="Decrement daily momentum"
          >
            {rippleMinus && (
              <span className="absolute inset-0 rounded-full bg-slate-300/40 dark:bg-zinc-700/40 animate-ping pointer-events-none" />
            )}
            <Minus className="w-8 h-8 stroke-[3]" />
          </motion.button>

          {/* Increment Button (+) - Primary Accent */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.88 }}
            onClick={handlePlus}
            className="pointer-events-auto relative w-20 h-20 rounded-full bg-accent-500 text-white flex items-center justify-center shadow-accent-glow transition-all border border-accent-400/40 outline-none select-none"
            aria-label="Increment daily momentum"
          >
            {ripplePlus && (
              <span className="absolute inset-0 rounded-full bg-white/40 animate-ping pointer-events-none" />
            )}
            <Plus className="w-10 h-10 stroke-[3]" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
