import React from 'react';
import ThreeHeroCanvas from './ThreeHeroCanvas';

export const HeroBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-sky-50 via-indigo-50/40 to-sky-100/50 border border-slate-200 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs relative overflow-hidden select-none h-[220px]">
      
      {/* Left side info */}
      <div className="flex-1 text-left flex flex-col gap-3 z-10 max-w-sm">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Digital Twin of <br /> Indian Governance
        </h2>
        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
          Explore India's administrative structure and citizen services in a visual and interactive way.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] px-4 py-2 rounded-xl shadow-xs transition w-fit mt-1 flex items-center gap-1">
          Explore India
          <span>&rarr;</span>
        </button>
      </div>

      {/* Right side: 3D Visualization */}
      <div className="w-64 h-full relative flex-shrink-0 flex items-center justify-center">
        <div className="absolute w-[240px] h-[220px] top-[-10px] pointer-events-auto">
          <ThreeHeroCanvas />
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
