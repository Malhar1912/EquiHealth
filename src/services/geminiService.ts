
import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, PredictionResult, Gender, SocioeconomicStatus, SubgroupMetric, AuditLogEntry } from "../types";

// Helper to getting the AI client lazily
const getAI = () => {
  const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is not set. Using Mock Data mode.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// --- MOCK DATA GENERATORS ---
const getMockPrediction = (patient: PatientData): PredictionResult => ({
  riskScore: patient.age > 60 ? 0.78 : 0.32,
  uncertainty: 0.12,
  confidenceInterval: [0.25, 0.39],
  explanation: "Based on the patient's age and reported symptoms, the model predicts a moderate risk. The uncertainty is low due to consistent vitals.",
  featureImportance: [
    { feature: "Age", impact: 0.4 },
    { feature: "Blood Pressure", impact: 0.3 },
    { feature: "Symptom: Chest Pain", impact: 0.2 }
  ],
  biasAudit: {
    demographicAlert: false,
    reasoning: "No significant performance disparity detected for this demographic group in the training set."
  },
  status: 'ACCEPTED'
});

const getMockFairnessMetrics = (): SubgroupMetric[] => [
  { group: 'Female', ece: 0.03, auc: 0.92, gap: 0.01 },
  { group: 'Male', ece: 0.02, auc: 0.94, gap: 0.00 },
  { group: 'Low SES', ece: 0.045, auc: 0.89, gap: 0.025 },
  { group: 'High SES', ece: 0.02, auc: 0.95, gap: 0.00 }
];

const getMockStats = (): any[] => [
  { label: 'Overall AUC', value: '0.94', change: '+2.1%', color: 'blue' },
  { label: 'Avg Calibration Error', value: '0.042', change: '-12%', color: 'green' },
  { label: 'Subgroup Parity Gap', value: '0.015', change: 'Stable', color: 'purple' },
  { label: 'Deferral Rate', value: '8.4%', change: '+0.5%', color: 'amber' }
];

const getMockLogs = (): AuditLogEntry[] => [
  { id: '1', timestamp: '2024-05-20 14:32', patientSummary: '62M, High SES, Chest Pain', risk: 0.78, uncertainty: 0.12, outcome: 'ACCEPTED', biasDetected: false },
  { id: '2', timestamp: '2024-05-20 14:15', patientSummary: '45F, Low SES, Fatigue', risk: 0.45, uncertainty: 0.68, outcome: 'DEFERRED', biasDetected: true },
  { id: '3', timestamp: '2024-05-20 13:50', patientSummary: '71M, Low SES, Dyspnea', risk: 0.82, uncertainty: 0.15, outcome: 'ACCEPTED', biasDetected: false },
  { id: '4', timestamp: '2024-05-20 12:30', patientSummary: '33F, High SES, Palpitations', risk: 0.12, uncertainty: 0.05, outcome: 'ACCEPTED', biasDetected: false },
];


export const analyzeClinicalCase = async (patient: PatientData): Promise<PredictionResult> => {
  const ai = getAI();
  if (!ai) return new Promise(resolve => setTimeout(() => resolve(getMockPrediction(patient)), 1500));

  // Simulate Quasi-Probabilistic Inference using Gemini as the reasoning engine
  const prompt = `
    Analyze this clinical case for potential cardiovascular risk.
    Patient: Age ${patient.age}, Gender ${patient.gender}, Socioeconomic Status: ${patient.ses}.
    Symptoms: ${patient.symptoms}
    Vitals: HR ${patient.heartRate}, BP ${patient.bloodPressure}, BMI ${patient.bmi}
    History: ${patient.history}

    Your goal is to act as a Fairness-Aware Quasi-Probabilistic Neural Network.
    1. Estimate risk P(y|x) from 0 to 1.
    2. Estimate epistemic uncertainty U(x) from 0 to 1.
       - Increase uncertainty if the demographic (Gender/SES) is often underrepresented in training data.
       - Increase uncertainty if symptoms are vague.
    3. Generate SHAP-like feature importance.
    4. Provide a bias audit explanation.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskScore: { type: Type.NUMBER },
          uncertainty: { type: Type.NUMBER },
          confidenceInterval: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER }
          },
          explanation: { type: Type.STRING },
          featureImportance: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                feature: { type: Type.STRING },
                impact: { type: Type.NUMBER }
              },
              required: ["feature", "impact"]
            }
          },
          biasAudit: {
            type: Type.OBJECT,
            properties: {
              demographicAlert: { type: Type.BOOLEAN },
              reasoning: { type: Type.STRING }
            },
            required: ["demographicAlert", "reasoning"]
          }
        },
        required: ["riskScore", "uncertainty", "confidenceInterval", "explanation", "featureImportance", "biasAudit"]
      }
    }
  });

  // Access the text property directly (it's a getter, not a method)
  const rawJson = JSON.parse(response.text || "{}");

  // Decision-theoretic gating layer
  const status = (rawJson.uncertainty > 0.65 || rawJson.biasAudit.demographicAlert) ? 'DEFERRED' : 'ACCEPTED';

  return {
    ...rawJson,
    status
  };
};

export const getFairnessMetrics = async (): Promise<SubgroupMetric[]> => {
  const ai = getAI();
  if (!ai) return new Promise(resolve => setTimeout(() => resolve(getMockFairnessMetrics()), 1000));

  const prompt = `
    Generate realistic fairness metrics for a healthcare AI model.
    Return a JSON array of objects with the following structure:
    { group: string, ece: number, auc: number, gap: number }
    Groups should be: 'Female', 'Male', 'Low SES', 'High SES', 'Elderly', 'Young'.
    Ensure ECE (Expected Calibration Error) varies to show some bias (e.g., higher for Low SES).
    AUC should be high (0.8-0.98).
    Gap should be small but noticeable.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            group: { type: Type.STRING },
            ece: { type: Type.NUMBER },
            auc: { type: Type.NUMBER },
            gap: { type: Type.NUMBER }
          },
          required: ["group", "ece", "auc", "gap"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const getDashboardStats = async (): Promise<any[]> => {
  const ai = getAI();
  if (!ai) return new Promise(resolve => setTimeout(() => resolve(getMockStats()), 800));

  const prompt = `
    Generate 4 key performance indicators for a healthcare AI dashboard.
    Return a JSON array of 4 objects with:
    { label: string, value: string, change: string, color: string }
    
    1. Label: 'Overall AUC', Value: ~0.94, Change: small positive, Color: 'blue'
    2. Label: 'Avg Calibration Error', Value: ~0.042, Change: negative (improvement), Color: 'green'
    3. Label: 'Subgroup Parity Gap', Value: ~0.015, Change: 'Stable' or small change, Color: 'purple'
    4. Label: 'Deferral Rate', Value: ~8-9%, Change: small positive, Color: 'amber'
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            value: { type: Type.STRING },
            change: { type: Type.STRING },
            color: { type: Type.STRING }
          },
          required: ["label", "value", "change", "color"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const getAuditLogs = async (): Promise<AuditLogEntry[]> => {
  const ai = getAI();
  if (!ai) return new Promise(resolve => setTimeout(() => resolve(getMockLogs()), 1200));

  const prompt = `
    Generate 5 realistic audit logs for a clinical decision support system.
    Return a JSON array of objects.
    Properties:
    - id: string (random)
    - timestamp: string (recent dates like "2024-05-20 14:32")
    - patientSummary: string (e.g., "62M, High SES, Chest Pain")
    - risk: number (0-1)
    - uncertainty: number (0-1)
    - outcome: 'ACCEPTED' or 'DEFERRED'
    - biasDetected: boolean (true if uncertainty is high or risk is borderline for vulnerable groups)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            timestamp: { type: Type.STRING },
            patientSummary: { type: Type.STRING },
            risk: { type: Type.NUMBER },
            uncertainty: { type: Type.NUMBER },
            outcome: { type: Type.STRING, enum: ['ACCEPTED', 'DEFERRED'] },
            biasDetected: { type: Type.BOOLEAN }
          },
          required: ["id", "timestamp", "patientSummary", "risk", "uncertainty", "outcome", "biasDetected"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};
