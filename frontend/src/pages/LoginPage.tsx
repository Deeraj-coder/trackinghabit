import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Flame, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await googleLogin();
            navigate('/dashboard');
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await signup(name, email, password);
            }
            navigate('/dashboard');
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Something went wrong. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: 'login' | 'signup') => {
        if (newMode === mode) return;
        setMode(newMode);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="login-page min-h-screen flex">
            {/* Left Branding Panel */}
            <div className="login-brand-panel hidden lg:flex flex-col justify-between relative overflow-hidden w-[45%]">
                {/* Floating orbs */}
                <div className="login-orb login-orb-1" />
                <div className="login-orb login-orb-2" />
                <div className="login-orb login-orb-3" />

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 p-12 pt-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Flame className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">Habit Tracker</span>
                    </motion.div>
                </div>

                <div className="relative z-10 p-12 pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                            Build habits that{' '}
                            <span className="gradient-text">stick.</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                            Track your progress, build streaks, and transform your daily routine with powerful analytics and a beautiful interface.
                        </p>
                    </motion.div>

                    {/* Feature pills */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-wrap gap-3 mt-10"
                    >
                        {['Streak Tracking', 'Deep Analytics', 'Beautiful UI'].map((label, i) => (
                            <span
                                key={label}
                                className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border"
                                style={{
                                    background: `rgba(99, 102, 241, ${0.08 + i * 0.04})`,
                                    borderColor: `rgba(99, 102, 241, ${0.15 + i * 0.05})`,
                                    color: 'rgba(165, 180, 252, 0.9)',
                                }}
                            >
                                {label}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
                {/* Ambient background glows */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md relative z-10"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Flame className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">Habit Tracker</span>
                    </div>

                    {/* Card */}
                    <div className="login-form-card glass-card rounded-[2rem] p-8 sm:p-10">
                        {/* Tabs */}
                        <div className="login-tabs flex mb-8 relative">
                            <button
                                onClick={() => switchMode('login')}
                                className={`login-tab flex-1 pb-3 text-sm font-semibold tracking-wide transition-colors duration-300 ${mode === 'login' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'}`}
                                id="login-tab"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => switchMode('signup')}
                                className={`login-tab flex-1 pb-3 text-sm font-semibold tracking-wide transition-colors duration-300 ${mode === 'signup' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'}`}
                                id="signup-tab"
                            >
                                Create Account
                            </button>
                            {/* Animated underline */}
                            <motion.div
                                className="login-tab-indicator"
                                layoutId="tab-indicator"
                                style={{ left: mode === 'login' ? '0%' : '50%' }}
                                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                            />
                        </div>

                        {/* Google Button */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-border bg-secondary/40 hover:bg-secondary/70 text-sm font-medium transition-all duration-200 mb-6 cursor-pointer hover:border-border/80"
                            id="google-login-btn"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div className="login-divider flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-border/60" />
                            <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">or</span>
                            <div className="flex-1 h-px bg-border/60" />
                        </div>

                        {/* Error */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, y: -8, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -8, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mb-5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
                                    id="auth-error"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence mode="wait">
                                {mode === 'signup' && (
                                    <motion.div
                                        key="name-field"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <div className="space-y-2 mb-5">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        className="h-12 rounded-xl pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full btn-primary h-12 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                                id="submit-btn"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Footer text */}
                        <p className="text-center text-xs text-muted-foreground mt-8">
                            {mode === 'login' ? (
                                <>
                                    Don't have an account?{' '}
                                    <button onClick={() => switchMode('signup')} className="text-accent hover:text-accent/80 font-semibold transition-colors cursor-pointer">
                                        Create one
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <button onClick={() => switchMode('login')} className="text-accent hover:text-accent/80 font-semibold transition-colors cursor-pointer">
                                        Sign in
                                    </button>
                                </>
                            )}
                        </p>
                    </div>

                    {/* Back to landing */}
                    <div className="text-center mt-6">
                        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
                            ← Back to home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
