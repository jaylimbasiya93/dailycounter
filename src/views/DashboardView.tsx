import React, { useState } from 'react';
import { useApp } from '../context/AppDataContext';
import { RollingNumber } from '../components/ui/RollingNumber';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Plus, Minus, Flame, TrendingUp, Zap, ChevronRight, Trophy, Sparkles } from 'lucide-react';
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
    dayLogs,
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

  // Lifetime Goal calculations
  const lifetimeGoal = settings.lifetimeGoal ?? 251;
  const lifetimeRemaining = Math.max(0, lifetimeGoal - lifetimeCount);
  const isLifetimeGoalAchieved = lifetimeCount >= lifetimeGoal;
  const lifetimePercentage = Math.min(100, Math.round((lifetimeCount / lifetimeGoal) * 100));

  // Determine realistic active daily pace based on actual logged days and current momentum
  const activeDaysLast7 = Math.max(1, dayLogs.slice(0, 7).length);
  const sumLast7 = dayLogs.slice(0, 7).reduce((acc: number, d) => acc + d.totalCount, 0);
  const pace7DayReal = Math.round((sumLast7 / activeDaysLast7) * 10) / 10;

  const activePace = Math.max(
    1,
    todayCount,
    pace7DayReal,
    weeklyAverage,
    analytics.dailyAverage
  );

  const daysToComplete = isLifetimeGoalAchieved ? 0 : Math.ceil(lifetimeRemaining / activePace);

  const getEstimatedCompletionDate = (days: number) => {
    if (isLifetimeGoalAchieved) return 'Goal Completed! 🎉';
    if (days <= 0) return 'Today!';
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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
          <div className={`mt-1 flex items-center space-x-1 px-3 py-1 rounded-full border font-bold text-sm ${
            todayValue < 0
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
          }`}>
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
                Lifetime Value
              </span>
              <RollingNumber
                value={lifetimeCount * settings.valuePerMomentum}
                prefix="₹"
                className="text-base font-bold text-emerald-600 dark:text-emerald-400"
              />
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

      {/* 4. Lifetime Goal Circle Analytics Card */}
      <motion.div
        whileHover={{ y: -2 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-purple-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-purple-950/20 p-5 border border-purple-200/60 dark:border-purple-900/30 shadow-soft-md space-y-4"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1">
                Lifetime Goal Analytics <Sparkles className="w-3 h-3 text-purple-500" />
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400">Completion prediction based on current pace</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('settings')}
            className="px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-extrabold text-xs border border-purple-500/20 transition"
            title="Edit Lifetime Goal Target"
          >
            Target: {lifetimeGoal}
          </button>
        </div>

        {/* Main Circle Analytics Display */}
        <div className="relative z-10 flex flex-col items-center justify-center py-2">
          <ProgressRing
            current={lifetimeCount}
            goal={lifetimeGoal}
            size={145}
            strokeWidth={12}
            gradientColors={['#a855f7', '#6366f1']}
            gradientId="lifetimeRingGradient"
          >
            <div className="flex flex-col items-center justify-center text-center">
              {isLifetimeGoalAchieved ? (
                <>
                  <Trophy className="w-6 h-6 text-amber-500 mb-0.5 animate-bounce" />
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">Goal Met!</span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">100% Achieved</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                    {daysToComplete}
                  </span>
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mt-0.5">
                    {daysToComplete === 1 ? 'Day Left' : 'Days Left'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                    to reach {lifetimeGoal} score
                  </span>
                </>
              )}
            </div>
          </ProgressRing>
        </div>

        {/* Analytics Scenario Breakdown Grid */}
        <div className="relative z-10 grid grid-cols-3 gap-2.5 pt-2 border-t border-purple-100 dark:border-purple-900/40 text-center">
          {/* Progress */}
          <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-zinc-950/60 border border-slate-200/60 dark:border-zinc-800">
            <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 block mb-0.5">
              Score Progress
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {lifetimeCount} / {lifetimeGoal}
            </span>
            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 block mt-0.5">
              {lifetimePercentage}% done
            </span>
          </div>

          {/* Current Pace Scenario */}
          <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-zinc-950/60 border border-slate-200/60 dark:border-zinc-800">
            <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 block mb-0.5">
              Current Pace
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {activePace}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-zinc-400 block mt-0.5">
              counts/day
            </span>
          </div>

          {/* Estimated Completion Date */}
          <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-zinc-950/60 border border-slate-200/60 dark:border-zinc-800">
            <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 block mb-0.5">
              Est. Completion
            </span>
            <span className="text-[11px] font-extrabold text-slate-900 dark:text-white block leading-tight">
              {getEstimatedCompletionDate(daysToComplete)}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-zinc-400 block mt-0.5">
              {isLifetimeGoalAchieved ? 'Achieved' : 'Predicted'}
            </span>
          </div>
        </div>
      </motion.div>

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
            className="pointer-events-auto relative w-20 h-20 rounded-full bg-white dark:bg-zinc-900 text-slate-800 dark:text-white flex items-center justify-center shadow-floating transition-all border border-slate-200/90 dark:border-zinc-800 active:bg-slate-100 outline-none select-none"
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
