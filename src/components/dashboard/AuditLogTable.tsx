import React from 'react';
import { ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AuditLogEntry } from '../../types';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface AuditLogTableProps {
    logs: AuditLogEntry[];
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {['Timestamp', 'Patient Summary', 'Risk P(y|x)', 'Uncertainty U(x)', 'Outcome', 'Bias Audit', 'Action'].map((h) => (
                                <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.map((log, i) => (
                            <motion.tr
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="hover:bg-slate-50 transition-colors"
                            >
                                <td className="px-6 py-4 text-sm text-slate-600">{log.timestamp}</td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-slate-800">{log.patientSummary}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600" style={{ width: `${log.risk * 100}%` }} />
                                        </div>
                                        <span className="text-xs font-mono">{(log.risk * 100).toFixed(0)}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500" style={{ width: `${log.uncertainty * 100}%` }} />
                                        </div>
                                        <span className="text-xs font-mono">{(log.uncertainty * 100).toFixed(0)}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter border",
                                        log.outcome === 'ACCEPTED'
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            : "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {log.outcome}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {log.biasDetected ? (
                                        <div className="flex items-center gap-1.5 text-rose-600">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase">Alert</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter">Clear</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-blue-600 p-1 transition-colors">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
