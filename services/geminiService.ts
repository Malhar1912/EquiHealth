
import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, PredictionResult, Gender, SocioeconomicStatus, SubgroupMetric, AuditLogEntry } from "../types";

// Always use process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeClinicalCase = async (patient: PatientData): Promise<PredictionResult> => {
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
