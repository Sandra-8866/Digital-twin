import React, { useEffect } from 'react';
import { useGovernanceStore, findHierarchicalPath } from '../store/governanceStore';
import Breadcrumb from './Breadcrumb';
import GovernanceTree from './GovernanceTree';
import LegendPanel from './LegendPanel';
import { 
  ArrowLeft, 
  Flag, 
  Globe, 
  Shield, 
  Landmark, 
  Layers, 
  LandmarkIcon, 
  Briefcase, 
  Scale, 
  Award, 
  HelpCircle 
} from 'lucide-react';

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'flag':
      return <Flag className="w-5 h-5 text-orange-600" />;
    case 'globe':
      return <Globe className="w-5 h-5 text-emerald-600" />;
    case 'shield':
      return <Shield className="w-5 h-5 text-teal-600" />;
    case 'landmark':
      return <Landmark className="w-5 h-5 text-blue-600" />;
    case 'layers':
      return <Layers className="w-5 h-5 text-amber-600" />;
    case 'office':
      return <LandmarkIcon className="w-5 h-5 text-slate-600" />;
    case 'executive':
      return <Briefcase className="w-5 h-5 text-indigo-600" />;
    case 'judiciary':
      return <Scale className="w-5 h-5 text-purple-600" />;
    case 'constitutional':
      return <Award className="w-5 h-5 text-rose-600" />;
    default:
      return <HelpCircle className="w-5 h-5 text-slate-500" />;
  }
};

const getFriendlyName = (key: string) => {
  switch (key) {
    case 'country':
      return 'Republic of India';
    case 'state':
      return 'State Government';
    case 'ut':
      return 'Union Territory';
    case 'ministry':
      return 'Union Ministry';
    case 'department':
      return 'Government Department';
    case 'office':
      return 'Administrative Office';
    case 'executive':
      return 'Executive';
    case 'judiciary':
      return 'Judiciary';
    case 'constitutional':
      return 'Constitutional Body';
    default:
      return key;
  }
};

export const HierarchyPage: React.FC = () => {
  const setViewMode = useGovernanceStore((state) => state.setViewMode);
  const activeRegionId = useGovernanceStore((state) => state.activeRegionId);
  const activeTreeData = useGovernanceStore((state) => state.activeTreeData);
  const selectedNodeId = useGovernanceStore((state) => state.selectedNodeId);
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

  // Retrieve details of the selected node
  const selectedNode = React.useMemo(() => {
    if (!activeTreeData) return null;
    if (!selectedNodeId) return activeTreeData;
    const foundPath = findHierarchicalPath(activeTreeData, selectedNodeId);
    return foundPath ? foundPath[foundPath.length - 1] : activeTreeData;
  }, [activeTreeData, selectedNodeId]);

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
            
            {/* Active Node Detail Card */}
            <div className="w-full bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 select-none animate-fade-in flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-[#ff9933] font-extrabold uppercase tracking-widest">
                  {activeRegionId === null ? 'Selector Guide' : 'Selected Node Info'}
                </span>
                <span className="text-[8px] bg-slate-100 text-slate-400 font-extrabold uppercase px-2 py-0.5 rounded-full border border-slate-200/50">
                  {activeRegionId === null ? 'Level 1' : 'Level 2'}
                </span>
              </div>

              {selectedNode ? (
                <>
                  <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-3xs shrink-0">
                      {getIconComponent(selectedNode.type)}
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <h4 className="text-sm font-black text-slate-800 truncate">
                        {selectedNode.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold capitalize mt-0.5">
                        {getFriendlyName(selectedNode.type)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 text-[11px] text-slate-500 leading-relaxed font-semibold">
                    <p>
                      You are inspecting <strong className="text-slate-800">{selectedNode.name}</strong>.
                    </p>
                    <p className="text-slate-400 font-medium">
                      {activeRegionId === null 
                        ? 'Click this card (or double click / expand) to load the corresponding CSV dataset and explore the active administration tree.'
                        : 'Explore this unit\'s relationships, offices, laws, and services using the interactive organization chart.'
                      }
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-400 py-6 text-center font-medium">
                  Select a region or node card to view metadata.
                </div>
              )}
            </div>

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
