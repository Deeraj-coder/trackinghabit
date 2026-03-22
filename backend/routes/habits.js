const express = require('express');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

const router = express.Router();

// Default user ID for no-auth mode
const DEFAULT_USER_ID = '000000000000000000000001';

// Middleware to set default userId
router.use((req, res, next) => {
    req.userId = req.userId || DEFAULT_USER_ID;
    next();
});

// GET /api/habits — List user's habits
router.get('/', async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.userId }).sort({ createdAt: 1 });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/habits — Create habit
router.post('/', async (req, res) => {
    try {
        const { name, category } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        const habit = await Habit.create({
            userId: req.userId,
            name,
            category: category || 'Other',
        });
        res.status(201).json(habit);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/habits/:id — Update habit
router.put('/:id', async (req, res) => {
    try {
        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { name: req.body.name, category: req.body.category },
            { new: true }
        );
        if (!habit) return res.status(404).json({ message: 'Habit not found' });
        res.json(habit);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/habits/:id — Delete habit and its logs
router.delete('/:id', async (req, res) => {
    try {
        const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!habit) return res.status(404).json({ message: 'Habit not found' });
        await HabitLog.deleteMany({ habitId: habit._id });
        res.json({ message: 'Habit deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/habits/logs?year=2026&month=3 — Get logs for a month
router.get('/logs', async (req, res) => {
    try {
        const { year, month } = req.query;
        const y = parseInt(year) || new Date().getFullYear();
        const m = parseInt(month) || new Date().getMonth() + 1;

        const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
        const endDate = `${y}-${String(m).padStart(2, '0')}-31`;

        const habits = await Habit.find({ userId: req.userId });
        const habitIds = habits.map((h) => h._id);

        const logs = await HabitLog.find({
            habitId: { $in: habitIds },
            date: { $gte: startDate, $lte: endDate },
        });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/habits/toggle — Toggle habit completion for a date
router.post('/toggle', async (req, res) => {
    try {
        const { habitId, date } = req.body;

        // Verify habit belongs to user
        const habit = await Habit.findOne({ _id: habitId, userId: req.userId });
        if (!habit) return res.status(404).json({ message: 'Habit not found' });

        // Check if log exists
        const existingLog = await HabitLog.findOne({ habitId, date });

        if (existingLog) {
            if (existingLog.completed) {
                await HabitLog.deleteOne({ _id: existingLog._id });
                res.json({ completed: false });
            } else {
                existingLog.completed = true;
                await existingLog.save();
                res.json({ completed: true });
            }
        } else {
            await HabitLog.create({ habitId, date, completed: true });
            res.json({ completed: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/habits/stats — Calculate streaks and stats
router.get('/stats', async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.userId });
        const today = new Date();

        const habitIds = habits.map((h) => h._id);
        const allLogs = await HabitLog.find({ habitId: { $in: habitIds }, completed: true });

        const stats = habits.map((habit) => {
            const habitLogs = allLogs
                .filter((l) => l.habitId.toString() === habit._id.toString())
                .map((l) => l.date)
                .sort()
                .reverse();

            const logSet = new Set(habitLogs);

            // Current streak
            let currentStreak = 0;
            let checkDate = new Date(today);
            while (true) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (logSet.has(dateStr)) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }

            // Longest streak
            let longestStreak = 0;
            let streak = 0;
            const sortedDates = [...logSet].sort();
            for (let i = 0; i < sortedDates.length; i++) {
                if (i === 0) {
                    streak = 1;
                } else {
                    const prev = new Date(sortedDates[i - 1]);
                    const curr = new Date(sortedDates[i]);
                    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
                    if (diffDays === 1) {
                        streak++;
                    } else {
                        streak = 1;
                    }
                }
                longestStreak = Math.max(longestStreak, streak);
            }

            // Weekly completion rate
            let weeklyCompleted = 0;
            for (let i = 0; i < 7; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                if (logSet.has(d.toISOString().split('T')[0])) {
                    weeklyCompleted++;
                }
            }
            const weeklyRate = (weeklyCompleted / 7) * 100;

            return {
                habitId: habit._id,
                name: habit.name,
                currentStreak,
                longestStreak,
                weeklyRate: Math.round(weeklyRate * 10) / 10,
                totalCompleted: habitLogs.length,
            };
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/habits/seed — Seed sample habits + logs
router.post('/seed', async (req, res) => {
    try {
        const sampleHabits = [
            { name: 'Stretch', category: 'Fitness' },
            { name: 'Workout', category: 'Fitness' },
            { name: 'Drink water', category: 'Health' },
            { name: 'Study', category: 'Learning' },
            { name: 'Read', category: 'Learning' },
            { name: 'Meditate', category: 'Mindfulness' },
            { name: 'Sleep early', category: 'Health' },
            { name: 'Clean room', category: 'Productivity' },
        ];

        const existingCount = await Habit.countDocuments({ userId: req.userId });
        if (existingCount > 0) {
            return res.status(400).json({ message: 'You already have habits. Delete them first to seed.' });
        }

        const createdHabits = await Habit.insertMany(
            sampleHabits.map((h) => ({ ...h, userId: req.userId }))
        );

        const logs = [];
        const today = new Date();
        for (const habit of createdHabits) {
            for (let i = 0; i < 30; i++) {
                if (Math.random() < 0.65) {
                    const d = new Date(today);
                    d.setDate(today.getDate() - i);
                    logs.push({
                        habitId: habit._id,
                        date: d.toISOString().split('T')[0],
                        completed: true,
                    });
                }
            }
        }

        if (logs.length > 0) {
            await HabitLog.insertMany(logs);
        }

        res.json({ message: 'Sample data created', habits: createdHabits.length, logs: logs.length });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/habits/export — Export habit data as CSV
router.get('/export', async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.userId });
        const habitIds = habits.map((h) => h._id);
        const allLogs = await HabitLog.find({ habitId: { $in: habitIds } }).sort({ date: 1 });

        const csvRows = ['Date,Habit,Category,Completed'];
        for (const log of allLogs) {
            const habit = habits.find((h) => h._id.toString() === log.habitId.toString());
            if (habit) {
                csvRows.push(`${log.date},"${habit.name}","${habit.category}",${log.completed}`);
            }
        }

        const csv = csvRows.join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=habits-export.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
