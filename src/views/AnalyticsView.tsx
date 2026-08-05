import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppDataContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import {
  Trophy,
  Target,
  Zap,
  Calendar as CalendarIcon,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AnalyticsView: React.FC = () => {
  const { dayLogs, analytics, settings, todayDateStr } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState<Date>(new Date());

  // 1. Daily Bar Chart Data (Hourly distribution for today)
  const dailyHourlyData = useMemo(() => {
    const todayLog = dayLogs.find((l) => l.date === todayDateStr);
    const hoursMap: Record<number, number> = {};
    for (let h = 6; h <= 23; h++) hoursMap[h] = 0;

    if (todayLog) {
      todayLog.entries.forEach((e) => {
        const hour = new Date(e.timestamp).getHours();
        if (hour >= 6 && hour <= 23) {
          hoursMap[hour] = (hoursMap[hour] || 0) + e.count;
        }
      });
    }

    return Object.keys(hoursMap).map((hStr) => {
      const h = parseInt(hStr);
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      return {
        time: `${displayHour}${period}`,
        count: Math.max(0, hoursMap[h]),
      };
    });
  }, [dayLogs, todayDateStr]);

  // 2. Weekly Line Chart Data (Last 7 days)
  const weeklyData = useMemo(() => {
    const last7 = [...dayLogs.slice(0, 7)].reverse();
    return last7.map((l) => {
      const d = new Date(l.date);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        day: dayName,
        date: l.date,
        count: l.totalCount,
        goal: settings.dailyGoal,
      };
    });
  }, [dayLogs, settings.dailyGoal]);

  // 3. Monthly Area Chart Data (Last 30 days)
  const monthlyData = useMemo(() => {
    const last30 = [...dayLogs.slice(0, 30)].reverse();
    return last30.map((l) => {
      const d = new Date(l.date);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      return {
        date: label,
        fullDate: l.date,
        count: l.totalCount,
        goal: settings.dailyGoal,
      };
    });
  }, [dayLogs, settings.dailyGoal]);

  // 4. Heatmap Matrix Data (Last 16 weeks = 112 days)
  const heatmapData = useMemo(() => {
    const days: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];
    const logMap = new Map<string, number>();
    dayLogs.forEach((l) => logMap.set(l.date, l.totalCount));

    const today = new Date();
    for (let i = 111; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const count = logMap.get(dStr) || 0;

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count > 0 && count < 15) level = 1;
      else if (count >= 15 && count < 35) level = 2;
      else if (count >= 35 && count < 55) level = 3;
      else if (count >= 55) level = 4;

      days.push({ date: dStr, count, level });
    }
    return days;
  }, [dayLogs]);

  // 5. Calendar Activity View Data for current month
  const calendarDays = useMemo(() => {
    const year = selectedCalendarMonth.getFullYear();
    const month = selectedCalendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const logMap = new Map<string, number>();
    dayLogs.forEach((l) => logMap.set(l.date, l.totalCount));

    const grid = [];
    // Padding for month start
    for (let i = 0; i < firstDay; i++) {
      grid.push({ day: null, date: null, count: 0 });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const count = logMap.get(dateStr) || 0;
      grid.push({ day: d, date: dateStr, count });
    }
    return grid;
  }, [selectedCalendarMonth, dayLogs]);

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Analytics & Insights
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Comprehensive momentum trends and performance breakdown
        </p>
      </div>

      {/* Period Filter Tabs */}
      <div className="flex bg-slate-200/60 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
        {(['daily', 'weekly', 'monthly'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all ${
              selectedPeriod === period
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-soft-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Interactive Charts Section */}
      <motion.div
        key={selectedPeriod}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-3xl bg-white dark:bg-zinc-900 p-5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-accent-500" />
            {selectedPeriod === 'daily' && "Today's Hourly Rhythm"}
            {selectedPeriod === 'weekly' && '7-Day Trend Curve'}
            {selectedPeriod === 'monthly' && '30-Day Momentum Area'}
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {selectedPeriod === 'daily' ? (
              <BarChart data={dailyHourlyData}>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderRadius: '12px',
                    borderColor: '#27272a',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : selectedPeriod === 'weekly' ? (
              <LineChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderRadius: '12px',
                    borderColor: '#27272a',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366f1' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="goal"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            ) : (
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderRadius: '12px',
                    borderColor: '#27272a',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#areaGradient)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* GitHub-style Contribution Heatmap */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 p-5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
            Activity Intensity Heatmap (16 Weeks)
          </h3>
          <span className="text-[10px] text-slate-400">112 Days</span>
        </div>

        <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2">
          {heatmapData.map((d, i) => {
            const levelColors = {
              0: 'bg-slate-100 dark:bg-zinc-800/60',
              1: 'bg-indigo-200 dark:bg-indigo-950/80',
              2: 'bg-indigo-300 dark:bg-indigo-800',
              3: 'bg-indigo-400 dark:bg-indigo-600',
              4: 'bg-accent-500 shadow-sm',
            };

            return (
              <div
                key={i}
                title={`${d.date}: ${d.count} momentum`}
                className={`w-3.5 h-3.5 rounded-sm ${levelColors[d.level]} transition-colors hover:scale-125 cursor-pointer`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-zinc-800/60">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-zinc-800/60" />
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-200 dark:bg-indigo-950" />
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-300 dark:bg-indigo-800" />
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 dark:bg-indigo-600" />
            <span className="w-2.5 h-2.5 rounded-sm bg-accent-500" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Calendar Activity View */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 p-5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-accent-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              Monthly Calendar Log
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() =>
                setSelectedCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              }
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              {selectedCalendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
            <button
              onClick={() =>
                setSelectedCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              }
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {calendarDays.map((item, idx) => {
            if (!item.day) {
              return <div key={idx} className="h-8" />;
            }

            const isToday = item.date === todayDateStr;
            const hasActivity = item.count > 0;
            const hitGoal = item.count >= settings.dailyGoal;

            return (
              <div
                key={idx}
                className={`h-8 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isToday
                    ? 'ring-2 ring-accent-500 font-bold'
                    : hitGoal
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : hasActivity
                    ? 'bg-slate-100 dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-200'
                    : 'text-slate-400 dark:text-zinc-600'
                }`}
              >
                <span>{item.day}</span>
                {hasActivity && (
                  <span className="w-1 h-1 rounded-full bg-accent-500 -mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Insights Key Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          Core Analytical Metrics
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Best Day */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 p-3.5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">Best Day</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {analytics.bestDay.count} <span className="text-xs font-normal text-slate-400">cnts</span>
              </div>
              <span className="text-[10px] text-slate-400">{analytics.bestDay.date}</span>
            </div>
          </div>

          {/* Consistency Score */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 p-3.5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">Consistency</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {analytics.consistencyScore}%
              </div>
              <span className="text-[10px] text-slate-400">Goal Target Rate</span>
            </div>
          </div>

          {/* Daily Average */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 p-3.5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-accent-500/10 text-accent-500">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">Daily Average</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {analytics.dailyAverage}
              </div>
              <span className="text-[10px] text-slate-400">Counts per day</span>
            </div>
          </div>

          {/* Trend % */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 p-3.5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">7-Day Trend</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {analytics.trendPercentage >= 0 ? `+${analytics.trendPercentage}%` : `${analytics.trendPercentage}%`}
              </div>
              <span className="text-[10px] text-slate-400">vs Previous Week</span>
            </div>
          </div>
        </div>

        {/* Projected Future Forecast */}
        <div className="rounded-3xl bg-slate-900 dark:bg-zinc-950 text-white p-5 shadow-soft-lg space-y-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Projected Momentum Forecast
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <span className="text-[11px] text-slate-400 block">Projected 10-Day Total</span>
              <span className="text-2xl font-extrabold text-white">
                {analytics.projected10DayTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                ≈ ₹{(analytics.projected10DayTotal * settings.valuePerMomentum).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Projected 30-Day Total</span>
              <span className="text-2xl font-extrabold text-white">
                {analytics.projectedMonthlyTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                ≈ ₹{(analytics.projectedMonthlyTotal * settings.valuePerMomentum).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
