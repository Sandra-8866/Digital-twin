import React from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import { Landmark, Building, FileText, ChevronRight, ArrowUp, HelpCircle } from 'lucide-react';

export const NodeDetailsPanel: React.FC = () => {
  const { nodes, services, selectedNodeId, selectNode, selectService } = useGovernanceStore();

  const activeNode = nodes.find(n => n.id === selectedNodeId) || null;

  // Resolve parent node for navigation/breadcrumbs
  const parentNode = React.useMemo(() => {
    if (!activeNode || !activeNode.parentId) return null;
    return nodes.find(n => n.id === activeNode.parentId) || null;
  }, [nodes, activeNode]);

  // Resolve children
  const childNodes = React.useMemo(() => {
    if (!activeNode) return [];
    return nodes.filter(n => n.parentId === activeNode.id).sort((a, b) => a.name.localeCompare(b.name));
  }, [nodes, activeNode]);

  // Resolve services linked to this node
  const matchedServices = React.useMemo(() => {
    if (!activeNode) return [];
    const name = activeNode.name.toLowerCase();
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
  }, [services, activeNode]);

  // Classification helper to separate Administrative Bodies from Departments/Directorates
  const isDeptOrOffice = (legend: string, type: string) => {
    const l = (legend || '').toLowerCase();
    const t = (type || '').toLowerCase();
    return (
      l.includes('department') ||
      l.includes('directorate') ||
      l.includes('office') ||
      l.includes('service') ||
      t.includes('department') ||
      t.includes('directorate') ||
      t.includes('office')
    );
  };

  const administrativeBodies = React.useMemo(() => {
    return childNodes.filter(n => !isDeptOrOffice(n.legend, n.type));
  }, [childNodes]);

  const departments = React.useMemo(() => {
    return childNodes.filter(n => isDeptOrOffice(n.legend, n.type));
  }, [childNodes]);

  if (!activeNode) {
    return (
      <div className="w-full bg-white border border-slate-200 p-8 rounded-2xl flex flex-col justify-center items-center text-center shadow-xs min-h-[500px]">
        <HelpCircle className="w-12 h-12 text-slate-300 mb-4 animate-pulse" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Select a Region or Office</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
          Please select an administrative region or department from the navigation menu on the left to start exploring.
        </p>
      </div>
    );
  }

  // Soft styling badges for nodes
  const getBadgeStyle = (legend: string) => {
    const norm = (legend || '').toLowerCase();
    if (norm.includes('constitutional')) return 'bg-pink-50 text-pink-600 border-pink-100/50';
    if (norm.includes('executive')) return 'bg-indigo-50 text-indigo-600 border-indigo-100/50';
    if (norm.includes('judiciary')) return 'bg-purple-50 text-purple-600 border-purple-100/50';
    if (norm.includes('legislature')) return 'bg-amber-50 text-amber-600 border-amber-100/50';
    if (norm.includes('department')) return 'bg-emerald-50 text-emerald-600 border-emerald-100/50';
    if (norm.includes('directorate')) return 'bg-blue-50 text-blue-600 border-blue-100/50';
    return 'bg-slate-50 text-slate-600 border-slate-200/50';
  };

  return (
    <div className="w-full bg-white border border-slate-200 p-6 md:p-8 rounded-2xl flex flex-col gap-6 shadow-xs min-h-[500px] animate-fade-in text-left">
      {/* Directory Node Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-3xs flex-shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
              {activeNode.level ? `${activeNode.level} Unit` : 'Administrative Branch'}
            </span>
            <h2 className="text-lg font-black text-slate-800 leading-snug mt-0.5">{activeNode.name}</h2>
          </div>
        </div>

        {/* Parent Link Button */}
        {parentNode && (
          <button
            onClick={() => selectNode(parentNode.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold cursor-pointer transition shadow-3xs"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            Up: {parentNode.name}
          </button>
        )}
      </div>

      {/* Description / Introduction for common citizens */}
      <div className="p-4 bg-indigo-50/20 border border-indigo-100/30 rounded-2xl text-xs text-slate-600 leading-relaxed font-medium">
        Welcome to the official directory workspace for the <span className="font-semibold text-indigo-900">{activeNode.name}</span>. Explore administrative branches, sub-departments, and public citizen services provided by this entity.
      </div>

      {/* Structured Directory Cards sections */}
      <div className="flex flex-col gap-7.5">
        
        {/* Section 1: Administrative Bodies */}
        {administrativeBodies.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Landmark className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-extrabold text-slate-800 tracking-widest uppercase">
                Administrative Structure ({administrativeBodies.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {administrativeBodies.map(node => (
                <div
                  key={node.id}
                  onClick={() => selectNode(node.id)}
                  className="p-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl cursor-pointer hover:shadow-xs hover:translate-y-[-1px] transition duration-150 flex items-center justify-between gap-4 group"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex-shrink-0 transition">
                      <Landmark className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate leading-snug group-hover:text-indigo-900">
                        {node.name}
                      </h4>
                      {node.legend && (
                        <span className={`text-[8.5px] font-bold px-2 py-0.5 border rounded-full mt-1.5 inline-block uppercase tracking-wider scale-90 origin-left ${getBadgeStyle(node.legend)}`}>
                          {node.legend}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Departments & Directorates */}
        {departments.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-extrabold text-slate-800 tracking-widest uppercase">
                Departments & Directorates ({departments.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departments.map(node => (
                <div
                  key={node.id}
                  onClick={() => selectNode(node.id)}
                  className="p-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl cursor-pointer hover:shadow-xs hover:translate-y-[-1px] transition duration-150 flex items-center justify-between gap-4 group"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex-shrink-0 transition">
                      <Building className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate leading-snug group-hover:text-indigo-900">
                        {node.name}
                      </h4>
                      {node.legend && (
                        <span className={`text-[8.5px] font-bold px-2 py-0.5 border rounded-full mt-1.5 inline-block uppercase tracking-wider scale-90 origin-left ${getBadgeStyle(node.legend)}`}>
                          {node.legend}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Citizen Services Offered */}
        {matchedServices.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-extrabold text-slate-800 tracking-widest uppercase">
                Citizen Services Offered ({matchedServices.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matchedServices.map(srv => (
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
                      <h4 className="text-xs font-bold text-slate-800 truncate leading-snug group-hover:text-blue-900">
                        {srv.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-1 leading-normal">
                        Service provided by {srv.office || srv.department}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* If no children or services, show informative block */}
        {childNodes.length === 0 && matchedServices.length === 0 && (
          <div className="py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 flex flex-col items-center text-center p-6">
            <HelpCircle className="w-10 h-10 text-slate-300 mb-3" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Directory records empty</h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed font-medium">
              There are no nested sub-departments, offices, or services recorded directly under this unit. Use the sidebar hierarchy to explore.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default NodeDetailsPanel;
