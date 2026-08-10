import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppDataContext';
import { getLocalDateStr } from '../utils/date';
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
  Cell,
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
  Clock,
  Activity,
  PlusCircle,
  MinusCircle,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AnalyticsView: React.FC = () => {
  const { dayLogs, analytics, settings, todayDateStr } = useApp();

  type PeriodType = 'hourly_all' | 'hourly_today' | 'weekly' | 'monthly' | 'cumulative';
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('hourly_all');
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState<Date>(new Date());
  const [allTimeHourlyMode, setAllTimeHourlyMode] = useState<'avg' | 'total'>('avg');

  // 1. All-time Hourly Average & Total Data (0..23 hours)
  const allTimeHourlyChartData = useMemo(() => {
    return analytics.allTimeHourlyStats.map((item) => ({
      hour: item.hour,
      time: item.timeLabel,
      avg: item.avgCount,
      total: item.totalCount,
      entries: item.entryCount,
      isPeak: item.hour === analytics.peakHour.hour,
    }));
  }, [analytics.allTimeHourlyStats, analytics.peakHour]);

  // 2. Today's Hourly Data
  const todayHourlyData = useMemo(() => {
    const todayLog = dayLogs.find((l) => l.date === todayDateStr);
    const hoursMap: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hoursMap[h] = 0;

    if (todayLog) {
      todayLog.entries.forEach((e) => {
        const hour = new Date(e.timestamp).getHours();
        if (hour >= 0 && hour < 24) {
          hoursMap[hour] = (hoursMap[hour] || 0) + e.count;
        }
      });
    }

    return Object.keys(hoursMap).map((hStr) => {
      const h = parseInt(hStr);
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      return {
        time: `${displayHour} ${period}`,
        count: hoursMap[h],
      };
    });
  }, [dayLogs, todayDateStr]);

  // 3. Weekly Line Chart Data (Last 7 days)
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

  // 4. Monthly Area Chart Data (Last 30 days)
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

  // 5. Cumulative Growth Trend Data (Oldest to Newest)
  const cumulativeData = useMemo(() => {
    const sorted = [...dayLogs].reverse();
    let runningTotal = 0;
    return sorted.map((l) => {
      runningTotal += l.totalCount;
      const d = new Date(l.date);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      return {
        date: label,
        cumulativeCount: runningTotal,
        cumulativeValue: runningTotal * settings.valuePerMomentum,
      };
    });
  }, [dayLogs, settings.valuePerMomentum]);

  // 6. Heatmap Matrix Data (Last 16 weeks = 112 days)
  const heatmapData = useMemo(() => {
    const days: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];
    const logMap = new Map<string, number>();
    dayLogs.forEach((l) => logMap.set(l.date, l.totalCount));

    const today = new Date();
    for (let i = 111; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateStr(d);
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

  // 7. Calendar Activity View Data for current month
  const calendarDays = useMemo(() => {
    const year = selectedCalendarMonth.getFullYear();
    const month = selectedCalendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const logMap = new Map<string, number>();
    dayLogs.forEach((l) => logMap.set(l.date, l.totalCount));

    const grid = [];
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
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-6 select-none">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Analytics & Insights
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Comprehensive momentum trends, hourly peak patterns & analytics
        </p>
      </div>

      {/* Main Filter Period Tabs */}
      <div className="flex bg-slate-200/60 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-800 overflow-x-auto">
        {(
          [
            { id: 'hourly_all', label: 'All-Time Hourly' },
            { id: 'hourly_today', label: 'Today Hourly' },
            { id: 'weekly', label: '7-Day Trend' },
            { id: 'monthly', label: '30-Day Trend' },
            { id: 'cumulative', label: 'Growth' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedPeriod(item.id)}
            className={`flex-1 min-w-[70px] py-1.5 px-2 text-[11px] font-semibold rounded-xl transition-all whitespace-nowrap text-center ${
              selectedPeriod === item.id
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-soft-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Interactive Main Chart Section */}
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
            {selectedPeriod === 'hourly_all' && 'All-Time Hourly Average (0–23h)'}
            {selectedPeriod === 'hourly_today' && "Today's Hourly Rhythm"}
            {selectedPeriod === 'weekly' && '7-Day Trend Curve'}
            {selectedPeriod === 'monthly' && '30-Day Momentum Area'}
            {selectedPeriod === 'cumulative' && 'Lifetime Cumulative Growth'}
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {selectedPeriod === 'hourly_all' ? (
              <BarChart data={allTimeHourlyChartData}>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} interval={2} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderRadius: '12px',
                    borderColor: '#27272a',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} avg/day`, 'Average Momentum']}
                />
                <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                  {allTimeHourlyChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isPeak ? '#f59e0b' : '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : selectedPeriod === 'hourly_today' ? (
              <BarChart data={todayHourlyData}>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} interval={2} />
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
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
            ) : selectedPeriod === 'monthly' ? (
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
            ) : (
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="cumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
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
                  formatter={(val: any, name: any) => [
                    name === 'cumulativeValue' ? `₹${val.toLocaleString('en-IN')}` : val,
                    name === 'cumulativeValue' ? 'Total Earned Value' : 'Cumulative Momentum',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeCount"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cumGradient)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 1. NEW ANALYTICS SECTION: Lifetime Hourly Rhythm & Peak Hours Breakdown */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 p-5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-accent-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              All-Time Hourly Peak Rhythm
            </h3>
          </div>

          <div className="flex bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl text-[10px] font-semibold">
            <button
              onClick={() => setAllTimeHourlyMode('avg')}
              className={`px-2 py-1 rounded-lg transition ${
                allTimeHourlyMode === 'avg'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-soft-sm font-bold'
                  : 'text-slate-500'
              }`}
            >
              Avg / Day
            </button>
            <button
              onClick={() => setAllTimeHourlyMode('total')}
              className={`px-2 py-1 rounded-lg transition ${
                allTimeHourlyMode === 'total'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-soft-sm font-bold'
                  : 'text-slate-500'
              }`}
            >
              Total Score
            </button>
          </div>
        </div>

        {/* Peak Hour Banner & Quiet Hour Banner */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300">
            <div className="flex items-center space-x-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Peak Activity Hour
              </span>
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {analytics.peakHour.timeLabel}
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-0.5">
              Avg <strong>{analytics.peakHour.avgCount}</strong> pts ({analytics.peakHour.totalCount} total)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 dark:text-indigo-300">
            <div className="flex items-center space-x-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Lowest Activity Hour
              </span>
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {analytics.lowestHour.timeLabel}
            </div>
            <span className="text-[10px] text-indigo-700 dark:text-indigo-400 block mt-0.5">
              Avg <strong>{analytics.lowestHour.avgCount}</strong> pts ({analytics.lowestHour.totalCount} total)
            </span>
          </div>
        </div>

        {/* 24-Hour All-Time Bar Chart */}
        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={allTimeHourlyChartData}>
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} interval={3} />
              <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  borderRadius: '12px',
                  borderColor: '#27272a',
                  color: '#fff',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [
                  allTimeHourlyMode === 'avg' ? `${val} pts/day` : `${val} total pts`,
                  allTimeHourlyMode === 'avg' ? 'Historical Average' : 'Total Score',
                ]}
              />
              <Bar
                dataKey={allTimeHourlyMode === 'avg' ? 'avg' : 'total'}
                radius={[4, 4, 0, 0]}
              >
                {allTimeHourlyChartData.map((entry, index) => (
                  <Cell
                    key={`alltime-cell-${index}`}
                    fill={entry.isPeak ? '#f59e0b' : '#6366f1'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. NEW ANALYTICS SECTION: Day-of-Week (Weekday) Performance Pattern */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 p-5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              Weekday Habit Rhythm
            </h3>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Best: {analytics.bestWeekday.dayName} ({analytics.bestWeekday.avgCount} avg)
          </span>
        </div>

        {/* Weekday Bar Chart */}
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.weekdayStats}>
              <XAxis dataKey="dayName" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  borderRadius: '12px',
                  borderColor: '#27272a',
                  color: '#fff',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`${val} avg counts/day`, 'Average Score']}
              />
              <Bar dataKey="avgCount" radius={[6, 6, 0, 0]}>
                {analytics.weekdayStats.map((entry, index) => (
                  <Cell
                    key={`weekday-cell-${index}`}
                    fill={entry.dayName === analytics.bestWeekday.dayName ? '#10b981' : '#818cf8'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekday vs Weekend Comparison Pills */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 grid grid-cols-2 gap-3 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/60">
            <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 block">
              Weekday Average (Mon–Fri)
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {analytics.weekdayAvg} <span className="text-xs font-normal text-slate-400">pts/day</span>
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/60">
            <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 block">
              Weekend Average (Sat–Sun)
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {analytics.weekendAvg} <span className="text-xs font-normal text-slate-400">pts/day</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. NEW ANALYTICS SECTION: Entry Type & Incremental Dynamics */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 p-5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              Entry Type & Incremental Dynamics
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-500">
            {analytics.totalEntriesCount} total log sessions
          </span>
        </div>

        {/* Ratio Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" /> Positive (+): {analytics.positiveEntriesCount} ({analytics.positivePercentage}%)
            </span>
            <span className="text-rose-500 flex items-center gap-1">
              <MinusCircle className="w-3.5 h-3.5" /> Decrements (-): {analytics.negativeEntriesCount}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-rose-500/20 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${analytics.positivePercentage}%` }}
            />
          </div>
        </div>
      </div>

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
              <span className="text-[10px] font-semibold uppercase text-slate-400">Goal Rate</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {analytics.consistencyScore}%
              </div>
              <span className="text-[10px] text-slate-400">{analytics.daysGoalAchieved}/{analytics.totalDaysLogged} days goal met</span>
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
