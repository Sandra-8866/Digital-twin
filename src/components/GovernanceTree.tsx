import React, { useState, useRef, useEffect } from 'react';
import { useGovernanceStore, getFilteredTree } from '../store/governanceStore';
import type { HierarchicalNode } from '../store/governanceStore';
import TreeNode from './TreeNode';
import { 
  PlusCircle, 
  MinusCircle, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Move,
  Info
} from 'lucide-react';

// Recursive helper to get all node IDs
const getAllNodeIds = (node: HierarchicalNode): string[] => {
  let ids = [node.id];
  if (node.children) {
    node.children.forEach((child) => {
      ids = [...ids, ...getAllNodeIds(child)];
    });
  }
  return ids;
};

export const GovernanceTree: React.FC = () => {
  const activeTreeData = useGovernanceStore((state) => state.activeTreeData);
  const activeRegionId = useGovernanceStore((state) => state.activeRegionId);
  const visibleCategories = useGovernanceStore((state) => state.visibleCategories);
  const setExpandedNodeIds = (ids: string[]) => useGovernanceStore.setState({ expandedNodeIds: ids });
  const selectNode = useGovernanceStore((state) => state.selectNode);

  // Compute filtered tree dynamically
  const filteredTreeData = React.useMemo(() => {
    return getFilteredTree(activeTreeData, visibleCategories);
  }, [activeTreeData, visibleCategories]);

  // Pan and Zoom States
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  const handleExpandAll = () => {
    if (!filteredTreeData) return;
    const allIds = getAllNodeIds(filteredTreeData);
    setExpandedNodeIds(allIds);
  };

  const handleCollapseAll = () => {
    // Collapse all except the root node
    if (!filteredTreeData) return;
    setExpandedNodeIds([filteredTreeData.id]);
  };

  const handleResetTree = () => {
    if (!filteredTreeData) return;
    // Collapse to root and center
    setExpandedNodeIds([filteredTreeData.id]);
    selectNode(filteredTreeData.id);
    handleResetZoom();
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 0.15, 2.5));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 0.15, 0.4));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Dragging / Panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Do not initiate pan dragging if clicking buttons, cards, or interactive nodes
    if (target.closest('button') || target.closest('.w-56')) return;

    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Smooth zoom with mouse wheel
    const zoomFactor = 0.05;
    const direction = e.deltaY < 0 ? 1 : -1;
    setZoom((z) => Math.min(Math.max(z + direction * zoomFactor, 0.3), 2.5));
  };

  // Clean up dragging if mouse leaves window
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Whenever the active tree/region switches, reset view centering
  useEffect(() => {
    handleResetZoom();
  }, [activeRegionId]);

  const rootRegions = useGovernanceStore((state) => state.rootRegions);

  if (activeRegionId !== null && !activeTreeData) {
    return (
      <div className="w-full h-[600px] bg-slate-50 flex items-center justify-center text-xs text-slate-400 border border-slate-200/50 rounded-2xl">
        Loading organization structure...
      </div>
    );
  }

  // Filter root regions dynamically based on active legend filters for Level 1 Selector
  const visibleRegions = rootRegions.filter(region => visibleCategories[region.type] !== false);

  return (
    <div className="w-full bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 select-none animate-fade-in flex flex-col gap-4">
      
      {/* Action Header bar for the tree */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-heading text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
            {activeRegionId === null ? 'Regional Selector Chart' : 'Governance Hierarchy Chart'}
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            {activeRegionId === null 
              ? 'Select a region card to load its dynamic organization chart' 
              : 'Interactive organizational mapping of the administration (Drag to Pan, Scroll to Zoom)'
            }
          </p>
        </div>
        
        {/* Helper Action Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Tree Expansion Controls */}
          <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
            <button
              onClick={handleExpandAll}
              disabled={activeRegionId === null || !filteredTreeData}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Expand all levels"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#ff9933]" />
              <span className="hidden sm:inline">Expand All</span>
            </button>
            <button
              onClick={handleCollapseAll}
              disabled={activeRegionId === null || !filteredTreeData}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Collapse all levels"
            >
              <MinusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Collapse All</span>
            </button>
          </div>

          {/* Zoom and Center View Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer"
              title="Reset Zoom / Pan"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
            
            <div className="text-[10px] font-bold text-slate-400 px-2 select-none border-l border-slate-200 ml-1">
              {Math.round(zoom * 100)}%
            </div>

            <button
              onClick={handleResetTree}
              disabled={activeRegionId === null || !filteredTreeData}
              className="ml-2 p-1.5 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset Tree Layout and Centering"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Zoomable / Pannable Viewport Canvas */}
      <div 
        ref={viewportRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full h-[600px] bg-slate-50/50 border border-slate-200/50 rounded-2xl overflow-hidden relative select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Navigation Indicator Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/90 border border-slate-200/80 shadow-xs px-3 py-2 rounded-xl flex items-center gap-2 text-[10px] font-bold text-slate-400 pointer-events-none">
          <Move className="w-3.5 h-3.5 text-[#ff9933]" />
          <span>Drag canvas to move &bull; Scroll to zoom</span>
        </div>

        {/* Informative Hint Overlay */}
        <div className="absolute top-4 right-4 z-20 bg-white/95 border border-slate-200/80 shadow-xs px-3 py-2 rounded-xl flex items-center gap-2 text-[10px] font-bold text-slate-400 max-w-xs leading-normal pointer-events-none">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>
            {activeRegionId === null 
              ? 'Click a state or UT card (e.g. Kerala) to load its organization chart.' 
              : 'Click chevron arrow to expand/collapse. Click card to inspect details.'
            }
          </span>
        </div>

        {/* Tree Render Workspace */}
        <div
          className="absolute origin-top transition-transform duration-75 ease-out pt-8"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            left: '50%',
            top: '200px', // center them vertically on the canvas
          }}
        >
          {/* Centering container offset */}
          <div className="-translate-x-1/2">
            {activeRegionId === null ? (
              visibleRegions.length > 0 ? (
                <div className="flex flex-row flex-wrap items-center justify-center gap-8 min-w-[900px] px-8">
                  {visibleRegions.map((region) => {
                    const nodeData: HierarchicalNode = {
                      id: region.id,
                      name: region.name,
                      type: region.type,
                      children: []
                    };
                    return (
                      <TreeNode key={region.id} node={nodeData} />
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-400 font-bold py-12 text-center w-[900px]">
                  All regional categories are filtered out. Adjust legend settings to restore selector nodes.
                </div>
              )
            ) : (
              filteredTreeData ? (
                <TreeNode node={filteredTreeData} />
              ) : (
                <div className="text-xs text-slate-400 font-bold py-12 text-center w-[400px]">
                  All categories are filtered out. Adjust legend settings to restore the chart.
                </div>
              )
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default GovernanceTree;
