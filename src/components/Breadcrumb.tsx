import React from 'react';
import { useGovernanceStore, findHierarchicalPath } from '../store/governanceStore';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb: React.FC = () => {
  const activeRegionId = useGovernanceStore((state) => state.activeRegionId);
  const activeTreeData = useGovernanceStore((state) => state.activeTreeData);
  const selectedNodeId = useGovernanceStore((state) => state.selectedNodeId);
  const resetToSelector = useGovernanceStore((state) => state.resetToSelector);
  const selectNode = useGovernanceStore((state) => state.selectNode);

  // Compute the path of nodes dynamically
  const path = React.useMemo(() => {
    if (activeRegionId === null || !activeTreeData) return [];
    if (!selectedNodeId) return [activeTreeData];
    const foundPath = findHierarchicalPath(activeTreeData, selectedNodeId);
    return foundPath || [activeTreeData];
  }, [activeRegionId, activeTreeData, selectedNodeId]);

  return (
    <nav aria-label="Breadcrumb" className="w-full py-3 px-5 bg-white border border-slate-200/60 rounded-xl shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
      <button
        onClick={resetToSelector}
        className="flex items-center gap-1.5 text-slate-500 hover:text-[#0f2942] transition font-semibold text-xs shrink-0 cursor-pointer"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Portal</span>
      </button>

      {path.map((node, index) => {
        const isLast = index === path.length - 1;
        return (
          <div key={node.id} className="flex items-center gap-2 shrink-0">
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <button
              onClick={() => selectNode(node.id)}
              disabled={isLast}
              className={`text-xs font-semibold transition ${
                isLast
                  ? 'text-[#ff9933] cursor-default font-bold'
                  : 'text-slate-600 hover:text-[#0f2942] cursor-pointer'
              }`}
            >
              {node.name}
            </button>
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
