import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface HabitLog {
    habitId: string;
    date: string;
    completed: boolean;
}

interface Habit {
    id: string;
    name: string;
    category: string;
}

interface HabitCalendarProps {
    habits: Habit[];
    logs: HabitLog[];
    days: string[];
    onToggle: (habitId: string, date: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    Fitness: '#3b82f6',
    Health: '#10b981',
    Learning: '#8b5cf6',
    Mindfulness: '#f59e0b',
    Productivity: '#06b6d4',
    Other: '#64748b',
};

export default function HabitCalendar({ habits, logs, days, onToggle }: HabitCalendarProps) {
    const isCompleted = (habitId: string, date: string) => {
        return logs.some(
            (log) => log.habitId === habitId && log.date === date && log.completed
        );
    };

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="overflow-x-auto"
        >
            <div className="min-w-[700px]">
                {/* Header with day numbers */}
                <div className="flex mb-3">
                    <div className="w-32 shrink-0" />
                    <div className="flex-1 flex gap-[3px]">
                        {days.map((day) => {
                            const dayNum = new Date(day).getDate();
                            const isToday = day === todayStr;
                            const dayOfWeek = new Date(day).toLocaleDateString('en', { weekday: 'narrow' });
                            return (
                                <div key={day} className="flex-1 flex flex-col items-center gap-0.5">
                                    <span className="text-[9px] text-muted-foreground/50">{dayOfWeek}</span>
                                    <span
                                        className={`text-[10px] font-medium leading-none ${isToday
                                                ? 'text-primary bg-primary/10 w-5 h-5 rounded-full flex items-center justify-center'
                                                : 'text-muted-foreground/70'
                                            }`}
                                    >
                                        {dayNum}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Habit rows */}
                {habits.map((habit, rowIndex) => {
                    const catColor = CATEGORY_COLORS[habit.category] || CATEGORY_COLORS.Other;
                    return (
                        <motion.div
                            key={habit.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: rowIndex * 0.04 }}
                            className="flex items-center mb-[3px]"
                        >
                            {/* Habit name with category dot */}
                            <div className="w-32 shrink-0 pr-3 flex items-center gap-2">
                                <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: catColor }}
                                />
                                <span className="text-[11px] text-muted-foreground truncate">
                                    {habit.name}
                                </span>
                            </div>
                            {/* Day cells */}
                            <div className="flex-1 flex gap-[3px]">
                                {days.map((day) => {
                                    const completed = isCompleted(habit.id, day);
                                    const isToday = day === todayStr;
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => onToggle(habit.id, day)}
                                            className={`cal-cell flex-1 aspect-square flex items-center justify-center cursor-pointer transition-all duration-300 rounded-[6px]
                                                ${completed
                                                    ? 'bg-success hover:bg-success/90 ring-1 ring-success/50 shadow-[0_0_12px_rgba(16,185,129,0.4)] z-10'
                                                    : isToday
                                                        ? 'bg-primary/20 hover:bg-primary/30 ring-1 ring-primary/50 shadow-[inset_0_0_8px_rgba(99,102,241,0.2)]'
                                                        : 'bg-white/[0.03] hover:bg-white/[0.08] ring-1 ring-white/[0.05]'
                                                }`}
                                            title={`${habit.name} — ${day}`}
                                        >
                                            {completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
