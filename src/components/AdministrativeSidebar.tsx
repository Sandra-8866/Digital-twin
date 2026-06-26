import React, { useState } from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import type { GovNode } from '../store/governanceStore';
import { Search, Folder, ChevronRight, ChevronDown, Landmark, ArrowRight, Maximize2, Minimize2, Award, Building, FileText } from 'lucide-react';

export const AdministrativeSidebar: React.FC = () => {
  const {
    nodes,
    services,
    selectedNodeId,
    selectedServiceId,
    expandedNodeIds,
    selectNode,
    selectService,
    toggleExpandNode,
    currentRegion
  } = useGovernanceStore();

  const [searchVal, setSearchVal] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // Group nodes by parent for quick traversal
  const nodesByParent = React.useMemo(() => {
    const map: Record<string, GovNode[]> = {};
    nodes.forEach(n => {
      const pid = n.parentId || 'root';
      if (!map[pid]) map[pid] = [];
      map[pid].push(n);
    });
    // Sort nodes alphabetically by name within each group
    Object.keys(map).forEach(pid => {
      map[pid].sort((a, b) => a.name.localeCompare(b.name));
    });
    return map;
  }, [nodes]);

  // Root nodes list based on current active workspace
  const rootNodes = React.useMemo(() => {
    if (currentRegion === 'india') {
      return nodes.filter(n => n.id === 'INDIA_ROOT');
    }
    if (currentRegion === 'Kerala') {
      return nodes.filter(n => n.id === 'KER001');
    }
    if (currentRegion === 'Andaman & Nicobar Islands') {
      return nodes.filter(n => n.id === 'IND_ANI_001');
    }
    if (currentRegion === 'lakshadweep') {
      return nodes.filter(n => n.id === 'IND_LKD_001');
    }
    return [];
  }, [nodes, currentRegion]);

  // Search filter matches
  const searchResults = React.useMemo(() => {
    if (searchVal.trim() === '') return [];
    return nodes.filter(n => 
      n.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      n.id.toLowerCase().includes(searchVal.toLowerCase()) ||
      n.legend.toLowerCase().includes(searchVal.toLowerCase())
    ).slice(0, 8); // Cap suggestions at 8
  }, [nodes, searchVal]);

  const handleSuggestionClick = (nodeId: string) => {
    selectNode(nodeId);
    setSearchVal('');
    setShowSearchSuggestions(false);
  };

  const expandAll = () => {
    const allIds = nodes.map(n => n.id);
    useGovernanceStore.setState({ expandedNodeIds: allIds });
  };

  const collapseAll = () => {
    // Only keep root nodes expanded
    const rootIds = nodes.filter(n => n.parentId === null).map(n => n.id);
    useGovernanceStore.setState({ expandedNodeIds: rootIds });
  };

  // Premium soft colors for legends to match mockup
  const getLegendStyle = (legend: string) => {
    const norm = legend.toLowerCase();
    if (norm.includes('constitutional')) return 'bg-pink-50 text-pink-600 border-pink-100';
    if (norm.includes('executive')) return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    if (norm.includes('department')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (norm.includes('directorate')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (norm.includes('office')) return 'bg-orange-50 text-orange-600 border-orange-100';
    if (norm.includes('local') || norm.includes('self government')) return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  // Dynamic icon selector based on service name
  const getServiceIcon = (name: string) => {
    const norm = name.toLowerCase();
    if (norm.includes('property') || norm.includes('registration')) {
      return Landmark;
    }
    if (norm.includes('trade') || norm.includes('license')) {
      return Award;
    }
    if (norm.includes('building') || norm.includes('permit')) {
      return Building;
    }
    return FileText;
  };

  // Resolve matching citizen services for a hierarchy node
  const getServicesForNode = (node: GovNode) => {
    const name = node.name.toLowerCase();
    return services.filter(s => {
      const dept = (s.department || '').toLowerCase();
      const office = (s.office || '').toLowerCase();
      return (
        name.includes(dept) ||
        name.includes(office) ||
        dept.includes(name) ||
        office.includes(name)
      );
    });
  };

  // Recursive Tree Node Renderer (styled like Notion workspace sidebar)
  const renderTreeNode = (node: GovNode, depth: number = 0) => {
    const children = nodesByParent[node.id] || [];
    const matchedServices = getServicesForNode(node);
    const hasChildren = children.length > 0 || matchedServices.length > 0;
    const isExpanded = expandedNodeIds.includes(node.id);
    const isSelected = selectedNodeId === node.id;

    return (
      <div key={node.id} className="flex flex-col select-none">
        {/* Node Label Row */}
        <div 
          onClick={() => selectNode(node.id)}
          className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer border transition-all duration-150 group ${
            isSelected 
              ? 'bg-indigo-50/50 border-indigo-100/50 text-indigo-900 shadow-3xs font-semibold' 
              : 'border-transparent hover:bg-slate-50 text-slate-700 hover:text-slate-900'
          }`}
          style={{ paddingLeft: `${depth * 10 + 8}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {/* Expand arrow */}
            {hasChildren ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpandNode(node.id);
                }}
                className="p-0.5 rounded hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-4.5 h-4.5"></span> // spacer alignment
            )}

            {/* Icon - Folder for parent nodes, Bullet for leaf nodes */}
            <Folder className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'}`} />

            {/* Node Name */}
            <span className="text-xs tracking-wide truncate pr-1">
              {node.name}
            </span>
          </div>

          {/* Classification indicator badge */}
          {node.legend && (
            <span className={`text-[8.5px] font-sans font-semibold px-2 py-0.5 border rounded-md uppercase leading-none scale-90 flex-shrink-0 ${getLegendStyle(node.legend)}`}>
              {node.legend.replace('Department of ', '').replace('Ministry of ', '').slice(0, 14)}
            </span>
          )}
        </div>

        {/* Children Rows & Citizen Services Leaf Items */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col relative border-l border-slate-200/60 ml-4.5 mt-0.5 pl-0">
            {/* Sub-departments/offices */}
            {children.map(child => renderTreeNode(child, depth + 1))}

            {/* Matching citizen services */}
            {matchedServices.map(srv => {
              const isSrvSelected = selectedServiceId === srv.id;
              const IconComponent = getServiceIcon(srv.name);
              
              return (
                <div
                  key={srv.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Select both the containing node and the service
                    selectNode(node.id);
                    selectService(srv.id);
                  }}
                  className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer border transition-all duration-150 group ${
                    isSrvSelected
                      ? 'bg-blue-50/70 border border-blue-100/40 text-blue-900 shadow-3xs font-semibold'
                      : 'border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                  style={{ paddingLeft: `${(depth + 1) * 10 + 8}px` }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4.5 h-4.5"></span>
                    <IconComponent className={`w-3.5 h-3.5 flex-shrink-0 ${isSrvSelected ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                    <span className="text-xs truncate pr-1">{srv.name}</span>
                  </div>
                  <span className="text-[8px] font-sans font-bold px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md uppercase leading-none scale-90 flex-shrink-0">
                    Service
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-xs select-none min-h-[500px]">
      <div className="flex flex-col gap-4.5 flex-grow overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Landmark className="w-4.5 h-4.5 text-indigo-600" />
            <h2 className="text-xs font-bold text-slate-800 tracking-widest uppercase">Administrative Structure</h2>
          </div>
          {/* Controls: expand/collapse all */}
          <div className="flex items-center gap-1">
            <button 
              onClick={expandAll}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 transition cursor-pointer"
              title="Expand All"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={collapseAll}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 transition cursor-pointer"
              title="Collapse All"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search structure..."
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              setShowSearchSuggestions(true);
            }}
            onFocus={() => setShowSearchSuggestions(true)}
            className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:border-indigo-500/60 focus:bg-white rounded-xl px-3 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition shadow-3xs"
          />
          <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          
          {/* Autocomplete Dropdown */}
          {showSearchSuggestions && searchVal.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 flex flex-col p-1.5 animate-fade-in max-h-48 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="text-[10px] text-slate-400 italic p-2.5">No matches found.</div>
              ) : (
                searchResults.map(res => (
                  <div
                    key={res.id}
                    onClick={() => handleSuggestionClick(res.id)}
                    className="flex justify-between items-center px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition text-left"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-800 block truncate leading-none mb-0.5">{res.name}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider">{res.level} | {res.legend}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 ml-2" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Tree Scroll View */}
        <div className="flex-grow overflow-y-auto max-h-[600px] pr-1 scrollbar-thin border border-slate-100 rounded-xl p-2 bg-slate-50/30">
          {rootNodes.length === 0 ? (
            <div className="text-[10px] text-slate-400 italic text-center py-8">Loading administration structure...</div>
          ) : (
            rootNodes.map(root => renderTreeNode(root))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-3 border-t border-slate-100 pt-2.5 font-sans uppercase tracking-widest font-bold">
        <span>Hierarchy Index</span>
        <span>{nodes.length} Elements</span>
      </div>
    </div>
  );
};
export default AdministrativeSidebar;
