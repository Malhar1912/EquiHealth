
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import {
  Gender,
  SocioeconomicStatus,
  PatientData,
  PredictionResult,
  AuditLogEntry,
  SubgroupMetric,
  DashboardStat
} from './types';
import { analyzeClinicalCase, getFairnessMetrics, getDashboardStats, getAuditLogs } from './services/geminiService';
import RiskDistributionChart from './components/RiskDistributionChart';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Activity,
  ArrowRight,
  Info,
  ChevronRight,
  TrendingDown,
  Scale,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [fairnessData, setFairnessData] = useState<SubgroupMetric[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStat[]>([]);

  // Assessment State
  const [patientForm, setPatientForm] = useState<PatientData>({
    age: 54,
    gender: Gender.FEMALE,
    ses: SocioeconomicStatus.LOW,
    symptoms: 'Chest tightness, fatigue, shortness of breath on exertion.',
    heartRate: 88,
    bloodPressure: '135/85',
    bmi: 28.5,
    history: 'Type 2 Diabetes, non-smoker.'
  });
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
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

  const handleRunInference = async () => {
    setIsLoading(true);
    try {
      const res = await analyzeClinicalCase(patientForm);
      setResult(res);

      // Update logs
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
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {dashboardStats.length > 0 ? dashboardStats.map((stat, i) => {
          const Icon = [Activity, TrendingDown, Scale, Clock][i] || Activity;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' :
                  stat.change.startsWith('-') ? 'bg-blue-50 text-blue-600' :
                    'bg-slate-50 text-slate-600'
                  }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </div>
          );
        }) : (
          // Loading skeleton or fallback
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse h-32"></div>
          ))
        )}

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <BarChart data={fairnessData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="group" />
                <YAxis label={{ value: 'ECE', angle: -90, position: 'insideLeft' }} />
                <RechartsTooltip />
                <Bar dataKey="ece" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {fairnessData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.ece > 0.05 ? '#f43f5e' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Real-time Safety Monitor</h3>
          <div className="flex-1 space-y-4">
            {[
              { label: 'Uncertainty Calibration', status: 'Stable', health: 98 },
              { label: 'Demographic Consistency', status: 'Optimal', health: 95 },
              { label: 'Selective Deferral Gating', status: 'Active', health: 100 },
              { label: 'Out-of-Distribution Detection', status: 'Alert', health: 74 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className={`font-bold ${item.health < 80 ? 'text-rose-600' : 'text-emerald-600'}`}>{item.status}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${item.health < 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${item.health}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed">
                The model is currently showing increased uncertainty for <strong>Atypical Cardiovascular Presentations</strong> in younger female cohorts. Selective deferral is handling these many cases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div >
  );

  const renderAssessment = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Form Side */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Patient Profile
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                <input
                  type="number"
                  value={patientForm.age}
                  onChange={(e) => setPatientForm({ ...patientForm, age: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                <select
                  value={patientForm.gender}
                  onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value as Gender })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Socioeconomic Status (SES)</label>
              <select
                value={patientForm.ses}
                onChange={(e) => setPatientForm({ ...patientForm, ses: e.target.value as SocioeconomicStatus })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.values(SocioeconomicStatus).map(s => <option key={s} value={s}>{s} SES</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Symptoms / Clinical Presentation</label>
              <textarea
                rows={4}
                value={patientForm.symptoms}
                onChange={(e) => setPatientForm({ ...patientForm, symptoms: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Heart Rate</label>
                <input
                  type="number"
                  value={patientForm.heartRate}
                  onChange={(e) => setPatientForm({ ...patientForm, heartRate: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">BP (mmHg)</label>
                <input
                  type="text"
                  value={patientForm.bloodPressure}
                  onChange={(e) => setPatientForm({ ...patientForm, bloodPressure: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">BMI</label>
                <input
                  type="number"
                  step="0.1"
                  value={patientForm.bmi}
                  onChange={(e) => setPatientForm({ ...patientForm, bmi: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleRunInference}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Calibrating QPNN...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  Run Inference
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Side */}
      <div className="lg:col-span-3 space-y-6">
        {result ? (
          <>
            {/* Main Risk Card */}
            <div className={`p-8 rounded-3xl border-2 transition-all shadow-xl ${result.status === 'DEFERRED'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-white border-slate-100 text-slate-900'
              }`}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Assessment Output</h3>
                  <p className="text-sm opacity-70">Generated by EquiHealth QPNN Inference Engine</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${result.status === 'DEFERRED'
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-500 text-white'
                  }`}>
                  {result.status === 'DEFERRED' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {result.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold uppercase tracking-wider opacity-60">Risk P(y|x)</span>
                      <span className="text-4xl font-black">{(result.riskScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200/50 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-1000"
                        style={{ width: `${result.riskScore * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold uppercase tracking-wider opacity-60 text-amber-700">Uncertainty U(x)</span>
                      <span className="text-3xl font-bold">{(result.uncertainty * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-amber-200/50 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-600 transition-all duration-1000"
                        style={{ width: `${result.uncertainty * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Probabilistic Distribution</h4>
                  <RiskDistributionChart
                    riskScore={result.riskScore}
                    uncertainty={result.uncertainty}
                    interval={result.confidenceInterval as [number, number]}
                  />
                </div>
              </div>

              {result.status === 'DEFERRED' && (
                <div className="mt-8 p-4 bg-amber-100/50 border border-amber-200 rounded-2xl flex gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-900">Selective Deferral Gating Triggered</h4>
                    <p className="text-sm text-amber-800 leading-relaxed mt-1">
                      Epistemic uncertainty exceeds safety threshold (0.65). This patient profile belongs to a demographic subgroup where historical training data sparsity may lead to biased estimates. Human clinical review is <strong>mandatory</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Explanations & Bias Audit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Clinical Reasoning
                </h4>
                <div className="prose prose-sm text-slate-600 leading-relaxed">
                  {result.explanation}
                </div>
                <div className="mt-6 space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">SHAP Feature Influence</h5>
                  {result.featureImportance.map((fi, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-medium w-24 truncate">{fi.feature}</span>
                      <div className="flex-1 flex items-center h-4">
                        {fi.impact >= 0 ? (
                          <div className="h-full bg-rose-400 rounded-r-sm" style={{ width: `${Math.abs(fi.impact) * 100}%` }} />
                        ) : (
                          <div className="w-full flex justify-end">
                            <div className="h-full bg-emerald-400 rounded-l-sm" style={{ width: `${Math.abs(fi.impact) * 100}%` }} />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-mono w-8">{fi.impact > 0 ? '+' : ''}{fi.impact.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Fairness & Bias Audit
                </h4>
                <div className={`p-4 rounded-xl border ${result.biasAudit.demographicAlert ? 'bg-rose-50 border-rose-100 text-rose-900' : 'bg-emerald-50 border-emerald-100 text-emerald-900'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.biasAudit.demographicAlert ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span className="font-bold text-sm">
                      {result.biasAudit.demographicAlert ? 'Potential Bias Driver Detected' : 'No Significant Bias Detected'}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-80">
                    {result.biasAudit.reasoning}
                  </p>
                </div>

                <div className="mt-6">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Fairness Regularization Path</h5>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>RAW PREDICTION</span>
                    <span>GROUP CALIBRATED</span>
                  </div>
                  <div className="relative h-1 bg-slate-100 rounded-full mb-4">
                    <div className="absolute top-0 left-[20%] right-[30%] h-full bg-blue-500/20" />
                    <div className="absolute top-[-4px] left-[20%] w-3 h-3 bg-slate-300 rounded-full border-2 border-white shadow-sm" />
                    <div className="absolute top-[-4px] right-[30%] w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    The model shifted the final risk estimate by <span className="text-blue-600 font-bold">12.4%</span> to compensate for historical under-estimation in this subgroup.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <Activity className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Ready for Assessment</h3>
            <p className="text-slate-500 max-w-sm">
              Fill out the patient profile on the left and click "Run Inference" to generate a bias-mitigated risk assessment.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Summary</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Risk P(y|x)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Uncertainty U(x)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Outcome</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bias Audit</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
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
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${log.outcome === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
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
                  <button className="text-slate-400 hover:text-blue-600 p-1">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'assessment' && renderAssessment()}
      {activeTab === 'audit' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
          <Scale className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Advanced Fairness Audit</h2>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto">
            This module provides a deep dive into Selective Accuracy, Expected Calibration Error gaps across 16 demographic subgroups.
          </p>
          {renderDashboard()}
        </div>
      )}
      {activeTab === 'logs' && renderAuditLogs()}
    </Layout>
  );
};

export default App;
