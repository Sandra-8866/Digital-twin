import React, { useState } from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import { Search, ChevronRight, FileText, Award, Building, Landmark } from 'lucide-react';

export const CitizenServicesList: React.FC = () => {
  const { services, nodes, currentRegion, selectedServiceId, selectService } = useGovernanceStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Get active nodes for the current region recursively
  const activeRegionNodeIds = React.useMemo(() => {
    const regionRootId = currentRegion === 'india' 
      ? 'INDIA_ROOT' 
      : currentRegion === 'Kerala' 
      ? 'KER001' 
      : currentRegion === 'Andaman & Nicobar Islands' 
      ? 'IND_ANI_001' 
      : 'IND_LKD_001';
      
    const descendants = new Set<string>();
    const queue = [regionRootId];
    while (queue.length > 0) {
      const currId = queue.shift()!;
      descendants.add(currId);
      nodes.forEach(n => {
        if (n.parentId === currId && !descendants.has(n.id)) {
          queue.push(n.id);
        }
      });
    }
    return descendants;
  }, [nodes, currentRegion]);

  // Filter services that match the active region's nodes
  const activeRegionServices = React.useMemo(() => {
    if (currentRegion === 'india') return services;
    
    return services.filter(s => {
      const dept = (s.department || '').toLowerCase();
      const office = (s.office || '').toLowerCase();
      
      return Array.from(activeRegionNodeIds).some(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return false;
        const nodeName = node.name.toLowerCase();
        return (
          nodeName.includes(dept) ||
          nodeName.includes(office) ||
          dept.includes(nodeName) ||
          office.includes(nodeName)
        );
      });
    });
  }, [services, nodes, activeRegionNodeIds, currentRegion]);

  const filtered = activeRegionServices.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.office.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic icon selector based on service name to match mockup variety
  const getServiceIcon = (name: string) => {
    const norm = name.toLowerCase();
    if (norm.includes('property') || norm.includes('registration')) {
      return Landmark; // Blue/indigo landmark
    }
    if (norm.includes('trade') || norm.includes('license')) {
      return Award; // Green award/license
    }
    if (norm.includes('building') || norm.includes('permit')) {
      return Building; // Sky-blue building
    }
    return FileText; // Default file
  };

  const getIconColorClass = (name: string, isSelected: boolean) => {
    if (isSelected) return 'bg-slate-200 text-[#0f2942]';
    const norm = name.toLowerCase();
    if (norm.includes('property') || norm.includes('registration')) {
      return 'bg-blue-50 text-blue-600';
    }
    if (norm.includes('trade') || norm.includes('license')) {
      return 'bg-emerald-50 text-emerald-600';
    }
    if (norm.includes('building') || norm.includes('permit')) {
      return 'bg-sky-50 text-sky-600';
    }
    return 'bg-slate-50 text-slate-500';
  };

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col justify-between shadow-xs select-none font-sans h-[500px]">
      <div className="flex flex-col gap-4 overflow-hidden">
        {/* Title */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="text-xs font-extrabold text-[#0f2942] uppercase tracking-widest flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#ff9933]" />
            Quick Access Services
          </h3>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:border-indigo-500/60 focus:bg-white rounded-xl px-3 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition shadow-3xs"
          />
          <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Services List Scroll Area */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin max-h-[340px]">
          {filtered.length === 0 ? (
            <div className="text-[10px] text-slate-400 italic p-3 text-center">No services found.</div>
          ) : (
            filtered.map((service) => {
              const isSelected = selectedServiceId === service.id;
              const IconComponent = getServiceIcon(service.name);
              const iconColor = getIconColorClass(service.name, isSelected);

              return (
                <div
                  key={service.id}
                  onClick={() => selectService(service.id)}
                  className={`p-3 border rounded-2xl cursor-pointer transition flex items-center justify-between text-left duration-150 border-l-3 ${
                    isSelected 
                      ? 'border-l-[#ff9933] border-y-slate-200 border-r-slate-200 bg-slate-50/80 text-[#0f2942] shadow-3xs font-extrabold' 
                      : 'border-l-transparent border-y-slate-100 border-r-slate-100 hover:border-[#ff9933]/40 hover:bg-slate-50 text-slate-700 hover:text-[#0f2942]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition duration-150 ${iconColor}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">{service.name}</h4>
                      <span className="text-[9px] text-slate-400 font-medium block truncate mt-0.5">{service.office}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ml-2 ${isSelected ? 'text-[#ff9933]' : 'text-slate-400'}`} />
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="text-[10px] font-bold text-[#138808] text-center w-full pt-3 mt-3 border-t border-slate-100">
        Total: {activeRegionServices.length} Services Registered
      </div>
    </div>
  );
};

export default CitizenServicesList;
