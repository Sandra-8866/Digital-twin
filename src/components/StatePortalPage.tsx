import React, { useMemo } from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import type { GovNode } from '../store/governanceStore';
import { Landmark, Building, FileText, ChevronRight, ArrowUp, Compass } from 'lucide-react';

export const StatePortalPage: React.FC = () => {
  const { nodes, services, selectedNodeId, selectNode, selectService } = useGovernanceStore();

  const activeNode = nodes.find(n => n.id === selectedNodeId) || null;

  // Resolve parent node for navigation/breadcrumbs
  const parentNode = useMemo(() => {
    if (!activeNode || !activeNode.parentId) return null;
    return nodes.find(n => n.id === activeNode.parentId) || null;
  }, [nodes, activeNode]);

  // Resolve all nodes belonging to the current state/UT workspace
  const stateRootNode = useMemo(() => {
    if (!activeNode) return null;
    // Find root parent of activeNode that is child of INDIA_ROOT
    let curr = activeNode;
    while (curr && curr.parentId !== 'INDIA_ROOT') {
      const parent = nodes.find(n => n.id === curr.parentId);
      if (!parent) break;
      curr = parent;
    }
    return curr;
  }, [nodes, activeNode]);

  const stateNodes = useMemo(() => {
    if (!stateRootNode) return [];
    // Recursively collect all descendant nodes
    const descendants: GovNode[] = [];
    const queue = [stateRootNode.id];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currId = queue.shift()!;
      visited.add(currId);
      const node = nodes.find(n => n.id === currId);
      if (node) descendants.push(node);

      nodes.forEach(n => {
        if (n.parentId === currId && !visited.has(n.id)) {
          queue.push(n.id);
        }
      });
    }
    return descendants;
  }, [nodes, stateRootNode]);

  // Classification helper to separate Administrative Bodies from Departments/Directorates
  const isDeptOrOffice = (legend: string, type: string) => {
    const l = (legend || '').toLowerCase();
    const t = (type || '').toLowerCase();
    return (
      l.includes('department') ||
      l.includes('directorate') ||
      l.includes('office') ||
      l.includes('division') ||
      l.includes('unit') ||
      t.includes('department') ||
      t.includes('directorate') ||
      t.includes('office') ||
      t.includes('division') ||
      t.includes('unit')
    );
  };

  // Group child nodes of the activeNode
  const childNodes = useMemo(() => {
    if (!activeNode) return [];
    return nodes.filter(n => n.parentId === activeNode.id).sort((a, b) => a.name.localeCompare(b.name));
  }, [nodes, activeNode]);

  const administrativeBodies = useMemo(() => {
    return childNodes.filter(n => !isDeptOrOffice(n.legend, n.type));
  }, [childNodes]);

  // Recursively resolve all departments under a given node to display them hierarchically
  const renderDepartmentHierarchy = (node: GovNode, depth = 0): React.ReactNode => {
    const children = stateNodes.filter(n => n.parentId === node.id && isDeptOrOffice(n.legend, n.type));
    
    return (
      <div key={node.id} className="flex flex-col text-left">
        <div 
          onClick={() => selectNode(node.id)}
          className={`flex items-center justify-between py-2 px-3 rounded-xl border transition cursor-pointer group ${
            selectedNodeId === node.id
              ? 'bg-slate-50 border-slate-200 text-[#0f2942] font-bold shadow-3xs'
              : 'border-transparent hover:bg-slate-50/50 text-slate-700 hover:text-[#0f2942]'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          <div className="min-w-0 flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#ff9933] flex-shrink-0" />
            <span className="text-xs truncate font-semibold">{node.name}</span>
          </div>
          <span className="text-[8.5px] uppercase tracking-wider text-slate-400 font-bold px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded-md">
            {node.level || 'L5'}
          </span>
        </div>
        {children.length > 0 && (
          <div className="flex flex-col ml-3 border-l border-slate-200/60 mt-1 pl-1">
            {children.map(child => renderDepartmentHierarchy(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Find top-level departments (L3/L4 nodes of the state that are departments and have parent L2 State Executive/Systems)
  const topLevelDepartments = useMemo(() => {
    // Find nodes in stateNodes where parent is L2/Root, and is classified as department
    return stateNodes
      .filter(n => {
        // Parent must be in stateNodes and NOT be a department itself, or parent is stateRootNode
        if (n.id === stateRootNode?.id) return false;
        if (!isDeptOrOffice(n.legend, n.type)) return false;
        const parent = stateNodes.find(p => p.id === n.parentId);
        return parent && (!isDeptOrOffice(parent.legend, parent.type) || parent.id === stateRootNode?.id);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [stateNodes, stateRootNode]);

  // Resolve and group services by department node
  const groupedServices = useMemo(() => {
    // Collect all services that belong to stateNodes
    const stateNodeNames = new Set(stateNodes.map(n => n.name.toLowerCase()));
    
    // Find matching services
    const matched = services.filter(s => {
      const dept = (s.department || '').toLowerCase();
      const office = (s.office || '').toLowerCase();
      return (
        stateNodeNames.has(dept) ||
        stateNodeNames.has(office) ||
        stateNodes.some(n => {
          const name = n.name.toLowerCase();
          return name.includes(dept) || name.includes(office) || dept.includes(name) || office.includes(name);
        })
      );
    });

    // Group services by parent department
    const groups: Record<string, typeof services> = {};
    matched.forEach(srv => {
      // Find matching department node in state
      const matchingNode = stateNodes.find(n => {
        const name = n.name.toLowerCase();
        const dept = (srv.department || '').toLowerCase();
        return name.includes(dept) || dept.includes(name);
      });
      const groupKey = matchingNode ? matchingNode.name : srv.department || 'General Administration';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(srv);
    });
    return groups;
  }, [services, stateNodes]);

  if (!stateRootNode) return null;

  return (
    <div className="w-full text-left font-sans ashoka-watermark-bg pb-12 select-none animate-fade-in relative z-0">
      
      {/* State Welcome Banner */}
      <div className="bg-slate-50 border border-slate-200/60 p-6 md:p-8 rounded-3xl relative overflow-hidden mb-8 shadow-xs">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-[#0f2942] to-transparent pointer-events-none"></div>
        <span className="text-[10px] font-extrabold text-[#ff9933] uppercase tracking-widest bg-amber-50 border border-amber-100/50 px-3 py-1 rounded-full w-fit">
          State Governance Portal
        </span>
        <h2 className="text-xl md:text-2xl font-black text-[#0f2942] leading-tight mt-3">
          Government of {stateRootNode.name.replace('State of ', '')}
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed mt-2 max-w-2xl font-medium">
          Official directory directory. Explore ministries, administrative branches, departmental hierarchies, and citizen service workflows.
        </p>

        {/* Up Navigation Button */}
        {parentNode && (
          <button
            onClick={() => selectNode(parentNode.id)}
            className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold cursor-pointer transition shadow-3xs"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            Up: {parentNode.name}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-8">

        {/* 1. Administrative Structure (Ministries, Assemblies, Authorities) */}
        {administrativeBodies.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Landmark className="w-4 h-4 text-[#0f2942]" />
              <h3 className="text-xs font-extrabold text-[#0f2942] tracking-widest uppercase">
                🏛️ Administrative Structure ({administrativeBodies.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {administrativeBodies.map(node => (
                <div
                  key={node.id}
                  onClick={() => selectNode(node.id)}
                  className="p-5 bg-white border border-slate-200 hover:border-[#ff9933] rounded-3xl cursor-pointer hover:shadow-xs hover:translate-y-[-1px] transition duration-150 flex flex-col justify-between min-h-24 group"
                >
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">{node.legend || 'Authority'}</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-1.5 leading-snug group-hover:text-[#0f2942]">
                      {node.name}
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

        {/* 2. Hierarchical Departments */}
        {topLevelDepartments.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Compass className="w-4 h-4 text-[#0f2942]" />
              <h3 className="text-xs font-extrabold text-[#0f2942] tracking-widest uppercase">
                📁 Departments & Divisions ({topLevelDepartments.length})
              </h3>
            </div>
            <div className="border border-slate-200 rounded-3xl p-5 bg-white shadow-2xs max-h-[420px] overflow-y-auto scrollbar-thin">
              <div className="flex flex-col gap-2">
                {topLevelDepartments.map(node => renderDepartmentHierarchy(node))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Citizen Services Grouped by Department */}
        {Object.keys(groupedServices).length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-[#0f2942]" />
              <h3 className="text-xs font-extrabold text-[#0f2942] tracking-widest uppercase">
                💼 Citizen Services
              </h3>
            </div>
            
            <div className="flex flex-col gap-6">
              {Object.keys(groupedServices).map(deptName => {
                const srvList = groupedServices[deptName];
                return (
                  <div key={deptName} className="flex flex-col gap-3 bg-slate-50/40 border border-slate-100 p-5 rounded-3xl">
                    <h4 className="text-xs font-black text-[#0f2942] uppercase tracking-wider border-b border-slate-200/50 pb-2 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-[#ff9933]" />
                      {deptName}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {srvList.map(srv => (
                        <div
                          key={srv.id}
                          onClick={() => selectService(srv.id)}
                          className="p-4 bg-white border border-slate-200 hover:border-blue-300 rounded-2xl cursor-pointer hover:shadow-xs hover:translate-y-[-1px] transition duration-150 flex items-center justify-between gap-4 group"
                        >
                          <div className="min-w-0 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50/50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700 flex-shrink-0 transition">
                              <FileText className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-slate-800 truncate leading-snug group-hover:text-[#0f2942]">
                                {srv.name}
                              </h5>
                              <p className="text-[10px] text-slate-400 font-medium truncate mt-1 leading-normal">
                                {srv.office || srv.department}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StatePortalPage;
