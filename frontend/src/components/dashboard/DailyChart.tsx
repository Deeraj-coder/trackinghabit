import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DailyChartProps {
    data: { date: string; completed: number; total: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="tooltip-custom">
            <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
            <div className="flex items-center gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <span className="text-muted-foreground">Completed:</span>
                <span className="text-foreground font-medium">{payload[0]?.value || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6] opacity-50" />
                <span className="text-muted-foreground">Total:</span>
                <span className="text-foreground font-medium">{payload[1]?.value || 0}</span>
            </div>
        </div>
    );
};

export default function DailyChart({ data }: DailyChartProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full h-72"
        >
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 8 }}>
                    <defs>
                        <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.12} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="rgba(255,255,255,0.025)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#7b8fa7', fontSize: 10, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                    />
                    <YAxis
                        tick={{ fill: '#7b8fa7', fontSize: 10, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        dx={-4}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)' }} />
                    <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#fillCompleted)"
                        name="Completed"
                        dot={false}
                        activeDot={{
                            r: 5,
                            fill: '#3b82f6',
                            stroke: '#0d1117',
                            strokeWidth: 3,
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#8b5cf6"
                        strokeWidth={1.5}
                        strokeDasharray="6 4"
                        fillOpacity={1}
                        fill="url(#fillTotal)"
                        name="Total"
                        dot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
