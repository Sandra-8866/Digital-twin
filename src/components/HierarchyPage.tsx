import React, { useEffect } from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import Breadcrumb from './Breadcrumb';
import GovernanceTree from './GovernanceTree';
import LegendPanel from './LegendPanel';
import NodeDetailsPanel from './NodeDetailsPanel';
import ServiceDetailsPanel from './ServiceDetailsPanel';
import { 
  ArrowLeft 
} from 'lucide-react';

export const HierarchyPage: React.FC = () => {
  const setViewMode = useGovernanceStore((state) => state.setViewMode);
  const activeRegionId = useGovernanceStore((state) => state.activeRegionId);
  const selectedNodeId = useGovernanceStore((state) => state.selectedNodeId);
  const selectedServiceId = useGovernanceStore((state) => state.selectedServiceId);
  const resetToSelector = useGovernanceStore((state) => state.resetToSelector);
  const loadRegion = useGovernanceStore((state) => state.loadRegion);

  useEffect(() => {
    // Intercept legacy selectedNodeId triggers from the landing page buttons and route them
    if (selectedNodeId === 'INDIA_ROOT') {
      resetToSelector();
    } else if (selectedNodeId === 'KER001') {
      loadRegion('kerala');
    } else if (selectedNodeId === 'IND_ANI_001') {
      loadRegion('andaman');
    } else if (selectedNodeId === 'IND_LKD_001') {
      loadRegion('lakshadweep');
    }
  }, [selectedNodeId, loadRegion, resetToSelector]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none relative overflow-x-hidden tech-grid-light ashoka-watermark-bg">
      {/* Saffron-White-Green Flag Ribbon */}
      <div className="gov-ribbon sticky top-0 z-30"></div>

      {/* Premium Light Glass Header */}
      <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center border-b border-slate-200/50 bg-white/70 backdrop-blur-md sticky top-[4px] z-20">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={() => {
              if (activeRegionId !== null) {
                // If in level 2 chart, go back to selector first
                resetToSelector();
              } else {
                // Otherwise go back to landing page
                setViewMode('hero');
              }
            }}
            className="p-2 text-slate-500 hover:text-[#0f2942] hover:bg-slate-100/80 rounded-xl transition cursor-pointer"
            title={activeRegionId !== null ? "Back to Selector" : "Return to Welcome Gateway"}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            {/* Logo with Ashoka Chakra */}
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" className="stroke-slate-300" />
                <circle cx="12" cy="12" r="3" className="stroke-amber-500" />
                <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4L18.4 5.6" className="stroke-emerald-600" />
              </svg>
            </div>
            <div>
              <span className="font-heading text-sm font-extrabold tracking-tight text-slate-900 block leading-tight">
                National Portal of India
              </span>
              <span className="text-[9px] text-amber-600 font-bold uppercase tracking-widest block leading-none mt-0.5">
                e-Governance Digital Twin Gateway
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border border-slate-200 rounded-lg px-2.5 py-1 bg-white/60 hidden sm:block">
            Government of India
          </span>
        </div>
      </header>

      {/* Main Page Layout Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 md:px-12 py-8 z-10 flex flex-col gap-6">
        
        {/* Breadcrumb Path */}
        <Breadcrumb />

        {/* Tree and Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Expandable Tree Column */}
          <div className="lg:col-span-8 w-full">
            <GovernanceTree />
          </div>

          {/* Sidebar Columns (Legend & Active Item) */}
          <div className="lg:col-span-4 w-full flex flex-col gap-6">
            
            {/* Citizen Services Details & Node Panel */}
            {selectedServiceId ? (
              <ServiceDetailsPanel />
            ) : (
              <NodeDetailsPanel />
            )}

            {/* Legend Filter Panel */}
            <LegendPanel />

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[10px] text-slate-400 border-t border-slate-200/50 bg-[#f8fafc] font-semibold tracking-wide select-none">
        Digital Twin of Indian Governance &bull; Federal Repository Synchronization
      </footer>
    </div>
  );
};

export default HierarchyPage;
