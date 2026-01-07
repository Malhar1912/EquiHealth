import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { SubgroupMetric } from '../../types';

interface FairnessChartsProps {
    data: SubgroupMetric[];
}

export const FairnessCharts: React.FC<FairnessChartsProps> = ({ data }) => {
    return (
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Calibration Error by Subgroup</h3>
                    <p className="text-sm text-slate-500">Lower is better. Gap indicates potential bias.</p>
                </div>
                <button className="text-blue-600 text-sm font-semibold hover:underline">View Audit Details</button>
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="group" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis
                            label={{ value: 'ECE', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="ece" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.ece > 0.05 ? '#f43f5e' : '#3b82f6'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
