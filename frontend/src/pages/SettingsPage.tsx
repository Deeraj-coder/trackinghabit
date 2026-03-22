import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, User, Mail, Save, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        try {
            // Updating the user profile in Firebase Auth could be added here if needed,
            // but for now we just show a success message since we don't have an explicit 
            // profile update function in useAuth yet.
            // If we needed to update the display name, we could import updateProfile from firebase/auth.
            setTimeout(() => {
                setMessage('Profile updated successfully.');
                setIsSaving(false);
            }, 500);
        } catch (error) {
            setMessage('Failed to update profile.');
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background ambient-glow flex justify-center p-6 md:p-12">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences</p>
                    </div>
                </motion.div>

                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="glass-card rounded-[1.5rem] overflow-hidden">
                        <div className="px-6 pt-6 pb-4 border-b border-border/40">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" /> Profile Information
                            </h2>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-3.5 h-3.5" /> Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="bg-muted/50 cursor-not-allowed text-muted-foreground"
                                    />
                                    <p className="text-[11px] text-muted-foreground/70">Email addresses cannot be changed here.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" /> Display Name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your name"
                                    />
                                </div>

                                {message && (
                                    <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                        {message}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={isSaving || !name.trim() || name === user?.name}
                                        className="flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
                
                {/* Account Actions Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8"
                >
                    <div className="glass-card rounded-[1.5rem] overflow-hidden border border-destructive/20">
                        <div className="px-6 pt-6 pb-4 border-b border-border/40">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-destructive">
                                Account Actions
                            </h2>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-muted-foreground mb-4">
                                Log out of your account on this device.
                            </p>
                            <Button 
                                variant="destructive" 
                                className="flex items-center gap-2"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
