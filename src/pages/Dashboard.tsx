
import React from 'react';
import Layout from '../components/Layout';
import { useDashboard, DashboardProvider } from '../context/DashboardContext';
import { StatCard } from '../components/dashboard/StatCard';
import { FairnessCharts } from '../components/dashboard/FairnessCharts';
import { AuditLogTable } from '../components/dashboard/AuditLogTable';
import { PatientForm } from '../components/dashboard/PatientForm';
import { AssessmentResults } from '../components/dashboard/AssessmentResults';
import { Info, Scale, Activity } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    dashboardStats,
    fairnessData,
    auditLogs
  } = useDashboard();

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.length > 0 ? (
          dashboardStats.map((stat, i) => <StatCard key={i} stat={stat} index={i} />)
        ) : (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse h-32"></div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FairnessCharts data={fairnessData} />

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
    </div>
  );

  const renderAssessment = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2">
        <PatientForm />
      </div>
      <div className="lg:col-span-3">
        <AssessmentResults />
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
      {activeTab === 'logs' && <AuditLogTable logs={auditLogs} />}
    </Layout>
  );
};

// Wrap with Provider
const Dashboard: React.FC = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default Dashboard;
