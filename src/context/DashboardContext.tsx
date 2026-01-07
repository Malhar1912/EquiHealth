import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    PatientData,
    PredictionResult,
    AuditLogEntry,
    SubgroupMetric,
    DashboardStat,
    Gender,
    SocioeconomicStatus
} from '../types';
import { analyzeClinicalCase, getFairnessMetrics, getDashboardStats, getAuditLogs } from '../services/geminiService';

interface DashboardState {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isLoading: boolean;
    fairnessData: SubgroupMetric[];
    auditLogs: AuditLogEntry[];
    dashboardStats: DashboardStat[];
    patientForm: PatientData;
    updatePatientForm: (data: Partial<PatientData>) => void;
    result: PredictionResult | null;
    runInference: (perspective?: 'doctor' | 'patient') => Promise<void>;
}

const DashboardContext = createContext<DashboardState | undefined>(undefined);

const INITIAL_PATIENT_FORM: PatientData = {
    age: 54,
    gender: Gender.FEMALE,
    ses: SocioeconomicStatus.LOW,
    symptoms: 'Chest tightness, fatigue, shortness of breath on exertion.',
    heartRate: 88,
    bloodPressure: '135/85',
    bmi: 28.5,
    history: 'Type 2 Diabetes, non-smoker.'
};

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'doctor';
    const [activeTab, setActiveTab] = useState(role === 'patient' ? 'assessment' : 'dashboard');
    const [isLoading, setIsLoading] = useState(false);
    const [fairnessData, setFairnessData] = useState<SubgroupMetric[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [dashboardStats, setDashboardStats] = useState<DashboardStat[]>([]);
    const [patientForm, setPatientForm] = useState<PatientData>(INITIAL_PATIENT_FORM);
    const [result, setResult] = useState<PredictionResult | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [fairness, stats, logs] = await Promise.all([
                    getFairnessMetrics(),
                    getDashboardStats(),
                    getAuditLogs()
                ]);
                setFairnessData(fairness);
                setDashboardStats(stats);
                setAuditLogs(logs);
            } catch (e) {
                console.error("Error loading dashboard data:", e);
            }
        };
        loadData();
    }, []);

    const updatePatientForm = (data: Partial<PatientData>) => {
        setPatientForm(prev => ({ ...prev, ...data }));
    };

    const runInference = async (perspective: 'doctor' | 'patient' = 'doctor') => {
        setIsLoading(true);
        try {
            const res = await analyzeClinicalCase(patientForm, perspective);
            setResult(res);

            const newEntry: AuditLogEntry = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toLocaleString(),
                patientSummary: `${patientForm.age}${patientForm.gender[0]}, ${patientForm.ses} SES`,
                risk: res.riskScore,
                uncertainty: res.uncertainty,
                outcome: res.status,
                biasDetected: res.biasAudit.demographicAlert
            };
            setAuditLogs(prev => [newEntry, ...prev]);
        } catch (error) {
            console.error("Inference error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardContext.Provider value={{
            activeTab,
            setActiveTab,
            isLoading,
            fairnessData,
            auditLogs,
            dashboardStats,
            patientForm,
            updatePatientForm,
            result,
            runInference
        }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
