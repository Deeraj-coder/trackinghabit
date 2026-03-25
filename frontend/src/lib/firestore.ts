import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    writeBatch,
    Timestamp,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Collection References ───────────────────────────────────────────
const habitsCol = collection(db, 'habits');
const habitLogsCol = collection(db, 'habitLogs');

// ─── Types ───────────────────────────────────────────────────────────
export interface FirestoreHabit {
    id: string;
    userId: string;
    name: string;
    frequency: string;
    category: string;
    createdAt: string;
}

export interface FirestoreHabitLog {
    id: string;
    habitId: string;
    date: string;
    completed: boolean;
}

export interface FirestoreHabitStats {
    habitId: string;
    name: string;
    currentStreak: number;
    longestStreak: number;
    weeklyRate: number;
    totalCompleted: number;
}

// ─── Habits CRUD ─────────────────────────────────────────────────────

export async function getHabits(userId: string): Promise<FirestoreHabit[]> {
    console.log(`[Firestore] Fetching habits for userId: ${userId}`);
    const q = query(habitsCol, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const habits = snapshot.docs.map((d) => {
        const data = d.data();
        let createdAt = new Date().toISOString();
        if (data.createdAt?.toDate) {
            createdAt = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
            createdAt = data.createdAt;
        }
        return {
            id: d.id,
            ...data,
            createdAt,
        };
    }) as FirestoreHabit[];
    
    // Sort on client side to avoid needing a Firestore composite index
    return habits.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function addHabit(userId: string, name: string, frequency: string, category: string): Promise<FirestoreHabit> {
    const docRef = await addDoc(habitsCol, {
        userId,
        name,
        frequency: frequency || 'daily',
        category: category || 'Other',
        createdAt: serverTimestamp(),
    });
    return { id: docRef.id, userId, name, frequency: frequency || 'daily', category: category || 'Other', createdAt: new Date().toISOString() };
}

export async function updateHabit(habitId: string, name: string, frequency: string, category: string): Promise<void> {
    const docRef = doc(db, 'habits', habitId);
    await updateDoc(docRef, { name, frequency, category });
}

export async function deleteHabit(habitId: string): Promise<void> {
    // Delete the habit
    await deleteDoc(doc(db, 'habits', habitId));

    // Delete all associated logs
    const logsQuery = query(habitLogsCol, where('habitId', '==', habitId));
    const logsSnap = await getDocs(logsQuery);
    const batch = writeBatch(db);
    logsSnap.docs.forEach((d) => batch.delete(d.ref));
    if (logsSnap.docs.length > 0) {
        await batch.commit();
    }
}

// ─── Habit Logs ──────────────────────────────────────────────────────

export async function getLogsForMonth(
    userId: string,
    year: number,
    month: number
): Promise<FirestoreHabitLog[]> {
    // First get the user's habit IDs
    const habits = await getHabits(userId);
    if (habits.length === 0) return [];

    const habitIds = habits.map((h) => h.id);
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    // Firestore 'in' queries support up to 30 items, batch if needed
    const allLogs: FirestoreHabitLog[] = [];
    const batchSize = 30;

    for (let i = 0; i < habitIds.length; i += batchSize) {
        const batchIds = habitIds.slice(i, i + batchSize);
        // Removed date range queries to avoid needing a composite index (habitId, date)
        const q = query(
            habitLogsCol,
            where('habitId', 'in', batchIds)
        );
        const snap = await getDocs(q);
        snap.docs.forEach((d) => {
            const log = { id: d.id, ...d.data() } as FirestoreHabitLog;
            if (log.date >= startDate && log.date <= endDate) {
                allLogs.push(log);
            }
        });
    }

    return allLogs;
}

export async function toggleHabitLog(habitId: string, date: string): Promise<{ completed: boolean }> {
    // Check if a log already exists for this habit + date
    const q = query(habitLogsCol, where('habitId', '==', habitId), where('date', '==', date));
    const snap = await getDocs(q);

    if (!snap.empty) {
        const existingDoc = snap.docs[0];
        const data = existingDoc.data();
        if (data.completed) {
            // Remove the log
            await deleteDoc(existingDoc.ref);
            return { completed: false };
        } else {
            // Mark as completed
            await updateDoc(existingDoc.ref, { completed: true });
            return { completed: true };
        }
    } else {
        // Create new completed log
        await addDoc(habitLogsCol, { habitId, date, completed: true });
        return { completed: true };
    }
}

// ─── Stats ───────────────────────────────────────────────────────────

export async function getHabitStats(userId: string): Promise<FirestoreHabitStats[]> {
    const habits = await getHabits(userId);
    if (habits.length === 0) return [];

    const habitIds = habits.map((h) => h.id);

    // Fetch all completed logs for these habits
    const allLogs: FirestoreHabitLog[] = [];
    const batchSize = 30;

    for (let i = 0; i < habitIds.length; i += batchSize) {
        const batchIds = habitIds.slice(i, i + batchSize);
        // Removed completed == true to prevent index issues. Filter in memory instead.
        const q = query(
            habitLogsCol,
            where('habitId', 'in', batchIds)
        );
        const snap = await getDocs(q);
        snap.docs.forEach((d) => {
            const data = d.data();
            if (data.completed) {
                allLogs.push({ id: d.id, ...data } as FirestoreHabitLog);
            }
        });
    }

    const today = new Date();

    return habits.map((habit) => {
        const habitLogs = allLogs
            .filter((l) => l.habitId === habit.id)
            .map((l) => l.date)
            .sort()
            .reverse();

        const logSet = new Set(habitLogs);

        // Current streak
        let currentStreak = 0;
        const checkDate = new Date(today);
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
                const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
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
            habitId: habit.id,
            name: habit.name,
            currentStreak,
            longestStreak,
            weeklyRate: Math.round(weeklyRate * 10) / 10,
            totalCompleted: habitLogs.length,
        };
    });
}

// ─── Seed Sample Data ────────────────────────────────────────────────

export async function seedSampleData(userId: string): Promise<{ habits: number; logs: number }> {
    const existing = await getHabits(userId);
    if (existing.length > 0) {
        throw new Error('You already have habits. Delete them first to seed.');
    }

    const sampleHabits = [
        { name: 'Stretch', frequency: 'daily', category: 'Fitness' },
        { name: 'Workout', frequency: 'daily', category: 'Fitness' },
        { name: 'Drink water', frequency: 'daily', category: 'Health' },
        { name: 'Study', frequency: 'daily', category: 'Learning' },
        { name: 'Read', frequency: 'daily', category: 'Learning' },
        { name: 'Meditate', frequency: 'daily', category: 'Mindfulness' },
        { name: 'Sleep early', frequency: 'daily', category: 'Health' },
        { name: 'Clean room', frequency: 'weekly', category: 'Productivity' },
    ];

    const createdHabits: FirestoreHabit[] = [];
    for (const h of sampleHabits) {
        const habit = await addHabit(userId, h.name, h.frequency, h.category);
        createdHabits.push(habit);
    }

    const today = new Date();
    let logCount = 0;
    const batch = writeBatch(db);

    for (const habit of createdHabits) {
        for (let i = 0; i < 30; i++) {
            if (Math.random() < 0.65) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const logRef = doc(habitLogsCol);
                batch.set(logRef, {
                    habitId: habit.id,
                    date: dateStr,
                    completed: true,
                });
                logCount++;
            }
        }
    }

    if (logCount > 0) {
        await batch.commit();
    }

    return { habits: createdHabits.length, logs: logCount };
}

// ─── Export CSV ──────────────────────────────────────────────────────

export async function exportHabitsCSV(userId: string): Promise<string> {
    const habits = await getHabits(userId);
    if (habits.length === 0) return 'Date,Habit,Category,Completed';

    const habitIds = habits.map((h) => h.id);
    const allLogs: FirestoreHabitLog[] = [];
    const batchSize = 30;

    for (let i = 0; i < habitIds.length; i += batchSize) {
        const batchIds = habitIds.slice(i, i + batchSize);
        const q = query(habitLogsCol, where('habitId', 'in', batchIds));
        const snap = await getDocs(q);
        snap.docs.forEach((d) => {
            allLogs.push({ id: d.id, ...d.data() } as FirestoreHabitLog);
        });
    }

    allLogs.sort((a, b) => a.date.localeCompare(b.date));

    const csvRows = ['Date,Habit,Category,Completed'];
    for (const log of allLogs) {
        const habit = habits.find((h) => h.id === log.habitId);
        if (habit) {
            csvRows.push(`${log.date},"${habit.name}","${habit.category}",${log.completed}`);
        }
    }

    return csvRows.join('\n');
}
