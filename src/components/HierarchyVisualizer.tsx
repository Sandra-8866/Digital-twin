import React, { useState, useRef } from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export const HierarchyVisualizer: React.FC = () => {
  const {
    nodes,
    services,
    selectedNodeId,
    selectNode,
    selectService
  } = useGovernanceStore();

  // Zoom and Pan States
  const [zoomScale, setZoomScale] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Find active node neighborhood
  const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes.find(n => n.parentId === null) || null;

  const parentNode = React.useMemo(() => {
    if (!activeNode || !activeNode.parentId) return null;
    return nodes.find(n => n.id === activeNode.parentId) || null;
  }, [nodes, activeNode]);

  // Combined child nodes and citizen services matching the name
  const childNodesAndServices = React.useMemo(() => {
    if (!activeNode) return [];
    
    // Sub-units from CSV
    const children = nodes.filter(n => n.parentId === activeNode.id).map(n => ({
      id: n.id,
      name: n.name,
      legend: n.legend,
      isService: false
    }));

    // Services matching active office
    const name = activeNode.name.toLowerCase();
    const matchedServices = services.filter(s => {
      const dept = (s.department || '').toLowerCase();
      const office = (s.office || '').toLowerCase();
      return (
        name.includes(dept) ||
        name.includes(office) ||
        dept.includes(name) ||
        office.includes(name)
      );
    }).map(s => ({
      id: s.id,
      name: s.name,
      legend: 'Citizen Service',
      isService: true
    }));

    return [...children, ...matchedServices];
  }, [nodes, services, activeNode]);

  // Handle Drag Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle Wheel Scroll Zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    const newScale = zoomScale + (e.deltaY < 0 ? zoomFactor : -zoomFactor);
    setZoomScale(Math.min(2.5, Math.max(0.5, newScale)));
  };

  const handleZoom = (type: 'in' | 'out') => {
    const factor = type === 'in' ? 0.15 : -0.15;
    setZoomScale(Math.min(2.5, Math.max(0.5, zoomScale + factor)));
  };

  const resetZoomPan = () => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Node position parameters
  const canvasWidth = 750;
  const canvasHeight = 400;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  const leftX = 140;
  const rightX = 590;

  // Render curved Bezier wire connection
  const renderConnection = (x1: number, y1: number, x2: number, y2: number, key: string, color = '#4f46e5') => {
    const pathString = `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;
    
    return (
      <g key={key}>
        <path
          d={pathString}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1.2"
        />
        <path
          d={pathString}
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeDasharray="4, 8"
          style={{
            animation: 'dash-sweep 3s linear infinite',
            opacity: 0.6
          }}
        />
      </g>
    );
  };

  // Colored border based on node categories to match legends
  const getNodeBorderColor = (legend: string) => {
    const norm = legend.toLowerCase();
    if (norm.includes('citizen service') || norm.includes('service')) return '#93c5fd'; // blue-300
    if (norm.includes('constitutional')) return '#fbcfe8'; // pink-200
    if (norm.includes('executive')) return '#c7d2fe'; // indigo-200
    if (norm.includes('local')) return '#fde68a'; // yellow-200
    return '#cbd5e1'; // slate-200
  };

  const getNodeFillColor = (legend: string) => {
    const norm = legend.toLowerCase();
    if (norm.includes('citizen service') || norm.includes('service')) return '#eff6ff'; // blue-50
    if (norm.includes('constitutional')) return '#fdf2f8'; // pink-50
    if (norm.includes('executive')) return '#eef2ff'; // indigo-50
    if (norm.includes('local')) return '#fffbeb'; // yellow-50
    return '#ffffff';
  };

  const handleChildClick = (child: { id: string; isService: boolean }) => {
    if (child.isService) {
      selectService(child.id);
    } else {
      selectNode(child.id);
    }
  };

  return (
    <div className="w-full h-full relative bg-white border border-slate-200 p-4.5 rounded-2xl flex flex-col justify-between shadow-2xs select-none">
      
      {/* Header Info */}
      <div className="w-full flex justify-between items-center mb-2 border-b border-slate-100 pb-3 gap-4">
        <div>
          <h2 className="text-xs font-bold text-slate-800 tracking-widest uppercase">
            Administrative Map
          </h2>
        </div>
        
        {/* Category Legends */}
        <div className="hidden lg:flex items-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-pink-50 border border-pink-200"></span>
            Constitutional
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-50 border border-indigo-200"></span>
            Executive
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-50 border border-amber-200"></span>
            Local Government
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-50 border border-slate-200"></span>
            Others
          </div>
        </div>

        {/* Zoom Controls HUD */}
        <div className="flex bg-slate-50 border border-slate-200 p-0.5 rounded-lg text-slate-500 shadow-2xs">
          <button 
            onClick={() => handleZoom('in')}
            className="p-1.5 hover:text-slate-800 hover:bg-white rounded transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => handleZoom('out')}
            className="p-1.5 hover:text-slate-800 hover:bg-white rounded transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={resetZoomPan}
            className="p-1.5 hover:text-slate-800 hover:bg-white rounded transition cursor-pointer border-l border-slate-200 pl-2"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div 
        ref={containerRef}
        className="w-full flex-grow relative bg-slate-50 border border-slate-100 rounded-xl h-[280px] overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="absolute inset-0 select-none overflow-visible"
        >
          {/* Canvas grid pattern */}
          <defs>
            <pattern id="viewer-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148, 163, 184, 0.04)" strokeWidth="0.5" />
            </pattern>
            <style>
              {`
                @keyframes dash-sweep {
                  to {
                    stroke-dashoffset: -24;
                  }
                }
              `}
            </style>
          </defs>
          <rect width="100%" height="100%" fill="url(#viewer-grid)" />

          {/* Navigational Transform Group */}
          <g transform={`translate(${centerX + panOffset.x}, ${centerY + panOffset.y}) scale(${zoomScale}) translate(${-centerX}, ${-centerY})`}>
            {activeNode ? (
              <>
                {/* 1. Curved Connections */}
                {parentNode && renderConnection(leftX + 105, centerY, centerX - 110, centerY, 'parent-conn', '#4f46e5')}
                {!parentNode && renderConnection(leftX + 105, centerY, centerX - 110, centerY, 'root-conn', '#cbd5e1')}

                {childNodesAndServices.map((child, idx) => {
                  const C = childNodesAndServices.length;
                  const spacing = C > 5 ? Math.max(30, 340 / C) : 65;
                  const childY = centerY + (idx - (C - 1) / 2) * spacing;
                  const color = child.isService ? '#3b82f6' : '#2563eb';
                  return renderConnection(centerX + 110, centerY, rightX - 105, childY, `child-conn-${child.id}`, color);
                })}

                {/* 2. Parent Node */}
                <g transform={`translate(${leftX}, ${centerY})`}>
                  <rect
                    x="-105"
                    y="-22"
                    width="210"
                    height="44"
                    rx="10"
                    fill={parentNode ? getNodeFillColor(parentNode.legend) : '#ffffff'}
                    stroke={parentNode ? getNodeBorderColor(parentNode.legend) : '#e2e8f0'}
                    strokeWidth="1"
                    onClick={() => parentNode && selectNode(parentNode.id)}
                    style={{ cursor: parentNode ? 'pointer' : 'default' }}
                    className="shadow-3xs transition hover:stroke-slate-400"
                  />
                  <text
                    x="0"
                    y="-2"
                    fill={parentNode ? '#1e293b' : '#94a3b8'}
                    fontSize="9.5px"
                    fontFamily="var(--font-sans)"
                    fontWeight="semibold"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {parentNode ? parentNode.name.slice(0, 28) : 'UPPER LEVEL'}
                  </text>
                  <text
                    x="0"
                    y="11"
                    fill="#94a3b8"
                    fontSize="7.5px"
                    fontFamily="var(--font-sans)"
                    fontWeight="bold"
                    textAnchor="middle"
                    pointerEvents="none"
                    letterSpacing="0.2px"
                  >
                    {parentNode ? parentNode.legend.slice(0, 24) : 'ROOT'}
                  </text>
                </g>

                {/* 3. Selected Node (Center, Highlighted) */}
                <g transform={`translate(${centerX}, ${centerY})`}>
                  <rect
                    x="-110"
                    y="-26"
                    width="220"
                    height="52"
                    rx="12"
                    fill={getNodeFillColor(activeNode.legend)}
                    stroke={getNodeBorderColor(activeNode.legend)}
                    strokeWidth="2"
                    className="shadow-2xs"
                  />
                  <text
                    x="0"
                    y="-5"
                    fill="#0f172a"
                    fontSize="10.5px"
                    fontFamily="var(--font-sans)"
                    fontWeight="bold"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {activeNode.name.slice(0, 30)}
                  </text>
                  <text
                    x="0"
                    y="11"
                    fill="#4f46e5"
                    fontSize="8.5px"
                    fontFamily="var(--font-sans)"
                    textAnchor="middle"
                    pointerEvents="none"
                    letterSpacing="0.2px"
                    fontWeight="bold"
                  >
                    {activeNode.level}
                  </text>
                  <text
                    x="0"
                    y="20"
                    fill="#64748b"
                    fontSize="7.5px"
                    fontFamily="var(--font-sans)"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {activeNode.legend}
                  </text>
                </g>

                {/* 4. Children Nodes */}
                {childNodesAndServices.map((child, idx) => {
                  const C = childNodesAndServices.length;
                  const spacing = C > 5 ? Math.max(30, 340 / C) : 65;
                  const childY = centerY + (idx - (C - 1) / 2) * spacing;

                  return (
                    <g key={child.id} transform={`translate(${rightX}, ${childY})`}>
                      <rect
                        x="-105"
                        y="-20"
                        width="210"
                        height="40"
                        rx="10"
                        fill={getNodeFillColor(child.legend)}
                        stroke={getNodeBorderColor(child.legend)}
                        strokeWidth="1"
                        onClick={() => handleChildClick(child)}
                        style={{ cursor: 'pointer' }}
                        className="shadow-3xs transition hover:stroke-indigo-400"
                      />
                      <text
                        x="-95"
                        y="-2"
                        fill="#334155"
                        fontSize="9px"
                        fontFamily="var(--font-sans)"
                        fontWeight="semibold"
                        textAnchor="start"
                        pointerEvents="none"
                      >
                        {child.name.slice(0, 28)}
                      </text>
                      <text
                        x="-95"
                        y="9"
                        fill="#64748b"
                        fontSize="7.5px"
                        fontFamily="var(--font-sans)"
                        textAnchor="start"
                        pointerEvents="none"
                      >
                        {child.legend}
                      </text>
                    </g>
                  );
                })}

                {childNodesAndServices.length === 0 && (
                  <g transform={`translate(${rightX}, ${centerY})`}>
                    <text
                      x="0"
                      y="4"
                      fill="#94a3b8"
                      fontSize="9.5px"
                      fontFamily="var(--font-sans)"
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      End of Branches
                    </text>
                  </g>
                )}
              </>
            ) : (
              <text x={centerX} y={centerY} fill="#94a3b8" fontSize="11px" fontFamily="var(--font-sans)" fontWeight="medium" textAnchor="middle">
                Select an entity in the hierarchy tree to render the administrative map.
              </text>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};
export default HierarchyVisualizer;
