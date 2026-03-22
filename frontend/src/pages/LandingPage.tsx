import { useNavigate } from 'react-router-dom';
import { HeroSectionDark } from '@/components/ui/hero-section-dark';
import { motion } from 'framer-motion';
import { Activity, BarChart3, Calendar, Flame, Target, TrendingUp } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    const features = [
        { icon: Target, title: 'Track Habits', desc: 'Monitor your daily habits with a beautiful calendar grid', color: 'text-neon-green' },
        { icon: Flame, title: 'Build Streaks', desc: 'Stay motivated with streak tracking and milestones', color: 'text-neon-yellow' },
        { icon: BarChart3, title: 'Analytics', desc: 'Deep insights into your productivity patterns', color: 'text-neon-blue' },
        { icon: Calendar, title: 'Calendar View', desc: 'GitHub-style contribution grid for habit tracking', color: 'text-neon-purple' },
        { icon: TrendingUp, title: 'Progress', desc: 'Visualize your growth with animated progress rings', color: 'text-neon-green' },
        { icon: Activity, title: 'Momentum', desc: 'Track your overall momentum and daily completion', color: 'text-neon-red' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <HeroSectionDark
                title="Ultimate Habit Tracker"
                subtitle={{
                    regular: 'Build powerful habits and',
                    gradient: 'transform your life',
                }}
                description="Track daily habits, build streaks, and improve productivity using a beautiful analytics dashboard."
                ctaText="Start Tracking"
                onCtaClick={() => navigate('/dashboard')}
                backgroundImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80"
            />

            {/* Features Section */}
            <section className="py-32 px-6 relative ambient-glow">
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
                            Everything you need to{' '}
                            <span className="gradient-text">
                                build better habits
                            </span>
                        </h2>
                        <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                            A complete productivity suite designed to help you track, analyze, and improve your daily routines with unparalleled elegance.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="glass-card rounded-[2rem] p-8 group transition-all duration-500 hover:scale-[1.02]"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ${feature.color}`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                                <p className="text-muted-foreground text-base leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl mx-auto text-center glass-card rounded-[3rem] p-16 relative overflow-hidden"
                >
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-neon-blue/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-neon-purple/20 rounded-full blur-[100px] pointer-events-none" />
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6 relative z-10 tracking-tight">Ready to transform your habits?</h2>
                    <p className="text-muted-foreground text-xl mb-10 relative z-10 font-medium">
                        Join thousands of people building better habits every day.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="relative z-10 btn-primary text-lg px-10 py-4 font-bold"
                    >
                        Get Started Free
                    </button>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-border/50 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground relative z-10 font-medium tracking-wide">
                    <span>© {new Date().getFullYear()} Ultimate Habit Tracker</span>
                    <span className="flex items-center gap-1.5">Built with <Flame className="w-4 h-4 text-neon-red" /></span>
                </div>
            </footer>
        </div>
    );
}
