import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { Gender, SocioeconomicStatus } from '../../types';
import { User, Activity, FileText, ChevronRight, Upload, Stethoscope, HeartHandshake } from 'lucide-react';
import { cn } from '../../lib/utils';

const MOCK_CASES = [
    { label: 'Case 1: Low Risk, Healthy', data: { age: 35, gender: Gender.FEMALE, ses: SocioeconomicStatus.HIGH, symptoms: 'None, routine checkup.', heartRate: 72, bloodPressure: '118/75', bmi: 22.5, history: 'None.' } },
    { label: 'Case 2: High Risk, Chest Pain', data: { age: 62, gender: Gender.MALE, ses: SocioeconomicStatus.MEDIUM, symptoms: 'Severe chest pain radiating to left arm, sweating.', heartRate: 98, bloodPressure: '155/95', bmi: 29.0, history: 'Hypertension, Smoker (20 years).' } },
    { label: 'Case 3: Borderline, Fatigue', data: { age: 45, gender: Gender.FEMALE, ses: SocioeconomicStatus.LOW, symptoms: 'Chronic fatigue, occasional palpitations.', heartRate: 82, bloodPressure: '130/85', bmi: 26.5, history: 'Mild anemia, family history of CVD.' } },
    { label: 'Case 4: Elderly, Dyspnea', data: { age: 78, gender: Gender.MALE, ses: SocioeconomicStatus.LOW, symptoms: 'Shortness of breath on exertion, swelling in ankles.', heartRate: 90, bloodPressure: '140/90', bmi: 24.0, history: 'COPD, previous TIA.' } },
    { label: 'Case 5: Young, Palpitations', data: { age: 24, gender: Gender.NON_BINARY, ses: SocioeconomicStatus.MEDIUM, symptoms: 'Racing heart, anxiety.', heartRate: 110, bloodPressure: '125/80', bmi: 21.0, history: 'Generalized Anxiety Disorder.' } }
];

export const PatientForm: React.FC = () => {
    const { patientForm, updatePatientForm, runInference, isLoading } = useDashboard();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'doctor'; // 'doctor' or 'patient'
    const [selectedCase, setSelectedCase] = useState<string>('');

    // Helper for handling numeric vs string inputs generically
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            updatePatientForm({ [name]: value === '' ? 0 : parseFloat(value) });
        } else {
            updatePatientForm({ [name]: value });
        }
    };

    const loadMockCase = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index = parseInt(e.target.value);
        if (!isNaN(index)) {
            setSelectedCase(e.target.value);
            updatePatientForm(MOCK_CASES[index].data);
        } else {
            setSelectedCase('');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updatePatientForm({ image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="font-bold text-slate-800">
                        {role === 'patient' ? "Your Health Info" : "Patient Intake"}
                    </h3>
                </div>
                <select
                    className="text-xs border-none bg-transparent text-slate-500 font-medium focus:ring-0 cursor-pointer hover:text-teal-600"
                    value={selectedCase}
                    onChange={loadMockCase}
                >
                    <option value="">Load Example Case...</option>
                    {MOCK_CASES.map((c, i) => (
                        <option key={i} value={i}>{c.label}</option>
                    ))}
                </select>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {/* Demographics Section - Doctor Only */}
                {role === 'doctor' && (
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
                        <div className="h-px bg-slate-100"></div>
                    </div>
                )}

                {/* Vitals Section - Doctor Only */}
                {role === 'doctor' && (
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
                        <div className="h-px bg-slate-100"></div>
                    </div>
                )}

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
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Relevant Image (Optional)</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="flex items-center gap-2 w-full px-3 py-2 bg-slate-50 border border-slate-200 border-dashed rounded-lg text-sm text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                                <Upload className="w-4 h-4" />
                                <span className="truncate">{patientForm.image ? "Image Attached" : "Upload Scan/Symptom Image..."}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
                {(role === 'doctor' || !role) && (
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => runInference('doctor')}
                        disabled={isLoading}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white shadow-lg shadow-teal-600/20 transition-all",
                            isLoading
                                ? "bg-slate-300 cursor-not-allowed"
                                : "bg-teal-600 hover:bg-teal-700"
                        )}
                    >
                        {isLoading ? (
                            <Activity className="w-5 h-5 animate-spin" />
                        ) : (
                            <Stethoscope className="w-5 h-5" />
                        )}
                        <span>Clinical Analysis (Doctor)</span>
                    </motion.button>
                )}

                {(role === 'patient' || !role) && (
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => runInference('patient')}
                        disabled={isLoading}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all",
                            role === 'patient'
                                ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700"
                                : "text-teal-700 bg-teal-50 border border-teal-200 shadow-sm hover:bg-teal-100",
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                        )}
                    >
                        <HeartHandshake className="w-5 h-5" />
                        <span>Patient Explanation</span>
                    </motion.button>
                )}
            </div>
        </div>
    );
};
