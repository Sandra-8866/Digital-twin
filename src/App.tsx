import { useEffect } from 'react';
import { useGovernanceStore } from './store/governanceStore';
import ThreeHeroCanvas from './components/ThreeHeroCanvas';
import HierarchyPage from './components/HierarchyPage';
import { ArrowRight } from 'lucide-react';
import './App.css';

function App() {
  const {
    initStore,
    loading,
    error,
    viewMode,
    setViewMode,
    currentRegion,
    nodes,
    services,
    workflows,
    documents,
    logs
  } = useGovernanceStore();

  // Load governance datasets on initial mount
  useEffect(() => {
    initStore();
  }, [initStore]);

  // 1. Loading Screen
  if (loading && viewMode === 'hero') {
    return (
      <div className="w-screen h-screen bg-slate-50 flex flex-col justify-center items-center font-sans select-none">
        <div className="bg-white p-8 border border-slate-200 rounded-2xl flex flex-col items-center gap-6 max-w-sm w-full shadow-xs">
          <div className="w-10 h-10 rounded-full border-2 border-slate-100 border-t-indigo-600 animate-spin"></div>
          <div className="text-center">
            <h2 className="text-sm font-bold text-slate-800 tracking-wider uppercase">Loading Twin Environment</h2>
            <p className="text-xs text-slate-400 mt-1">Reading CSV datasets...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error Screen
  if (error) {
    return (
      <div className="w-screen h-screen bg-slate-50 flex flex-col justify-center items-center font-sans p-4 select-none">
        <div className="bg-white p-6 border border-slate-200 rounded-2xl flex flex-col items-center gap-4 max-w-sm w-full text-center shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">Database Sync Failed</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          <button
            onClick={() => initStore()}
            className="cursor-pointer px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition rounded-lg"
          >
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  // 3. Landing Hero Page (Government-style Welcome Gateway)
  if (viewMode === 'hero') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none relative overflow-hidden tech-grid-light">
        {/* Glow Overlays */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] glow-overlay-saffron-light pointer-events-none rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] glow-overlay-green-light pointer-events-none rounded-full blur-3xl"></div>
        <div className="absolute top-[30%] left-[25%] w-[40%] h-[40%] glow-overlay-indigo-light pointer-events-none rounded-full blur-3xl"></div>

        {/* Tricolor Flag Ribbon */}
        <div className="gov-ribbon sticky top-0 z-30"></div>

        {/* Premium Light Glass Header */}
        <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center border-b border-slate-200/50 bg-white/70 backdrop-blur-md sticky top-[4px] z-20">
          <div className="flex items-center gap-3">
            {/* Logo with Ashoka Chakra subtle SVG */}
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" className="stroke-slate-300" />
                <circle cx="12" cy="12" r="3" className="stroke-amber-500 animate-spin" style={{ animationDuration: '40s' }} />
                <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4L18.4 5.6" className="stroke-emerald-600" />
              </svg>
            </div>
            <div>
              <span className="font-heading text-sm font-extrabold tracking-tight text-slate-900 block">National Portal of India</span>
              <span className="text-[9px] text-amber-600 font-bold uppercase tracking-widest block leading-none">e-Governance Digital Twin Gateway</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border border-slate-200 rounded-lg px-2.5 py-1 bg-white/60 hidden sm:block">
              Government of India
            </span>
          </div>
        </header>

        {/* Main Hero Container */}
        <main className="flex-grow flex flex-col lg:flex-row items-center justify-between px-6 md:px-16 max-w-7xl mx-auto w-full gap-10 py-10 z-10">
          {/* Left Column: Title, Description, Stats Grid, Action Button */}
          <div className="flex-grow flex-1 max-w-xl text-left flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center gap-2 text-[10px] font-extrabold text-amber-700 uppercase tracking-widest bg-amber-50 border border-amber-200/50 px-3 py-1.5 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              e-Governance Spatial Twin Environment
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
              Visualizing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-slate-800 to-emerald-600">Administrative Fabric</span> of India
            </h1>
            
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
              Explore the digital twin directory of the Indian administration. Wireframed directly from CSV datasets, it visually maps states, union territories, departments, citizen services, documents, workflows, and officers in a highly interactive 3D spatial node network.
            </p>

            {/* Dynamic Telemetry Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel-light glass-panel-light-hover p-4 rounded-2xl transition duration-300">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1.5">
                  <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                  Administrative Nodes
                </div>
                <div className="text-2xl font-black text-slate-900">{nodes.length}</div>
                <div className="text-[10px] text-slate-500 mt-1">Hierarchies & offices mapped</div>
              </div>

              <div className="glass-panel-light glass-panel-light-hover p-4 rounded-2xl transition duration-300">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1.5">
                  <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                  Citizen Services
                </div>
                <div className="text-2xl font-black text-slate-900">{services.length}</div>
                <div className="text-[10px] text-slate-500 mt-1">Simulated workflows & rules</div>
              </div>

              <div className="glass-panel-light glass-panel-light-hover p-4 rounded-2xl transition duration-300">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                  Workflow Actions
                </div>
                <div className="text-2xl font-black text-slate-900">{workflows.length}</div>
                <div className="text-[10px] text-slate-500 mt-1">Simulated step-by-step tracks</div>
              </div>

              <div className="glass-panel-light glass-panel-light-hover p-4 rounded-2xl transition duration-300">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#ff9933]"></span>
                  Requirements Mapped
                </div>
                <div className="text-2xl font-black text-slate-900">{documents.length}</div>
                <div className="text-[10px] text-slate-500 mt-1">Document types & verifications</div>
              </div>
            </div>

            {/* CTA and Quick Links */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2">
              <button
                onClick={() => {
                  setViewMode('dashboard');
                  if (currentRegion !== 'india') {
                    useGovernanceStore.setState({ currentRegion: 'india', selectedNodeId: 'INDIA_ROOT', selectedServiceId: null });
                  } else {
                    useGovernanceStore.setState({ selectedNodeId: 'INDIA_ROOT', selectedServiceId: null });
                  }
                }}
                className="cursor-pointer bg-[#0f2942] text-white font-extrabold text-xs px-6 py-4 rounded-xl shadow-lg hover:bg-[#153a5c] shadow-slate-900/10 transition duration-200 uppercase tracking-wider flex items-center justify-center gap-2 group"
              >
                Initialize Directory Control Room
                <ArrowRight className="w-4 h-4 transition duration-200 group-hover:translate-x-1" />
              </button>

              {/* Direct Workspace Quick Links */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Quick-start:</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      useGovernanceStore.setState({ currentRegion: 'Kerala', selectedNodeId: 'KER001', selectedServiceId: null, viewMode: 'dashboard' });
                    }}
                    className="cursor-pointer text-[10px] bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-xs px-2.5 py-1.5 rounded-lg transition"
                  >
                    Kerala
                  </button>
                  <button 
                    onClick={() => {
                      useGovernanceStore.setState({ currentRegion: 'Andaman & Nicobar Islands', selectedNodeId: 'IND_ANI_001', selectedServiceId: null, viewMode: 'dashboard' });
                    }}
                    className="cursor-pointer text-[10px] bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-xs px-2.5 py-1.5 rounded-lg transition"
                  >
                    Andaman
                  </button>
                  <button 
                    onClick={() => {
                      useGovernanceStore.setState({ currentRegion: 'lakshadweep', selectedNodeId: 'IND_LKD_001', selectedServiceId: null, viewMode: 'dashboard' });
                    }}
                    className="cursor-pointer text-[10px] bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-xs px-2.5 py-1.5 rounded-lg transition"
                  >
                    Lakshadweep
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Canvas in a Professional Control Panel Wrapper */}
          <div className="flex-grow flex-1 w-full max-w-lg relative rounded-3xl overflow-hidden glass-panel-light border border-slate-200 shadow-xl p-2 aspect-[4/3] min-h-[380px] lg:min-h-[420px] flex flex-col">
            {/* Control Panel Header Bar */}
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200/50 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Digital Twin: 3D Topology
              </div>
              <div>ORBIT_CAM: ACTIVE</div>
            </div>
            
            {/* The 3D Scene */}
            <div className="flex-1 w-full relative pointer-events-auto bg-slate-50/50">
              <ThreeHeroCanvas />
              
              {/* Instructions Overlay */}
              <div className="absolute bottom-4 left-4 right-4 pointer-events-none bg-white/95 border border-slate-200/80 shadow-md p-2.5 rounded-xl text-[9px] text-slate-500 leading-tight">
                <span className="font-bold text-slate-900 block mb-0.5">SPATIAL MAP CONTROLS</span>
                Click and drag to rotate the digital twin universe. Click a region sphere to load its administrative structure.
              </div>
            </div>
          </div>
        </main>

        {/* Real-time Telemetry Log Ticker */}
        <div className="w-full bg-[#f1f5f9] border-t border-slate-200/60 px-6 md:px-12 py-2.5 flex items-center justify-between text-[10px] font-mono text-emerald-700 overflow-hidden relative">
          <div className="flex items-center gap-2 shrink-0 border-r border-slate-200/50 pr-4 mr-4 font-bold text-slate-500 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Telemetry
          </div>
          <div className="flex-1 flex gap-6 overflow-x-auto no-scrollbar py-0.5">
            {logs.slice(0, 3).map((log) => (
              <span key={log.id} className="inline-flex items-center gap-1.5 text-emerald-700 shrink-0">
                <span className="text-[8.5px] text-slate-400">[{log.timestamp}]</span>
                <span className={log.type === 'success' ? 'text-emerald-700 font-bold' : log.type === 'warning' ? 'text-amber-700 font-bold' : 'text-slate-600'}>
                  {log.message}
                </span>
              </span>
            ))}
          </div>
          <div className="shrink-0 text-slate-400 pl-4 border-l border-slate-200/50 text-[9px] hidden sm:block">
            REFRESH: LIVE
          </div>
        </div>

        {/* Global Footer */}
        <footer className="w-full py-3.5 text-center text-[10px] text-slate-400 border-t border-slate-200/50 bg-[#f8fafc] font-semibold tracking-wide">
          Digital Twin of Indian Governance &bull; Federal Repository Synchronization
        </footer>
      </div>
    );
  }

  // 4. Unified Dashboard Layout Mode
  return (
    <HierarchyPage />
  );
}

export default App;
