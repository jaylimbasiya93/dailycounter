import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppDataContext';
import { Search, Calendar as CalendarIcon, Trash2, Undo2, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HistoryView: React.FC = () => {
  const { dayLogs, deleteEntry, deleteDayEntries, undoLastDelete, canUndo, settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Filter day logs based on search query or date filter
  const filteredDayLogs = useMemo(() => {
    return dayLogs
      .map((log) => {
        // Date match check
        if (dateFilter && log.date !== dateFilter) return null;

        // Search query check
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesDate = log.date.includes(q);
          const matchingEntries = log.entries.filter(
            (e) => (e.note && e.note.toLowerCase().includes(q)) || e.count.toString().includes(q)
          );

          if (!matchesDate && matchingEntries.length === 0) return null;

          return {
            ...log,
            entries: matchesDate ? log.entries : matchingEntries,
          };
        }

        return log;
      })
      .filter((log): log is typeof dayLogs[0] => log !== null);
  }, [dayLogs, searchQuery, dateFilter]);

  // Group day logs by Month (e.g. August 2026, July 2026)
  const groupedByMonth = useMemo(() => {
    const groups: { monthTitle: string; logs: typeof filteredDayLogs }[] = [];
    const monthMap: Record<string, typeof filteredDayLogs> = {};

    filteredDayLogs.forEach((log) => {
      const d = new Date(log.date);
      const monthTitle = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!monthMap[monthTitle]) monthMap[monthTitle] = [];
      monthMap[monthTitle].push(log);
    });

    Object.keys(monthMap).forEach((m) => {
      groups.push({ monthTitle: m, logs: monthMap[m] });
    });

    return groups;
  }, [filteredDayLogs]);

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-5">
      {/* Header & Controls */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Momentum History
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Detailed timeline of daily counts, logs, and edits
        </p>
      </div>

      {/* Search & Date Jump Controls */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search date or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Jump Input */}
        <div className="relative">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="sr-only"
            id="history-date-picker"
          />
          <label
            htmlFor="history-date-picker"
            className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl border text-xs font-semibold cursor-pointer transition ${
              dateFilter
                ? 'bg-accent-500 text-white border-accent-500'
                : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>{dateFilter ? dateFilter : 'Jump'}</span>
          </label>
        </div>
      </div>

      {dateFilter && (
        <div className="flex items-center justify-between text-xs bg-slate-100 dark:bg-zinc-900 px-3 py-1.5 rounded-xl text-slate-600 dark:text-zinc-400">
          <span>Filtering by date: <strong>{dateFilter}</strong></span>
          <button
            onClick={() => setDateFilter('')}
            className="text-accent-600 dark:text-accent-400 font-bold hover:underline"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* History Log Timeline Grouped By Month */}
      {groupedByMonth.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800">
          <Clock className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">No records found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or date filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByMonth.map((group) => (
            <div key={group.monthTitle} className="space-y-3">
              {/* Month Header Banner */}
              <div className="sticky top-14 z-20 backdrop-blur-md bg-slate-50/90 dark:bg-zinc-950/90 py-1 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-accent-600 dark:text-accent-400">
                  {group.monthTitle}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {group.logs.reduce((acc, l) => acc + l.totalCount, 0)} total counts
                </span>
              </div>

              {/* Day Log Cards */}
              <div className="space-y-3">
                {group.logs.map((log) => {
                  const logDate = new Date(log.date);
                  const displayDate = logDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  });

                  const isGoalHit = log.totalCount >= settings.dailyGoal;

                  return (
                    <motion.div
                      key={log.date}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm overflow-hidden"
                    >
                      {/* Day Header */}
                      <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/60">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {displayDate}
                            </span>
                            {isGoalHit && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                                Goal Met
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {log.entries.length} entry session{log.entries.length > 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900 dark:text-white block leading-none">
                              {log.totalCount}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              ₹{log.totalCount * settings.valuePerMomentum}
                            </span>
                          </div>

                          <button
                            onClick={() => deleteDayEntries(log.date)}
                            className="p-2 text-slate-400 hover:text-rose-500 transition rounded-xl"
                            title="Delete entire day"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Entries Breakdown List */}
                      <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                        {log.entries.map((entry) => {
                          const timeStr = new Date(entry.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });

                          return (
                            <div
                              key={entry.id}
                              className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition"
                            >
                              <div className="flex items-center space-x-2.5">
                                <span className={`w-2 h-2 rounded-full ${entry.count >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <div>
                                  <div className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-zinc-300">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>{timeStr}</span>
                                    {entry.note && (
                                      <span className="text-slate-400 italic text-[11px]">
                                        — "{entry.note}"
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                <span className={`text-xs font-bold ${entry.count >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
                                  {entry.count >= 0 ? `+${entry.count}` : entry.count}
                                </span>
                                <button
                                  onClick={() => deleteEntry(entry.id)}
                                  className="text-slate-300 hover:text-rose-500 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Undo Delete Floating Snackbar */}
      <AnimatePresence>
        {canUndo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto bg-slate-900 dark:bg-zinc-900 text-white p-3.5 rounded-2xl shadow-floating flex items-center justify-between border border-slate-800"
          >
            <span className="text-xs font-medium">Entry deleted</span>
            <button
              onClick={undoLastDelete}
              className="flex items-center space-x-1 text-xs font-bold text-accent-400 hover:text-accent-300 px-3 py-1 bg-accent-500/10 rounded-xl"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
