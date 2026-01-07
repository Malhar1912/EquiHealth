import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingDown, Scale, Clock, LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DashboardStat } from '../../types';

interface StatCardProps {
    stat: DashboardStat;
    index: number;
}

const ICONS: Record<string, LucideIcon> = {
    'Activity': Activity,
    'TrendingDown': TrendingDown,
    'Scale': Scale,
    'Clock': Clock
};

export const StatCard: React.FC<StatCardProps> = ({ stat, index }) => {
    // Basic heuristic to pick an icon based on label or index if not provided in data
    // Ideally data should control the icon key.
    const Icon = ICONS[['Activity', 'TrendingDown', 'Scale', 'Clock'][index]] || Activity;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn(
                    "p-2 rounded-lg",
                    stat.color === 'blue' && "bg-blue-50 text-blue-600",
                    stat.color === 'green' && "bg-emerald-50 text-emerald-600",
                    stat.color === 'purple' && "bg-purple-50 text-purple-600",
                    stat.color === 'amber' && "bg-amber-50 text-amber-600"
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    stat.change.startsWith('+') ? "bg-emerald-50 text-emerald-600" :
                        stat.change.startsWith('-') ? "bg-blue-50 text-blue-600" :
                            "bg-slate-50 text-slate-600"
                )}>
                    {stat.change}
                </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
        </motion.div>
    );
};
