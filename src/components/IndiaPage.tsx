import React, { useState } from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import { MapPin, ArrowRight, Search } from 'lucide-react';

const STATES_AND_UTS = [
  { id: 'Kerala', name: 'Kerala', type: 'State', status: 'Available' },
  { id: 'Andaman & Nicobar Islands', name: 'Andaman & Nicobar Islands', type: 'Union Territory', status: 'Available' },
  { id: 'lakshadweep', name: 'Lakshadweep', type: 'Union Territory', status: 'Available' },
  { id: 'andhra-pradesh', name: 'Andhra Pradesh', type: 'State', status: 'Coming Soon' },
  { id: 'gujarat', name: 'Gujarat', type: 'State', status: 'Coming Soon' },
  { id: 'karnataka', name: 'Karnataka', type: 'State', status: 'Coming Soon' },
  { id: 'maharashtra', name: 'Maharashtra', type: 'State', status: 'Coming Soon' },
  { id: 'tamil-nadu', name: 'Tamil Nadu', type: 'State', status: 'Coming Soon' },
  { id: 'delhi', name: 'Delhi', type: 'Union Territory', status: 'Coming Soon' },
  { id: 'west-bengal', name: 'West Bengal', type: 'State', status: 'Coming Soon' },
];

export const IndiaPage: React.FC = () => {
  const { loadRegion } = useGovernanceStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = STATES_AND_UTS.filter(state =>
    state.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = async (stateId: string, status: string) => {
    if (status !== 'Available') return;
    await loadRegion(stateId as any);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8 select-none animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">States & Union Territories</h2>
          <p className="text-xs text-slate-500 mt-1">Select a state or territory to explore its governance structure.</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search states..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-100 rounded-lg px-3 py-1.5 pl-9 text-xs text-slate-800 focus:outline-none transition shadow-2xs"
          />
          <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((state) => {
          const isAvailable = state.status === 'Available';
          return (
            <div
              key={state.id}
              onClick={() => handleSelect(state.id, state.status)}
              className={`p-5 border rounded-2xl transition duration-200 flex flex-col justify-between h-36 ${
                isAvailable 
                  ? 'cursor-pointer hover:border-indigo-300 hover:shadow-sm hover:translate-y-[-1px] shadow-2xs border-slate-200 bg-white' 
                  : 'bg-slate-50/50 border-slate-100 cursor-not-allowed opacity-60'
              }`}
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{state.type}</span>
                  <span className={`text-[8.5px] font-semibold px-2 py-0.5 rounded-full border ${
                    isAvailable 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    {state.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-2 flex items-center gap-1.5">
                  <MapPin className={`w-4 h-4 ${isAvailable ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {state.name}
                </h3>
              </div>

              {isAvailable && (
                <div className="flex justify-end items-center text-xs font-semibold text-indigo-600 gap-1 mt-2">
                  Explore Structure
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IndiaPage;
