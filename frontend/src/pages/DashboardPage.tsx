import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import * as firestore from '@/lib/firestore';
import ProgressRing from '@/components/dashboard/ProgressRing';
import DailyChart from '@/components/dashboard/DailyChart';
import HabitCalendar from '@/components/dashboard/HabitCalendar';
import HabitDialog from '@/components/dashboard/HabitDialog';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Trash2, Edit3, Flame, Trophy, Sparkles,
    Calendar, Download, Target, ChevronLeft, ChevronRight,
    Zap, TrendingUp, BarChart3, Menu, X, Activity, Settings, LogOut,
} from 'lucide-react';

interface Habit {
    id: string;
    userId: string;
    name: string;
    category: string;
    createdAt: string;
}

interface HabitLog {
    id: string;
    habitId: string;
    date: string;
    completed: boolean;
}

interface HabitStats {
    habitId: string;
    name: string;
    currentStreak: number;
    longestStreak: number;
    weeklyRate: number;
    totalCompleted: number;
}

function getMonthDays(year: number, month: number): string[] {
    const days: string[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

function generateChartData(logs: HabitLog[], habits: Habit[], days: string[]) {
    return days.map((day) => {
        const dayLogs = logs.filter((l) => l.date === day);
        return {
            date: new Date(day).toLocaleDateString('en', { day: 'numeric' }),
            completed: dayLogs.filter((l) => l.completed).length,
            total: habits.length,
        };
    });
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [logs, setLogs] = useState<HabitLog[]>([]);
    const [stats, setStats] = useState<HabitStats[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Get currently authenticated user
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const now = new Date();
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth());

    const days = getMonthDays(viewYear, viewMonth);

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            const [habitsRes, logsRes, statsRes] = await Promise.all([
                firestore.getHabits(user.id),
                firestore.getLogsForMonth(user.id, viewYear, viewMonth + 1),
                firestore.getHabitStats(user.id),
            ]);
            setHabits(habitsRes);
            setLogs(logsRes);
            setStats(statsRes);
        } catch (err) {
            console.error('Failed to fetch data', err);
        }
    }, [viewYear, viewMonth, user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAddHabit = async (data: { name: string; category: string }) => {
        if (!user) return;
        try { await firestore.addHabit(user.id, data.name, data.category); fetchData(); }
        catch (err) { console.error('Failed to add habit', err); }
    };

    const handleEditHabit = async (data: { name: string; category: string }) => {
        if (!editingHabit) return;
        try { await firestore.updateHabit(editingHabit.id, data.name, data.category); setEditingHabit(null); fetchData(); }
        catch (err) { console.error('Failed to edit habit', err); }
    };

    const handleDeleteHabit = async (id: string) => {
        try { await firestore.deleteHabit(id); fetchData(); }
        catch (err) { console.error('Failed to delete habit', err); }
    };

    const handleToggle = async (habitId: string, date: string) => {
        try { await firestore.toggleHabitLog(habitId, date); fetchData(); }
        catch (err) { console.error('Failed to toggle', err); }
    };

    const handleExportCSV = async () => {
        if (!user) return;
        try {
            const csvData = await firestore.exportHabitsCSV(user.id);
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `habits-${viewYear}-${viewMonth + 1}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) { console.error('Export failed', err); }
    };

    const handleSeedData = async () => {
        if (!user) return;
        try { await firestore.seedSampleData(user.id); fetchData(); }
        catch (err) { console.error('Seed failed', err); }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
        else setViewMonth(viewMonth - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
        else setViewMonth(viewMonth + 1);
    };

    // Calculations
    const todayStr = now.toISOString().split('T')[0];
    const todayLogs = logs.filter((l) => l.date === todayStr);
    const todayCompleted = todayLogs.filter((l) => l.completed).length;
    const totalHabits = habits.length;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
        return d.toISOString().split('T')[0];
    });
    const weekLogs = logs.filter((l) => weekDays.includes(l.date) && l.completed);
    const weeklyCompleted = weekLogs.length;
    const weeklyTotal = totalHabits * 7;

    const monthLogs = logs.filter((l) => l.completed);
    const monthlyCompleted = monthLogs.length;
    const monthlyTotal = totalHabits * days.length;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now); d.setDate(now.getDate() - i);
        return d.toISOString().split('T')[0];
    });
    const last7Logs = logs.filter((l) => last7Days.includes(l.date) && l.completed);
    const momentum = totalHabits > 0 ? last7Logs.length / (totalHabits * 7) : 0;

    const chartData = generateChartData(logs, habits, days);
    const topHabits = [...stats].sort((a, b) => b.totalCompleted - a.totalCompleted).slice(0, 5);
    const activeStreaks = [...stats].filter((s) => s.currentStreak > 0).sort((a, b) => b.currentStreak - a.currentStreak);
    const bestStreak = stats.length > 0 ? Math.max(...stats.map(s => s.longestStreak)) : 0;

    return (
        <div className="min-h-screen bg-background ambient-glow">
            {/* ─── MOBILE HEADER ─── */}
            <div className="lg:hidden sticky top-0 z-50 glass border-b border-border px-5 py-3.5 flex items-center justify-between">
                <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-semibold text-sm">Habit Tracker</span>
                </div>
                <div className="w-5" />
            </div>

            <div className="flex relative">
                {/* ═══════════════ LEFT SIDEBAR ═══════════════ */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                <aside className={`w-[280px] shrink-0 border-r border-border/40 min-h-screen p-6 flex flex-col gap-6 z-50
                    bg-[linear-gradient(180deg,rgba(9,14,23,0.6),rgba(3,5,9,0.95))] backdrop-blur-3xl
                    ${sidebarOpen ? 'fixed inset-y-0 left-0' : 'hidden lg:flex'}`}
                >
                    {/* Mobile close */}
                    <div className="lg:hidden flex justify-end -mt-1 -mr-1">
                        <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Brand */}
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center ring-1 ring-white/5">
                            <Zap className="w-4.5 h-4.5 text-primary" />
                        </div>
                        <div>
                            <div className="font-semibold text-[13px] tracking-tight">Habit Tracker</div>
                            <div className="text-[11px] text-muted-foreground">Dashboard</div>
                        </div>
                    </div>

                    {/* Month Navigation */}
                    <div className="stat-card">
                        <div className="flex items-center justify-between mb-2">
                            <button onClick={prevMonth} className="p-1 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            <span className="text-[13px] font-semibold tracking-tight">
                                {MONTH_SHORT[viewMonth]} {viewYear}
                            </span>
                            <button onClick={nextMonth} className="p-1 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{days.length} days</span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div>
                        <h3 className="section-title mb-3 px-1">Overview</h3>
                        <div className="space-y-2">
                            <div className="stat-card flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                                    <Target className="w-4 h-4 text-success" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[17px] font-bold leading-tight">{totalHabits}</div>
                                    <div className="text-[10px] text-muted-foreground">Active Habits</div>
                                </div>
                            </div>
                            <div className="stat-card flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[17px] font-bold leading-tight">{todayCompleted}<span className="text-muted-foreground text-xs font-normal">/{totalHabits}</span></div>
                                    <div className="text-[10px] text-muted-foreground">Done Today</div>
                                </div>
                            </div>
                            <div className="stat-card flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                                    <Flame className="w-4 h-4 text-warning" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[17px] font-bold leading-tight">{bestStreak}<span className="text-muted-foreground text-xs font-normal"> days</span></div>
                                    <div className="text-[10px] text-muted-foreground">Best Streak</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 mt-auto">
                        <button
                            className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer"
                            onClick={() => { setEditingHabit(null); setDialogOpen(true); }}
                        >
                            <Plus className="w-4 h-4" /> New Habit
                        </button>
                        {habits.length === 0 && (
                            <button
                                className="nav-item w-full justify-center text-[11px]"
                                onClick={handleSeedData}
                            >
                                <Sparkles className="w-3.5 h-3.5" /> Load Sample Data
                            </button>
                        )}
                        <button className="nav-item w-full" onClick={handleExportCSV}>
                            <Download className="w-3.5 h-3.5" /> Export CSV
                        </button>
                        <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
                            <button className="nav-item w-full" onClick={() => navigate('/settings')}>
                                <Settings className="w-3.5 h-3.5" /> Settings
                            </button>
                            <button className="nav-item w-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                                <LogOut className="w-3.5 h-3.5" /> Log Out
                            </button>
                        </div>
                    </div>
                </aside>

                {/* ═══════════════ CENTER CONTENT ═══════════════ */}
                <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 lg:pb-20 overflow-auto relative z-[1]">
                    {/* Page Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-2xl font-bold tracking-tight">
                            Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {now.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </motion.div>

                    {/* Progress Rings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-10"
                    >
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {[
                                { value: momentum * 100, max: 100, color: '#3b82f6', label: 'Momentum', sub: '7-day avg' },
                                { value: todayCompleted, max: Math.max(totalHabits, 1), color: '#10b981', label: 'Daily', sub: `${todayCompleted}/${totalHabits}` },
                                { value: weeklyCompleted, max: Math.max(weeklyTotal, 1), color: '#8b5cf6', label: 'Weekly', sub: `${weeklyCompleted}/${weeklyTotal}` },
                                { value: monthlyCompleted, max: Math.max(monthlyTotal, 1), color: '#f59e0b', label: 'Monthly', sub: `${monthlyCompleted}/${monthlyTotal}` },
                            ].map((ring, i) => (
                                <motion.div
                                    key={ring.label}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                                    className="glass-card rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-6 flex justify-center items-center"
                                >
                                    <ProgressRing
                                        value={ring.value}
                                        max={ring.max}
                                        size={100}
                                        color={ring.color}
                                        label={ring.label}
                                        sublabel={ring.sub}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Habit Calendar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-10"
                    >
                        <div className="glass-card rounded-[1.5rem] overflow-hidden">
                            <div className="px-6 pt-5 pb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-success/8 flex items-center justify-center">
                                        <Calendar className="w-3.5 h-3.5 text-success" />
                                    </div>
                                    <h2 className="text-sm font-semibold">Habit Calendar</h2>
                                </div>
                                <span className="text-[11px] text-muted-foreground font-medium">
                                    {MONTHS[viewMonth]} {viewYear}
                                </span>
                            </div>
                            <div className="px-6 pb-6">
                                {habits.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                                            <Target className="w-6 h-6 text-muted-foreground/40" />
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-1">No habits yet</p>
                                        <p className="text-xs text-muted-foreground/60 mb-5">Create your first habit to start tracking</p>
                                        <div className="flex gap-2 justify-center">
                                            <button className="btn-primary text-xs" onClick={() => { setEditingHabit(null); setDialogOpen(true); }}>
                                                <Plus className="w-3.5 h-3.5 mr-1 inline" /> Add Habit
                                            </button>
                                            <button className="nav-item text-xs px-4 py-2" onClick={handleSeedData}>
                                                Load Samples
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <HabitCalendar habits={habits} logs={logs} days={days} onToggle={handleToggle} />
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Daily Progress Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-10"
                    >
                        <div className="glass-card rounded-[1.5rem] overflow-hidden">
                            <div className="px-6 pt-5 pb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
                                        <BarChart3 className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <h2 className="text-sm font-semibold">Daily Progress</h2>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 rounded bg-[#3b82f6]" /> Completed</span>
                                    <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 rounded bg-[#8b5cf6] opacity-50" /> Total</span>
                                </div>
                            </div>
                            <div className="px-4 pb-4">
                                <DailyChart data={chartData} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Manage Habits */}
                    {habits.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="glass-card rounded-[1.5rem] overflow-hidden">
                                <div className="px-6 pt-5 pb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-accent/8 flex items-center justify-center">
                                            <Edit3 className="w-3.5 h-3.5 text-accent" />
                                        </div>
                                        <h2 className="text-sm font-semibold">Manage Habits</h2>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">{habits.length} total</span>
                                </div>
                                <div className="px-6 pb-5">
                                    <div className="space-y-1.5">
                                        {habits.map((habit) => (
                                            <div
                                                key={habit.id}
                                                className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.04] transition-all group border border-transparent hover:border-white/5"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-2 h-2 rounded-full bg-success/60 shrink-0" />
                                                    <div>
                                                        <div className="text-[13px] font-medium">{habit.name}</div>
                                                        <div className="text-[11px] text-muted-foreground">{habit.category}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setEditingHabit(habit); setDialogOpen(true); }}
                                                        className="p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteHabit(habit.id)}
                                                        className="p-2 hover:bg-destructive/8 rounded-lg cursor-pointer transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </main>

                {/* ═══════════════ RIGHT SIDEBAR ═══════════════ */}
                <aside className="hidden xl:flex w-[280px] shrink-0 border-l border-border/40 min-h-screen p-6 flex-col gap-8 z-10
                    bg-[linear-gradient(180deg,rgba(9,14,23,0.6),rgba(3,5,9,0.95))] backdrop-blur-3xl">



                    {/* Active Streaks */}
                    <div>
                        <h3 className="section-title mb-3 flex items-center gap-2 px-1">
                            <Flame className="w-3 h-3 text-destructive" /> Active Streaks
                        </h3>
                        <div className="space-y-2">
                            {activeStreaks.length === 0 && (
                                <p className="text-[11px] text-muted-foreground px-1">No active streaks</p>
                            )}
                            {activeStreaks.map((s, i) => (
                                <motion.div
                                    key={s.habitId}
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.06 }}
                                    className="stat-card flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-warning/8 flex items-center justify-center shrink-0">
                                        <Flame className="w-4 h-4 text-warning" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[12px] font-medium truncate">{s.name}</div>
                                        <div className="text-[10px] text-muted-foreground">
                                            {s.currentStreak}d streak · Best: {s.longestStreak}d
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Completion Rate */}
                    <div>
                        <h3 className="section-title mb-3 px-1">Weekly Completion</h3>
                        <div className="space-y-3">
                            {stats.slice(0, 6).map((s) => (
                                <div key={s.habitId} className="px-1">
                                    <div className="flex justify-between text-[11px] mb-1.5">
                                        <span className="text-muted-foreground truncate">{s.name}</span>
                                        <span className="text-foreground font-semibold ml-2">{Math.round(s.weeklyRate)}%</span>
                                    </div>
                                    <div className="progress-track">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${s.weeklyRate}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="progress-fill"
                                            style={{
                                                background: s.weeklyRate >= 80
                                                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                                                    : s.weeklyRate >= 50
                                                        ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                                                        : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {/* Habit Dialog */}
            <HabitDialog
                open={dialogOpen}
                onClose={() => { setDialogOpen(false); setEditingHabit(null); }}
                onSave={editingHabit ? handleEditHabit : handleAddHabit}
                habit={editingHabit}
            />
        </div>
    );
}
