import React, { useState } from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import type { GovNode } from '../store/governanceStore';
import { ChevronRight, ArrowRight, Home, Building2, Layers, FileText, Search } from 'lucide-react';

export const RegionStructurePage: React.FC = () => {
  const {
    nodes,
    services,
    currentRegion,
    selectedNodeId,
    selectNode,
    selectService,
    resetNavigation
  } = useGovernanceStore();

  const [searchTerm, setSearchTerm] = useState('');

  // 1. Resolve current active node (if any)
  const activeNode = nodes.find(n => n.id === selectedNodeId) || null;

  // 2. Resolve structural cards to display at this level
  const childNodes = React.useMemo(() => {
    if (!selectedNodeId) {
      // Root Level: show top-level entities where parentId is null
      return nodes.filter(n => n.parentId === null).sort((a, b) => a.name.localeCompare(b.name));
    }
    // Deep Level: show children of the selected node
    return nodes.filter(n => n.parentId === selectedNodeId).sort((a, b) => a.name.localeCompare(b.name));
  }, [nodes, selectedNodeId]);

  // 3. Resolve citizen services mapped to the active node
  const activeServices = React.useMemo(() => {
    if (!activeNode) return [];
    
    // Check if this node represents an office/organization (leaf or near leaf level)
    // We look up services in the CSV database where department or office matches
    return services.filter((s) => {
      const dept = s.department || '';
      const office = s.office || '';
      const name = activeNode.name || '';
      
      return (
        name.toLowerCase().includes(dept.toLowerCase()) ||
        name.toLowerCase().includes(office.toLowerCase()) ||
        dept.toLowerCase().includes(name.toLowerCase()) ||
        office.toLowerCase().includes(name.toLowerCase())
      );
    });
  }, [services, activeNode]);

  // 4. Construct breadcrumbs trail
  const breadcrumbs = React.useMemo(() => {
    const trail: { id: string | null; name: string }[] = [
      { id: 'india-page', name: 'India' },
      { id: null, name: currentRegion === 'india' ? 'India Executive' : currentRegion }
    ];

    if (!selectedNodeId) return trail;

    const path: GovNode[] = [];
    let current: GovNode | null = activeNode;
    while (current) {
      path.unshift(current);
      const pId: string | null = current.parentId;
      current = pId ? (nodes.find(n => n.id === pId) || null) : null;
    }

    path.forEach(node => {
      trail.push({ id: node.id, name: node.name });
    });

    return trail;
  }, [nodes, currentRegion, selectedNodeId, activeNode]);

  const handleCrumbClick = (crumbId: string | null, index: number) => {
    if (crumbId === 'india-page') {
      // Go back to India Page selection
      useGovernanceStore.setState({ currentRegion: 'india', selectedNodeId: null, selectedServiceId: null });
      return;
    }
    if (index === 1) {
      // Go to Region Root Structure
      selectNode(null);
      return;
    }
    selectNode(crumbId);
  };

  // Filter content based on search term
  const filteredNodes = childNodes.filter(n =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.legend.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServices = activeServices.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Friendly title based on level
  const getPageTitle = () => {
    if (!activeNode) return 'Government Structure';
    
    const level = activeNode.level.toLowerCase();
    if (level.includes('l2') || level.includes('l3')) return 'Departments';
    if (level.includes('l4') || level.includes('l5')) return 'Organizations';
    return 'Citizen Services';
  };

  const pageTitle = getPageTitle();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6 select-none animate-fade-in">
      
      {/* Dynamic Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto pb-1 no-scrollbar">
        <button 
          onClick={resetNavigation}
          className="hover:text-indigo-600 flex items-center gap-1 flex-shrink-0 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          Home
        </button>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={`${crumb.id}-${idx}`}>
            <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
            <button
              onClick={() => handleCrumbClick(crumb.id, idx)}
              className={`hover:text-indigo-600 truncate max-w-[150px] cursor-pointer flex-shrink-0 ${
                idx === breadcrumbs.length - 1 ? 'text-indigo-600 font-semibold' : ''
              }`}
              disabled={idx === breadcrumbs.length - 1}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{pageTitle}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {activeNode 
              ? `Currently viewing levels under ${activeNode.name}`
              : `Explore the administrative branches of ${currentRegion === 'india' ? 'Government of India' : currentRegion}`}
          </p>
        </div>

        {/* Filter Input */}
        {(childNodes.length > 0 || activeServices.length > 0) && (
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder={`Search ${pageTitle.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-100 rounded-lg px-3 py-1.5 pl-8.5 text-xs text-slate-800 focus:outline-none transition shadow-2xs"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </div>
        )}
      </div>

      {/* Section 1: Children Nodes (Sub-departments, Branches, Offices) */}
      {childNodes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNodes.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400 italic bg-white border border-slate-100 rounded-2xl shadow-2xs">
              No matching departments or branches found.
            </div>
          ) : (
            filteredNodes.map((child) => (
              <div
                key={child.id}
                onClick={() => selectNode(child.id)}
                className="p-5 border border-slate-200 bg-white rounded-2xl hover:border-indigo-300 hover:shadow-sm hover:translate-y-[-1px] transition duration-200 cursor-pointer flex flex-col justify-between h-36 shadow-2xs"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                      {child.level || 'Branch'}
                    </span>
                    {child.status && (
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{child.status}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mt-2 flex items-start gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2 leading-tight">{child.name}</span>
                  </h3>
                  {child.legend && (
                    <span className="text-[9px] text-slate-400 font-medium block mt-1">{child.legend}</span>
                  )}
                </div>

                <div className="flex justify-end items-center text-xs font-semibold text-indigo-600 gap-1 mt-2">
                  View Levels
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Section 2: Mapped Citizen Services (If we are at the organization level) */}
      {selectedNodeId && childNodes.length === 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            Available Citizen Services
          </div>

          {activeServices.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 italic bg-white border border-slate-100 rounded-2xl shadow-2xs flex flex-col items-center gap-2">
              <Layers className="w-8 h-8 text-slate-200" />
              <span>No citizen services catalogued under this office.</span>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5 uppercase tracking-wider">Work In Progress</span>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic bg-white border border-slate-100 rounded-2xl shadow-2xs">
              No matching services found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => selectService(service.id)}
                  className="p-5 border border-slate-200 bg-white rounded-2xl hover:border-indigo-300 hover:shadow-sm hover:translate-y-[-1px] transition duration-200 cursor-pointer flex flex-col justify-between h-40 shadow-2xs"
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Service: {service.id}
                      </span>
                      <span className="text-[8.5px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                        Interactive Workflow
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mt-2.5 leading-snug">{service.name}</h3>
                    <p className="text-xs text-slate-500 leading-normal line-clamp-2 mt-1.5">{service.description}</p>
                  </div>

                  <div className="flex justify-end items-center text-xs font-semibold text-indigo-600 gap-1 mt-3">
                    Open Workflow Timeline
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegionStructurePage;
