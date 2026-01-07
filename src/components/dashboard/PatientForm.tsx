import React from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext';
import { Gender, SocioeconomicStatus } from '../../types';
import { User, Activity, FileText, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const PatientForm: React.FC = () => {
    const { patientForm, updatePatientForm, runInference, isLoading } = useDashboard();

    // Helper for handling numeric vs string inputs generically
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            updatePatientForm({ [name]: value === '' ? 0 : parseFloat(value) });
        } else {
            updatePatientForm({ [name]: value });
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
                <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <User className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-bold text-slate-800">Patient Intake</h3>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {/* Demographics Section */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                        Demographics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Age</label>
                            <input
                                name="age"
                                type="number"
                                value={patientForm.age || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300"
                                placeholder="e.g. 45"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Gender</label>
                            <select
                                name="gender"
                                value={patientForm.gender}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                            >
                                {Object.values(Gender).map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Socioeconomic Status</label>
                            <select
                                name="ses"
                                value={patientForm.ses}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                            >
                                {Object.values(SocioeconomicStatus).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* Vitals Section */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        Vitals & Signs
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">HR (bpm)</label>
                            <input
                                name="heartRate"
                                type="number"
                                value={patientForm.heartRate || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">BP (mmHg)</label>
                            <input
                                name="bloodPressure"
                                type="text"
                                value={patientForm.bloodPressure}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">BMI</label>
                            <input
                                name="bmi"
                                type="number"
                                step="0.1"
                                value={patientForm.bmi || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* Clinical Notes */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        Clinical Observations
                    </h4>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Symptoms</label>
                        <textarea
                            name="symptoms"
                            value={patientForm.symptoms}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none transition-all placeholder:text-slate-300"
                            placeholder="Primary and secondary complaints..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Medical History</label>
                        <textarea
                            name="history"
                            value={patientForm.history}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none transition-all placeholder:text-slate-300"
                            placeholder="Relevant history, comorbidities, medications..."
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={runInference}
                    disabled={isLoading}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white shadow-lg shadow-teal-600/20 transition-all",
                        isLoading
                            ? "bg-slate-300 cursor-not-allowed"
                            : "bg-teal-600 hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-600/30"
                    )}
                >
                    {isLoading ? (
                        <>
                            <Activity className="w-5 h-5 animate-spin" />
                            <span>Processing Case...</span>
                        </>
                    ) : (
                        <>
                            <Activity className="w-5 h-5" />
                            <span>Run Clinical Inference</span>
                            <ChevronRight className="w-4 h-4 text-teal-200" />
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
};
