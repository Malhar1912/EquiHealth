
import React from 'react';
import {
  Activity,
  ShieldCheck,
  FileText,
  BarChart3,
  Settings,
  AlertCircle,
  Stethoscope,
  ClipboardList
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<Props> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Monitor', icon: Activity },
    { id: 'assessment', label: 'Triage / Intake', icon: ClipboardList },
    { id: 'audit', label: 'Bias Audit', icon: ShieldCheck },
    { id: 'logs', label: 'Patient Logs', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Medical Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-lg shadow-slate-200/50 z-20">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2.5 rounded-xl shadow-lg shadow-teal-600/20">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">EquiHealth</h1>
              <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Clinical AI Support</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === item.id
                  ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm border border-teal-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="text-sm">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-600" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-800 mb-2">
              <AlertCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wide">System Healthy</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Calibration</span>
                <span className="text-emerald-600 font-mono font-medium">OK (0.04)</span>
              </div>
              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 w-[92%] h-full"></div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Clinical Header */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Unit: Cardiology • Shift: Day • Provider ID: <span className="font-mono text-slate-700">8829-AZ</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-800">Live Inference</span>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-700">Dr. S. Chen</div>
                <div className="text-[10px] text-slate-400 font-medium uppercase">Cardiologist</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold border-2 border-white shadow-md ring-1 ring-slate-200">
                SC
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
