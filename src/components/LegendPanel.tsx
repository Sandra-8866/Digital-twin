import React from 'react';
import { useGovernanceStore, CATEGORY_COLORS, normalizeCategory } from '../store/governanceStore';
import { 
  Flag, 
  Globe, 
  Shield, 
  Landmark, 
  Layers, 
  LandmarkIcon, 
  Briefcase, 
  Scale, 
  Award, 
  HelpCircle,
  Settings
} from 'lucide-react';

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'flag':
      return <Flag className="w-3.5 h-3.5" />;
    case 'globe':
      return <Globe className="w-3.5 h-3.5" />;
    case 'shield':
      return <Shield className="w-3.5 h-3.5" />;
    case 'landmark':
      return <Landmark className="w-3.5 h-3.5" />;
    case 'layers':
      return <Layers className="w-3.5 h-3.5" />;
    case 'office':
      return <LandmarkIcon className="w-3.5 h-3.5" />;
    case 'executive':
      return <Briefcase className="w-3.5 h-3.5" />;
    case 'judiciary':
      return <Scale className="w-3.5 h-3.5" />;
    case 'constitutional':
      return <Award className="w-3.5 h-3.5" />;
    default:
      return <HelpCircle className="w-3.5 h-3.5" />;
  }
};

const getFriendlyName = (key: string) => {
  switch (key) {
    case 'country':
      return 'Country';
    case 'state':
      return 'State';
    case 'ut':
      return 'Union Territory';
    case 'ministry':
      return 'Ministry';
    case 'department':
      return 'Department';
    case 'office':
      return 'Office';
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

export const LegendPanel: React.FC = () => {
  const activeRegionId = useGovernanceStore((state) => state.activeRegionId);
  const nodes = useGovernanceStore((state) => state.nodes);
  const rootRegions = useGovernanceStore((state) => state.rootRegions);
  const visibleCategories = useGovernanceStore((state) => state.visibleCategories);
  const toggleCategory = useGovernanceStore((state) => state.toggleCategory);

  // Compute node counts dynamically based on active selection
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(CATEGORY_COLORS).forEach(k => {
      counts[k] = 0;
    });

    if (activeRegionId === null) {
      // Level 1: Count root regions
      rootRegions.forEach(r => {
        counts[r.type] = (counts[r.type] || 0) + 1;
      });
    } else {
      // Level 2: Count types of loaded nodes
      nodes.forEach(n => {
        const cat = normalizeCategory(n.legend, n.type, n.id);
        counts[cat] = (counts[cat] || 0) + 1;
      });
    }
    return counts;
  }, [activeRegionId, nodes, rootRegions]);

  return (
    <div className="w-full bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 select-none animate-fade-in shrink-0">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
        <Settings className="w-4 h-4 text-[#0f2942]" />
        <h3 className="font-heading text-sm font-black text-slate-800 tracking-tight">
          Hierarchy Legend
        </h3>
      </div>

      <p className="text-[11px] text-slate-400 mb-5 leading-relaxed font-semibold">
        Inspect category colors and dynamic counts inside the active dataset view.
      </p>

      <div className="flex flex-col gap-3.5">
        {Object.entries(CATEGORY_COLORS).map(([key, item]) => {
          const count = categoryCounts[key] || 0;
          
          // Only show key if relevant to Level 1 or Level 2 to keep UI clean
          // (e.g. on selector page, show Country/State/UT; on chart, show others)
          const isLevel1Key = ['country', 'state', 'ut'].includes(key);
          const shouldShow = activeRegionId === null ? isLevel1Key : true;

          if (!shouldShow) return null;

          const isChecked = visibleCategories[key] !== false;

          return (
            <label
              key={key}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 cursor-pointer transition group"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCategory(key)}
                  className="w-4 h-4 rounded text-[#0f2942] focus:ring-[#0f2942] border-slate-300 cursor-pointer"
                />
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold ${item.bgColor}`}>
                  {getIconComponent(item.iconName)}
                  <span>{getFriendlyName(key)}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 transition">
                {count} items
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100 text-[10px] text-slate-400 leading-normal font-medium">
        <div className="flex gap-2 items-center mb-1 text-slate-500 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff9933]"></span>
          <span>Single Source of Truth</span>
        </div>
        Color codes represent the classification levels used to catalog files and relational CSV models.
      </div>
    </div>
  );
};

export default LegendPanel;
