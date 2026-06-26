import React, { useState } from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import type { GovNode } from '../store/governanceStore';
import { ChevronRight, Home, Layers, FileText, UserCheck, MapPin, Scale, Package, ShieldCheck, ArrowLeft } from 'lucide-react';

type TabType = 'workflow' | 'documents' | 'officers' | 'locations' | 'laws' | 'outputs';

export const ServiceDetailPage: React.FC = () => {
  const {
    nodes,
    services,
    workflows,
    documents,
    officers,
    locations,
    laws,
    outputs,
    currentRegion,
    selectedNodeId,
    selectedServiceId,
    selectService
  } = useGovernanceStore();

  const [activeTab, setActiveTab] = useState<TabType>('workflow');

  // Resolve service details
  const activeService = services.find(s => s.id === selectedServiceId) || null;
  const activeNode = nodes.find(n => n.id === selectedNodeId) || null;

  // Filter relationship datasets for active service
  const serviceWorkflows = React.useMemo(() => {
    if (!activeService) return [];
    return workflows
      .filter(w => w.serviceId === activeService.id)
      .sort((a, b) => a.stepNo - b.stepNo);
  }, [workflows, activeService]);

  const serviceDocuments = React.useMemo(() => {
    if (!activeService) return [];
    return documents.filter(d => d.serviceId === activeService.id);
  }, [documents, activeService]);

  const serviceOfficers = React.useMemo(() => {
    if (!activeService) return [];
    return officers.filter(o => o.serviceId === activeService.id);
  }, [officers, activeService]);

  const serviceLocations = React.useMemo(() => {
    if (!activeService) return [];
    return locations.filter(l => l.serviceId === activeService.id);
  }, [locations, activeService]);

  const serviceLaws = React.useMemo(() => {
    if (!activeService) return [];
    return laws.filter(l => l.serviceId === activeService.id);
  }, [laws, activeService]);

  const serviceOutputs = React.useMemo(() => {
    if (!activeService) return [];
    return outputs.filter(o => o.serviceId === activeService.id);
  }, [outputs, activeService]);

  // Construct breadcrumbs
  const breadcrumbs = React.useMemo(() => {
    const trail: { id: string | null; name: string }[] = [
      { id: 'india-page', name: 'India' },
      { id: null, name: currentRegion === 'india' ? 'India Executive' : currentRegion }
    ];

    if (activeNode) {
      const path: GovNode[] = [];
      let current: GovNode | null = activeNode;
      while (current) {
        path.unshift(current);
        const pId: string | null = current.parentId;
        current = pId ? (nodes.find(n => n.id === pId) || null) : null;
      }
      path.forEach(node => {
        trail.push({ id: node.id, name: node.name });
      });
    }

    if (activeService) {
      trail.push({ id: null, name: activeService.name });
    }

    return trail;
  }, [nodes, currentRegion, activeNode, activeService]);

  if (!activeService) {
    return (
      <div className="w-full text-center py-12 text-slate-400 font-sans">
        Service information not available.
      </div>
    );
  }

  const tabsList = [
    { key: 'workflow', label: 'Workflow', icon: Layers },
    { key: 'documents', label: 'Required Documents', icon: FileText },
    { key: 'officers', label: 'Responsible Officers', icon: UserCheck },
    { key: 'locations', label: 'Locations', icon: MapPin },
    { key: 'laws', label: 'Applicable Laws', icon: Scale },
    { key: 'outputs', label: 'Outputs', icon: Package }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6 select-none animate-fade-in font-sans">
      
      {/* Breadcrumbs Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto pb-1 no-scrollbar">
        <button 
          onClick={() => selectService(null)}
          className="hover:text-indigo-600 flex items-center gap-1 flex-shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
        <button 
          onClick={() => {
            selectService(null);
            useGovernanceStore.setState({ selectedNodeId: null });
          }}
          className="hover:text-indigo-600 flex items-center gap-1 flex-shrink-0 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          Home
        </button>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={`${crumb.id}-${idx}`}>
            <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
            <button
              onClick={() => {
                if (crumb.id === 'india-page') {
                  useGovernanceStore.setState({ currentRegion: 'india', selectedNodeId: null, selectedServiceId: null });
                  return;
                }
                selectService(null);
                if (crumb.id) useGovernanceStore.setState({ selectedNodeId: crumb.id });
              }}
              className={`hover:text-indigo-600 truncate max-w-[150px] cursor-pointer flex-shrink-0 ${
                idx === breadcrumbs.length - 1 ? 'text-indigo-600 font-semibold' : ''
              }`}
              disabled={idx === breadcrumbs.length - 1 || !crumb.id}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {/* Main Grid: Info Header & Content Area */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Description & Vertical Tab Links */}
        <div className="w-full lg:w-80 flex flex-col gap-4.5 flex-shrink-0">
          
          {/* Main Info Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider block">SERVICE ID: {activeService.id}</span>
            <h2 className="text-base font-bold text-slate-900 mt-1 leading-snug">{activeService.name}</h2>
            <p className="text-xs text-slate-500 leading-relaxed mt-2">{activeService.description}</p>
            <div className="mt-4 border-t border-slate-100 pt-3 flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Direct Data Verification Complete
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex flex-col bg-white border border-slate-200 p-1.5 rounded-2xl shadow-2xs gap-0.5">
            {tabsList.map((t) => {
              const isSelected = activeTab === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as TabType)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-indigo-50 border border-indigo-100 text-indigo-900 shadow-2xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Tab Content Renders */}
        <div className="flex-grow w-full bg-white border border-slate-200 p-6 rounded-2xl shadow-xs min-h-[400px]">
          
          {/* Workflow Timeline Stepper */}
          {activeTab === 'workflow' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-900">Workflow Timeline</h3>
                <p className="text-xs text-slate-500 mt-0.5">Chronological execution steps for public citizens.</p>
              </div>

              <div className="flex flex-col relative border-l border-slate-200 ml-3 pl-6 gap-6.5 mt-2">
                {serviceWorkflows.length === 0 ? (
                  <div className="text-xs text-slate-400 italic">No workflow steps logged for this service.</div>
                ) : (
                  serviceWorkflows.map((step) => (
                    <div key={step.id} className="relative flex flex-col text-left">
                      {/* Checkpoint Badge */}
                      <span className="absolute -left-7.5 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-2xs">
                        {step.stepNo}
                      </span>
                      
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">{step.stepName}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-4 bg-slate-50/50 border border-slate-200/50 rounded-xl text-xs text-slate-600">
                        <div>
                          <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">Responsible Actor</span>
                          <span className="text-slate-800 font-semibold">{step.actor}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">Location / Department Office</span>
                          <span className="text-slate-800 font-semibold">{step.office}</span>
                        </div>
                        <div className="md:col-span-2 border-t border-slate-200/50 pt-2.5 mt-1">
                          <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">Required Action</span>
                          <span className="text-slate-900 font-medium leading-relaxed">{step.action}</span>
                        </div>
                        <div className="md:col-span-2 mt-1">
                          <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">Portal Interface / Software</span>
                          <span className="text-indigo-600 font-semibold">{step.system || 'None Specified'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Required Documents */}
          {activeTab === 'documents' && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-900">Required Documents</h3>
                <p className="text-xs text-slate-500 mt-0.5">List of files and verification certificates required to process.</p>
              </div>

              <div className="flex flex-col gap-3">
                {serviceDocuments.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-6 text-center">No document requirements logged for this service.</div>
                ) : (
                  serviceDocuments.map((doc) => (
                    <div key={doc.id} className="border border-slate-200 p-4 rounded-xl flex justify-between items-start gap-4 hover:border-indigo-100 transition shadow-2xs">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block leading-tight">{doc.name}</span>
                        <span className="text-[11px] text-slate-500 block mt-1 leading-normal">{doc.purpose || 'Purpose of verification not logged'}</span>
                      </div>
                      <span className={`text-[8.5px] px-2.5 py-0.5 border rounded-full uppercase leading-none font-semibold flex-shrink-0 ${
                        doc.mandatory 
                          ? 'text-red-600 border-red-100 bg-red-50' 
                          : 'text-slate-500 border-slate-200 bg-slate-50'
                      }`}>
                        {doc.mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Responsible Officers */}
          {activeTab === 'officers' && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-900">Responsible Officers</h3>
                <p className="text-xs text-slate-500 mt-0.5">Accountable officers and their operational duties.</p>
              </div>

              <div className="flex flex-col gap-3">
                {serviceOfficers.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-6 text-center">No officer roles logged for this service.</div>
                ) : (
                  serviceOfficers.map((off) => (
                    <div key={off.id} className="border border-slate-200 p-4 rounded-xl flex flex-col gap-2 shadow-2xs hover:border-indigo-100 transition">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-800 font-bold text-xs">{off.role}</span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wide">
                          {off.office}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 leading-relaxed font-normal">{off.responsibility || 'Responsibility profile not specified.'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Locations */}
          {activeTab === 'locations' && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-900">Locations</h3>
                <p className="text-xs text-slate-500 mt-0.5">Physical offices and virtual portals processing this service.</p>
              </div>

              <div className="flex flex-col gap-3">
                {serviceLocations.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-6 text-center">No location details logged.</div>
                ) : (
                  serviceLocations.map((loc) => (
                    <div key={loc.id} className="border border-slate-200 p-4 rounded-xl flex justify-between items-center text-xs shadow-2xs">
                      <div>
                        <span className="text-slate-800 font-bold block">{loc.officeName}</span>
                        <span className="text-[9px] text-slate-400 block uppercase mt-0.5 font-bold tracking-wider">{loc.officeType}</span>
                      </div>
                      <span className="text-indigo-600 font-bold border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                        {loc.level}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Applicable Laws */}
          {activeTab === 'laws' && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-900">Applicable Laws</h3>
                <p className="text-xs text-slate-500 mt-0.5">Legislative backing and governing acts backing this service.</p>
              </div>

              <div className="flex flex-col gap-3">
                {serviceLaws.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-6 text-center">No legal backings logged.</div>
                ) : (
                  serviceLaws.map((law) => (
                    <div key={law.id} className="border border-slate-200 p-4 rounded-xl flex flex-col gap-1.5 shadow-2xs hover:border-indigo-100 transition">
                      <span className="text-slate-800 font-bold text-xs leading-snug">{law.name}</span>
                      <span className="text-xs text-slate-500 leading-relaxed mt-1 font-normal">{law.purpose || 'Legal purposes not logged.'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Outputs */}
          {activeTab === 'outputs' && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-900">Outputs</h3>
                <p className="text-xs text-slate-500 mt-0.5">Certificates or operational licenses generated upon completion.</p>
              </div>

              <div className="flex flex-col gap-3">
                {serviceOutputs.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-6 text-center">No output certificates registered.</div>
                ) : (
                  serviceOutputs.map((out) => (
                    <div key={out.id} className="border border-slate-200 p-4 rounded-xl flex flex-col gap-1.5 shadow-2xs hover:border-indigo-100 transition">
                      <span className="text-indigo-600 font-bold text-xs flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        {out.name}
                      </span>
                      <span className="text-xs text-slate-500 leading-relaxed mt-1 font-normal">{out.description || 'Description not specified.'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
