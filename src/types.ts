
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  NON_BINARY = 'Non-Binary',
  OTHER = 'Other'
}

export enum SocioeconomicStatus {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface PatientData {
  age: number;
  gender: Gender;
  ses: SocioeconomicStatus;
  symptoms: string;
  heartRate: number;
  bloodPressure: string;
  bmi: number;
  history: string;
  image?: string; // Base64 encoded image
}

export interface PredictionResult {
  riskScore: number; // P(y|x)
  uncertainty: number; // U(x)
  confidenceInterval: [number, number];
  status: 'ACCEPTED' | 'DEFERRED';
  explanation: string;
  featureImportance: { feature: string; impact: number }[];
  biasAudit: {
    demographicAlert: boolean;
    reasoning: string;
  };
}

export interface SubgroupMetric {
  group: string;
  ece: number; // Expected Calibration Error
  auc: number;
  gap: number; // Calibration Gap
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  patientSummary: string;
  risk: number;
  uncertainty: number;
  outcome: 'ACCEPTED' | 'DEFERRED';
  biasDetected: boolean;
}

export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  color: 'blue' | 'green' | 'purple' | 'amber';
}
