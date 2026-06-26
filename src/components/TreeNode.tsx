import React from 'react';
import { useGovernanceStore, CATEGORY_COLORS } from '../store/governanceStore';
import type { HierarchicalNode } from '../store/governanceStore';
import { 
  ChevronRight, 
  Flag, 
  Globe, 
  Shield, 
  Landmark, 
  Layers, 
  LandmarkIcon, 
  Briefcase, 
  Scale, 
  Award, 
  HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TreeNodeProps {
  node: HierarchicalNode;
  isFirst?: boolean;
  isLast?: boolean;
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'flag':
      return <Flag className="w-3.5 h-3.5" />;
    case 'globe':
      return <Globe className="w-3.5 h-3.5 text-emerald-600" />;
    case 'shield':
      return <Shield className="w-3.5 h-3.5 text-teal-600" />;
    case 'landmark':
      return <Landmark className="w-3.5 h-3.5 text-blue-600" />;
    case 'layers':
      return <Layers className="w-3.5 h-3.5 text-amber-600" />;
    case 'office':
      return <LandmarkIcon className="w-3.5 h-3.5 text-slate-600" />;
    case 'executive':
      return <Briefcase className="w-3.5 h-3.5 text-indigo-600" />;
    case 'judiciary':
      return <Scale className="w-3.5 h-3.5 text-purple-600" />;
    case 'constitutional':
      return <Award className="w-3.5 h-3.5 text-rose-600" />;
    default:
      return <HelpCircle className="w-3.5 h-3.5 text-slate-500" />;
  }
};

const getSelectionStyle = (key: string) => {
  switch (key) {
    case 'country': return 'border-orange-500 border-l-4 bg-orange-50/20';
    case 'state': return 'border-emerald-500 border-l-4 bg-emerald-50/20';
    case 'ut': return 'border-teal-500 border-l-4 bg-teal-50/20';
    case 'ministry': return 'border-blue-500 border-l-4 bg-blue-50/20';
    case 'department': return 'border-amber-500 border-l-4 bg-amber-50/20';
    case 'office': return 'border-slate-500 border-l-4 bg-slate-50/20';
    case 'executive': return 'border-indigo-500 border-l-4 bg-indigo-50/20';
    case 'judiciary': return 'border-purple-500 border-l-4 bg-purple-50/20';
    case 'constitutional': return 'border-rose-500 border-l-4 bg-rose-50/20';
    default: return 'border-slate-500 border-l-4 bg-slate-50/20';
  }
};

const getFriendlyName = (key: string) => {
  switch (key) {
    case 'country':
      return 'Republic of India';
    case 'state':
      return 'State Government';
    case 'ut':
      return 'Union Territory';
    case 'ministry':
      return 'Union Ministry';
    case 'department':
      return 'Government Department';
    case 'office':
      return 'Administrative Office';
    case 'executive':
      return 'Executive';
    case 'judiciary':
      return 'Judiciary';
    case 'constitutional':
      return 'Constitutional Body';
    default:
      return key;
  }
};

export const TreeNode: React.FC<TreeNodeProps> = ({ node, isFirst = true, isLast = true }) => {
  const selectedNodeId = useGovernanceStore((state) => state.selectedNodeId);
  const expandedNodeIds = useGovernanceStore((state) => state.expandedNodeIds);
  const selectNode = useGovernanceStore((state) => state.selectNode);
  const toggleExpandNode = useGovernanceStore((state) => state.toggleExpandNode);
  const activeRegionId = useGovernanceStore((state) => state.activeRegionId);

  const isExpanded = expandedNodeIds.includes(node.id);
  const isSelected = selectedNodeId === node.id;
  const hasChildren = !!node.children && node.children.length > 0;

  const handleCardClick = () => {
    selectNode(node.id);
  };

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting node when only expanding/collapsing
    toggleExpandNode(node.id);
  };

  const rootRegions = useGovernanceStore((state) => state.rootRegions);
  const isRoot = activeRegionId === null
    ? node.id === (rootRegions.find(r => r.type === 'country')?.id || rootRegions[0]?.id)
    : node.id === useGovernanceStore.getState().activeTreeData?.id;

  const categoryColor = CATEGORY_COLORS[node.type] || CATEGORY_COLORS['office'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex flex-col items-center relative"
    >
      {/* Top connector lines for child nodes */}
      {!isRoot && (
        <div className="absolute top-0 left-0 right-0 h-6 pointer-events-none">
          {/* Left horizontal arm */}
          {!isFirst && (
            <div className="absolute top-0 left-0 right-1/2 h-[1.5px] bg-slate-300" />
          )}
          {/* Right horizontal arm */}
          {!isLast && (
            <div className="absolute top-0 left-1/2 right-0 h-[1.5px] bg-slate-300" />
          )}
          {/* Vertical stem entering the card */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1.5px] bg-slate-300 -translate-x-1/2" />
        </div>
      )}

      {/* Card Wrapper with top padding if it's a child node to make space for the entry line */}
      <div className={`flex flex-col items-center ${isRoot ? '' : 'pt-6'}`}>
        <div
          onClick={handleCardClick}
          className={`w-56 flex items-center justify-between p-3.5 bg-white border rounded-xl transition duration-200 select-none cursor-pointer relative z-10 ${
            isSelected
              ? getSelectionStyle(node.type) + ' shadow-sm'
              : 'border-slate-200/70 hover:border-slate-300 hover:shadow-xs hover:bg-slate-50/30'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Expand / Collapse Chevron Button */}
            {hasChildren ? (
              <button
                onClick={handleArrowClick}
                className="w-5.5 h-5.5 flex items-center justify-center rounded-md hover:bg-slate-100/80 transition text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90 text-[#ff9933]' : 'text-slate-400'
                  }`}
                />
              </button>
            ) : (
              <div className="w-5.5 h-5.5 flex items-center justify-center shrink-0">
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              </div>
            )}

            {/* Classification Icon Badge */}
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-3xs border border-slate-100/50 ${categoryColor.bgColor}`}>
              {getIconComponent(categoryColor.iconName)}
            </div>

            {/* Title / Classification label */}
            <div className="min-w-0 flex flex-col leading-tight">
              <span className={`text-[11px] font-bold truncate ${
                isSelected ? 'text-[#0f2942]' : 'text-slate-800'
              }`}>
                {node.name}
              </span>
              <span className="text-[8.5px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
                {getFriendlyName(node.type)}
              </span>
            </div>
          </div>

          {/* Right Action Indicator */}
          <div className="flex items-center shrink-0 pl-1">
            {hasChildren && (
              <span className="text-[8px] font-bold text-slate-400 bg-slate-50 border border-slate-200/40 rounded-full px-1.5 py-0.5">
                {node.children?.length}
              </span>
            )}
          </div>
        </div>

        {/* Downward line from parent card (if expanded) */}
        {hasChildren && isExpanded && (
          <div className="w-[1.5px] h-6 bg-slate-300" />
        )}
      </div>

      {/* Recursive Children Container */}
      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex items-start gap-x-8 pt-0 relative"
          >
            {node.children?.map((child, idx) => (
              <TreeNode
                key={child.id}
                node={child}
                isFirst={idx === 0}
                isLast={idx === node.children!.length - 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TreeNode;
