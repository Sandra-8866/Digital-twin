import React from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import { Home, HelpCircle, Database } from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  const { currentRegion, loadRegion, setViewMode } = useGovernanceStore();

  const handleRegionClick = async (regionId: 'india' | 'Kerala' | 'Andaman & Nicobar Islands' | 'lakshadweep') => {
    await loadRegion(regionId);
    setViewMode('dashboard');
  };

  const navItems = [
    { id: 'home', label: 'Welcome Portal', icon: Home, active: false }
  ];

  const workspaces = [
    { id: 'india', label: 'India', emoji: '🇮🇳' },
    { id: 'Kerala', label: 'Kerala', emoji: '🌴' },
    { id: 'Andaman & Nicobar Islands', label: 'Andaman & Nicobar', emoji: '🌊' },
    { id: 'lakshadweep', label: 'Lakshadweep', emoji: '🌴' }
  ];

  return (
    <div className="w-64 border-r border-slate-200 bg-white h-screen flex flex-col justify-between p-6 flex-shrink-0 font-sans select-none fixed left-0 top-0 z-20 shadow-xs">
      
      <div className="flex flex-col gap-7">
        {/* Branding Logo - Indian Government theme */}
        <div className="flex items-center gap-3">
          {/* Stylized Indian Emblem / Ashoka Chakra SVG */}
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-3xs">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#0f2942]" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3" stroke="#ff9933" />
              <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4L18.4 5.6" stroke="#138808" />
              <path d="M8.5 8.5l7 7M8.5 15.5l7-7" strokeWidth="1" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-[#0f2942] leading-tight">National Portal</h1>
            <span className="text-[9px] text-[#138808] font-bold uppercase tracking-wider block">e-Governance Directory</span>
          </div>
        </div>

        {/* Explore Links */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pl-2 mb-1.5">Main</span>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setViewMode('hero');
              }}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer text-left transition duration-150 text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-l-transparent border-y-transparent border-r-transparent"
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </div>

        {/* My Workspaces (Regions) */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pl-2 mb-1.5">Government Directory</span>
          {workspaces.map((ws) => {
            const isActive = currentRegion === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => handleRegionClick(ws.id as any)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer text-left transition duration-150 border-l-2 border-y-transparent border-r-transparent border-t-0 border-b-0 border-r-0 border-t-transparent border-b-transparent border-r-transparent ${
                  isActive
                    ? 'bg-slate-50 text-[#0f2942] border-l-[#ff9933] font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#0f2942] border-l-transparent'
                }`}
              >
                <span className="text-sm flex-shrink-0">{ws.emoji}</span>
                <span className="truncate">{ws.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* About Box & Footer */}
      <div className="flex flex-col gap-4">
        {/* About Card with Monuments */}
        <div className="bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl flex flex-col gap-2 relative overflow-hidden">
          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            About
          </span>
          <p className="text-[10.5px] text-slate-500 leading-relaxed z-10 font-medium">
            An interactive digital representation of India's governance structure and citizen services.
          </p>
          
          {/* Detailed Monument SVG Silhouettes (Taj Mahal + India Gate + Temples/Minarets) */}
          <div className="h-12 w-full mt-2 relative opacity-25">
            <svg className="w-full h-full absolute bottom-0 left-0 text-slate-400" viewBox="0 0 120 30" fill="currentColor">
              {/* Taj Mahal Shape */}
              <path d="M40,30 L40,24 L43,24 L43,20 L45,20 L45,18 L48,15 L50,18 L50,20 L52,20 L52,24 L55,24 L55,30 Z" />
              <path d="M45,17 C45,12 50,12 50,17 Z" /> {/* Dome */}
              <rect x="36" y="16" width="2" height="14" /> {/* Minaret left */}
              <rect x="57" y="16" width="2" height="14" /> {/* Minaret right */}
              <circle cx="37" cy="15" r="1.2" />
              <circle cx="58" cy="15" r="1.2" />

              {/* India Gate / Arch style */}
              <path d="M75,30 L75,18 L79,18 L79,23 C79,25 85,25 85,23 L85,18 L89,18 L89,30 L86,30 L86,22 C86,20 78,20 78,22 L78,30 Z" />
              <path d="M73,18 L91,18 L91,15 L73,15 Z" />
              <path d="M77,15 L87,15 L85,11 L79,11 Z" />

              {/* Extra domes / minarets */}
              <path d="M10,30 L10,21 L12,21 L13,18 L15,21 L17,21 L17,30 Z" />
              <path d="M12,18 C12,15 15,15 15,18 Z" />
              <rect x="5" y="14" width="2.5" height="16" />
              <circle cx="6.2" cy="13" r="1" />

              <path d="M105,30 L105,20 L108,18 L111,20 L111,30 Z" />
            </svg>
          </div>
        </div>

        {/* Data Source Footer */}
        <div className="flex items-center gap-2 pl-2 text-[9px] text-slate-400 font-semibold tracking-wide">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span>Data Source: CSV Datasets</span>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
