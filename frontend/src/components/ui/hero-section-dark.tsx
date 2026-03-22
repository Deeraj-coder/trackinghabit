import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
    title: string;
    subtitle: {
        regular: string;
        gradient: string;
    };
    description: string;
    ctaText: string;
    onCtaClick?: () => void;
    backgroundImage?: string;
}

export function HeroSectionDark({
    title,
    subtitle,
    description,
    ctaText,
    onCtaClick,
    backgroundImage,
}: HeroSectionProps) {
    return (
        <div className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-background">
                {backgroundImage && (
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                )}
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />
                {/* Gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-neon-purple/20 rounded-full blur-[120px] mix-blend-screen opacity-40 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border glass mb-8"
                >
                    <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                    <span className="text-sm text-muted-foreground">{title}</span>
                </motion.div>

                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
                >
                    <span className="text-foreground">{subtitle.regular} </span>
                    <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green bg-clip-text text-transparent">
                        {subtitle.gradient}
                    </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
                >
                    {description}
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <Button
                        size="lg"
                        variant="glow"
                        onClick={onCtaClick}
                        className="text-base font-semibold group"
                    >
                        {ctaText}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </motion.div>

                {/* Dashboard preview */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-20 relative"
                >
                    <div className="glass-card rounded-[2rem] p-2 border border-border/50 shadow-2xl overflow-hidden">
                        <div className="bg-[#090e17]/80 backdrop-blur-xl rounded-[1.5rem] p-6 md:p-10 border border-white/5 relative">
                            {/* Inner ambient glow */}
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                            
                            <div className="grid grid-cols-3 gap-6 mb-8 relative z-10">
                                {[
                                    { label: 'Daily Streak', value: '24', color: 'text-neon-green' },
                                    { label: 'Completion', value: '87%', color: 'text-neon-blue' },
                                    { label: 'Active Habits', value: '12', color: 'text-neon-purple' },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                        className="stat-card p-6 text-center shadow-lg"
                                    >
                                        <div className={`text-3xl md:text-4xl font-extrabold ${stat.color}`}>{stat.value}</div>
                                        <div className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-wider">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                            {/* Mini chart bars */}
                            <div className="flex items-end gap-1 h-24 justify-center">
                                {Array.from({ length: 30 }).map((_, i) => {
                                    const height = 20 + Math.random() * 80;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ duration: 0.5, delay: 1 + i * 0.02 }}
                                            className="w-2 rounded-full bg-gradient-to-t from-neon-blue/60 to-neon-purple/60"
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    {/* Glow behind */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-neon-green/10 rounded-3xl blur-2xl -z-10" />
                </motion.div>
            </div>
        </div>
    );
}
