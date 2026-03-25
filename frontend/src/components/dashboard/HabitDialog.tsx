import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface HabitDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: { name: string; frequency: string; category: string }) => void;
    habit?: { id: string; name: string; frequency: string; category: string } | null;
}

const CATEGORIES = ['Health', 'Fitness', 'Learning', 'Mindfulness', 'Productivity', 'Self-care', 'Other'];

export default function HabitDialog({ open, onClose, onSave, habit }: HabitDialogProps) {
    const [name, setName] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [category, setCategory] = useState('Health');

    useEffect(() => {
        if (habit) {
            setName(habit.name);
            setFrequency(habit.frequency || 'daily');
            setCategory(habit.category);
        } else {
            setName('');
            setFrequency('daily');
            setCategory('Health');
        }
    }, [habit, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({ name: name.trim(), frequency, category });
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{habit ? 'Edit Habit' : 'Add New Habit'}</DialogTitle>
                    <DialogDescription>
                        {habit ? 'Update your habit details.' : 'Create a new habit to track daily.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="habit-name">Habit Name</Label>
                        <Input
                            id="habit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Drink water, Workout"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Frequency</Label>
                        <div className="flex gap-2">
                            {['daily', 'weekly'].map((freq) => (
                                <button
                                    key={freq}
                                    type="button"
                                    onClick={() => setFrequency(freq)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all cursor-pointer flex-1 ${frequency === freq
                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                        }`}
                                >
                                    {freq}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${category === cat
                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">{habit ? 'Update' : 'Create'} Habit</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
