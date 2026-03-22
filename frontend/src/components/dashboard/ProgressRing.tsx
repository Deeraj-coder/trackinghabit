import { motion } from 'framer-motion';

interface ProgressRingProps {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
    color: string;
    label: string;
    sublabel?: string;
}

export default function ProgressRing({
    value,
    max,
    size = 110,
    strokeWidth = 7,
    color,
    label,
    sublabel,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = Math.min(value / max, 1);
    const offset = circumference - percentage * circumference;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Subtle outer glow */}
                <div
                    className="absolute inset-0 rounded-full opacity-30 blur-2xl transition-all duration-500"
                    style={{ background: color }}
                />
                <svg width={size} height={size} className="-rotate-90">
                    {/* Background track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress arc */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={`url(#gradient-${label})`}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
                    />
                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={color} stopOpacity={1} />
                        </linearGradient>
                    </defs>
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="text-2xl font-black tracking-tighter drop-shadow-lg"
                        style={{ color }}
                    >
                        {Math.round(percentage * 100)}%
                    </motion.span>
                </div>
            </div>
            <div className="text-center">
                <div className="text-xs font-semibold text-foreground tracking-wide">{label}</div>
                {sublabel && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</div>
                )}
            </div>
        </div>
    );
}
