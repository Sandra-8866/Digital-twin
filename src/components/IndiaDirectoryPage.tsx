import React, { useState, useMemo } from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import { Landmark, Building, FileText, ChevronRight, ChevronDown, MapPin, Globe, Compass } from 'lucide-react';

export const IndiaDirectoryPage: React.FC = () => {
  const { nodes, services, loadRegion, selectNode, selectService } = useGovernanceStore();
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  // States & UTs definitions to map correctly
  const statesList = [
    { id: 'KER001', regionId: 'Kerala', name: 'Kerala', type: 'State', emoji: '🌴', color: 'border-l-emerald-500' },
    { id: 'IND_ANI_001', regionId: 'Andaman & Nicobar Islands', name: 'Andaman & Nicobar', type: 'Union Territory', emoji: '🌊', color: 'border-l-blue-500' },
    { id: 'IND_LKD_001', regionId: 'lakshadweep', name: 'Lakshadweep', type: 'Union Territory', emoji: '🌴', color: 'border-l-teal-500' }
  ];

  const handleStateClick = async (regionId: string, nodeId: string) => {
    await loadRegion(regionId as any);
    selectNode(nodeId);
  };

  // Resolve Central Ministries (Children of IND_GOI_001 or nodes having Government of India as parent)
  const centralMinistries = useMemo(() => {
    return nodes
      .filter(n => n.parentId === 'IND_GOI_001' && n.id !== 'INDIA_ROOT')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [nodes]);

  // Resolve Central Departments (Grandchildren of IND_GOI_001, i.e. children of Central Ministries)
  const centralDepartments = useMemo(() => {
    const ministryIds = new Set(centralMinistries.map(m => m.id));
    return nodes
      .filter(n => n.parentId && ministryIds.has(n.parentId))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [nodes, centralMinistries]);

  // Resolve Central Services (S004 MCA, S005 CBIC, S006 MSME)
  const centralServices = useMemo(() => {
    return services.filter(s => {
      const dept = (s.department || '').toLowerCase();
      return (
        dept.includes('corporate affairs') ||
        dept.includes('indirect taxes') ||
        dept.includes('micro, small and medium') ||
        dept.includes('msme') ||
        dept.includes('cbic') ||
        dept.includes('mca')
      );
    });
  }, [services]);

  return (
    <div className="w-full text-left font-sans ashoka-watermark-bg pb-12 select-none animate-fade-in relative z-0">
      
      {/* Welcome Saffron-Green Ribbon Banner */}
      <div className="bg-slate-50 border border-slate-200/60 p-6 md:p-8 rounded-3xl relative overflow-hidden mb-8 shadow-xs">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-[#0f2942] to-transparent pointer-events-none"></div>
        <span className="text-[10px] font-extrabold text-[#ff9933] uppercase tracking-widest bg-amber-50 border border-amber-100/50 px-3 py-1 rounded-full w-fit">
          National Directory Portal
        </span>
        <h2 className="text-xl md:text-2xl font-black text-[#0f2942] leading-tight mt-3">
          Welcome to the Digital Twin of Indian Governance
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed mt-2 max-w-2xl font-medium">
          Access administrative records, departments, and citizen workflows across the central government and federal states. Select a territory or ministry to explore.
        </p>
      </div>

      <div className="flex flex-col gap-8">

        {/* 1. Accordion Hierarchical Tree Directory */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs">
          <button
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200/80 hover:bg-slate-100/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Compass className="w-4.5 h-4.5 text-[#ff9933]" />
              <h3 className="text-xs font-extrabold text-[#0f2942] uppercase tracking-widest">
                National Governance Directory Tree
              </h3>
            </div>
            {isAccordionOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          </button>

          {isAccordionOpen && (
            <div className="p-6 bg-white flex flex-col gap-4 text-xs md:text-sm text-slate-700">
              <div className="flex items-center gap-2 font-bold text-[#0f2942]">
                <Globe className="w-4 h-4 text-[#ff9933]" />
                <span>India (Republic of India)</span>
              </div>
              <div className="border-l border-dashed border-slate-300 ml-2 pl-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 font-semibold text-slate-500">
                  <Compass className="w-3.5 h-3.5 text-[#138808]" />
                  <span>States & Union Territories</span>
                </div>
                
                <div className="border-l border-dashed border-slate-300 ml-1.5 pl-4 flex flex-col gap-3">
                  {statesList.map(st => (
                    <button
                      key={st.id}
                      onClick={() => handleStateClick(st.regionId, st.id)}
                      className="flex items-center gap-2 hover:text-[#ff9933] cursor-pointer transition text-left w-fit font-medium text-slate-600 hover:font-bold"
                    >
                      <span className="text-sm">{st.emoji}</span>
                      <span>{st.name} <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded-md ml-1">{st.type}</span></span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. States & Union Territories Grid */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <MapPin className="w-4 h-4 text-[#0f2942]" />
            <h3 className="text-xs font-extrabold text-[#0f2942] tracking-widest uppercase">
              States & Union Territories ({statesList.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {statesList.map(state => (
              <div
                key={state.id}
                onClick={() => handleStateClick(state.regionId, state.id)}
                className={`p-5 bg-white border border-slate-200 border-l-3 ${state.color} hover:border-[#ff9933] rounded-3xl cursor-pointer hover:shadow-xs hover:translate-y-[-1px] transition duration-150 flex flex-col justify-between h-32 group`}
              >
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">{state.type}</span>
                  <h4 className="text-sm font-black text-[#0f2942] mt-1.5 flex items-center gap-2 group-hover:text-[#ff9933] transition">
                    <span className="text-base">{state.emoji}</span>
                    {state.name}
                  </h4>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-[#138808]">
                  <span>Directory Active</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Central Ministries Grid */}
        {centralMinistries.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Landmark className="w-4 h-4 text-[#0f2942]" />
              <h3 className="text-xs font-extrabold text-[#0f2942] tracking-widest uppercase">
                Central Ministries ({centralMinistries.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {centralMinistries.map(m => (
                <div
                  key={m.id}
                  onClick={() => selectNode(m.id)}
                  className="p-5 bg-white border border-slate-200 hover:border-[#ff9933] rounded-3xl cursor-pointer hover:shadow-xs hover:translate-y-[-1px] transition duration-150 flex flex-col justify-between min-h-28 group"
                >
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Union Cabinet</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-1.5 leading-snug group-hover:text-[#0f2942]">
                      {m.name}
                    </h4>
                  </div>
                  <div className="flex justify-end mt-3">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#ff9933] transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. National Departments */}
        {centralDepartments.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building className="w-4 h-4 text-[#0f2942]" />
              <h3 className="text-xs font-extrabold text-[#0f2942] tracking-widest uppercase">
                National Departments ({centralDepartments.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {centralDepartments.map(d => (
                <div
                  key={d.id}
                  onClick={() => selectNode(d.id)}
                  className="p-5 bg-white border border-slate-200 hover:border-[#ff9933] rounded-3xl cursor-pointer hover:shadow-xs hover:translate-y-[-1px] transition duration-150 flex flex-col justify-between min-h-28 group"
                >
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Departmental Unit</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-1.5 leading-snug group-hover:text-[#0f2942]">
                      {d.name}
                    </h4>
                  </div>
                  <div className="flex justify-end mt-3">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#ff9933] transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Key Citizen Services */}
        {centralServices.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-[#0f2942]" />
              <h3 className="text-xs font-extrabold text-[#0f2942] tracking-widest uppercase">
                National Citizen Services ({centralServices.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {centralServices.map(s => (
                <div
                  key={s.id}
                  onClick={() => selectService(s.id)}
                  className="p-5 bg-white border border-slate-200 hover:border-blue-300 rounded-3xl cursor-pointer hover:shadow-xs hover:translate-y-[-1px] transition duration-150 flex flex-col justify-between min-h-28 group"
                >
                  <div>
                    <span className="text-[9px] text-blue-500 font-extrabold uppercase tracking-wider bg-blue-50 px-2 py-0.5 border border-blue-100 rounded-md w-fit inline-block mb-1.5">
                      National Service
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-800 leading-snug group-hover:text-[#0f2942]">
                      {s.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 truncate font-medium">
                      Provided by {s.office || s.department}
                    </p>
                  </div>
                  <div className="flex justify-end mt-3">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default IndiaDirectoryPage;
