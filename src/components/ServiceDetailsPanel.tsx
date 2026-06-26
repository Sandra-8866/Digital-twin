import React, { useState } from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import { Layers, FileText, UserCheck, MapPin, Scale, Package, Clock, DollarSign } from 'lucide-react';

type TabType = 'workflow' | 'documents' | 'officers' | 'laws' | 'locations' | 'outputs';

const getServiceMetadata = (serviceId: string) => {
  switch (serviceId) {
    case 'S001': // Property Registration
      return { fees: '1% of property value (max ₹50,000) + 2% stamp duty', processingTime: '15 working days', relatedForms: 'Form 1 (Registration Application), Form 32A (Stamp Duty Declaration)' };
    case 'S002': // Trade License
      return { fees: '₹1,500 - ₹5,000 (dependent on business scale)', processingTime: '7-10 working days', relatedForms: 'Form I (Trade License Application), Form II (Site Declaration)' };
    case 'S003': // Building Permit
      return { fees: '₹2,000 application fee + site inspection charges', processingTime: '30 working days', relatedForms: 'Form A (Building Permit Application), Technical Specification Sheet' };
    case 'S004': // Company Registration
      return { fees: '₹1,000 registration fee + stamp duty (state-dependent)', processingTime: '5-7 working days', relatedForms: 'SPICe+ (Form INC-32), e-MOA (INC-33), e-AOA (INC-34)' };
    case 'S005': // GST Registration
      return { fees: 'Free (Government Portal)', processingTime: '3-5 working days', relatedForms: 'Form GST REG-01 (Application), Form GST REG-06 (Certificate)' };
    case 'S006': // UDYAM Registration
      return { fees: 'Free (Government Portal)', processingTime: 'Instant (1-2 days processing)', relatedForms: 'UDYAM Online Registration Form' };
    case 'S007': // Fire NOC
      return { fees: '₹500 application fee + inspection cost', processingTime: '15 working days', relatedForms: 'Form A (Fire Safety Declaration), NOC Request Sheet' };
    case 'S008': // Pollution Clearance
      return { fees: '₹10,000 (dependent on industry category - Red/Orange/Green)', processingTime: '45 working days', relatedForms: 'Form I (Consent to Establish/Operate), Environmental Compliance Report' };
    case 'S009': // Factory License
      return { fees: '₹2,500 - ₹15,000 (dependent on worker count & power load)', processingTime: '30 working days', relatedForms: 'Form No. 2 (License Application), Factory Compliance Checklist' };
    case 'S010': // Electricity Connection
      return { fees: '₹1,200 installation charges + security deposit', processingTime: '7 working days', relatedForms: 'Form A (New Electrical Service Request), Wiring Diagram Layout' };
    case 'S011': // Water Connection
      return { fees: '₹800 installation charges + security deposit', processingTime: '10 working days', relatedForms: 'Form W-1 (Water Supply Connection Request), Property Tax Receipt' };
    case 'S012': // FSSAI License
      return { fees: '₹2,000 - ₹5,000 (dependent on food business turnover)', processingTime: '15-20 working days', relatedForms: 'Form B (FSSAI Licensing Application), Food Safety Declaration' };
    case 'S013': // Shop & Establishment Registration
      return { fees: '₹500 - ₹2,500 (dependent on employee count)', processingTime: '5 working days', relatedForms: 'Form A (Shop Registration Application), Rent/Deed Agreement' };
    default:
      return { fees: '₹500 standard administrative charges', processingTime: '10-15 working days', relatedForms: 'Standard Service Request Form, ID Proof Checklist' };
  }
};

export const ServiceDetailsPanel: React.FC = () => {
  const {
    services,
    workflows,
    documents,
    officers,
    locations,
    laws,
    outputs,
    selectedServiceId,
    selectService
  } = useGovernanceStore();

  const [activeTab, setActiveTab] = useState<TabType>('workflow');

  // Resolve selected service details
  const activeService = services.find(s => s.id === selectedServiceId) || null;
  const metadata = activeService ? getServiceMetadata(activeService.id) : null;

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

  // Tab configurations
  const tabsList = [
    { key: 'workflow', label: 'Workflow steps', icon: Layers },
    { key: 'documents', label: 'Required Documents', icon: FileText },
    { key: 'officers', label: 'Responsible Officers', icon: UserCheck },
    { key: 'laws', label: 'Governing Laws', icon: Scale },
    { key: 'locations', label: 'Office Locations', icon: MapPin },
    { key: 'outputs', label: 'Service Outputs', icon: Package }
  ];

  return (
    <div className="w-full bg-white border border-slate-200 p-6 md:p-8 rounded-2xl flex flex-col gap-6 shadow-xs min-h-[500px] animate-fade-in text-left">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <h2 className="text-xs font-bold text-slate-800 tracking-widest uppercase flex items-center gap-1.5 leading-none">
          <Layers className="w-4 h-4 text-indigo-600" />
          Citizen Services
        </h2>
        {activeService && (
          <button
            onClick={() => selectService(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold cursor-pointer transition shadow-3xs"
          >
            Back to Department
          </button>
        )}
      </div>

      {activeService ? (
        // Active Service Workflow & Details Tab Matrix
        <div className="flex-grow flex flex-col gap-5 overflow-hidden">
          {/* Service Title & Description block */}
          <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl">
            <span className="text-[10px] text-[#ff9933] font-extrabold uppercase tracking-widest block">
              Public Service Registry
            </span>
            <h3 className="text-base font-extrabold text-[#0f2942] leading-snug mt-1">{activeService.name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-2 font-medium">{activeService.description}</p>
          </div>

          {/* Key Highlights Grid */}
          {metadata && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Processing Time</span>
                  <span className="text-xs font-bold text-slate-700 block mt-1 leading-none">{metadata.processingTime}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Estimated Fees</span>
                  <span className="text-xs font-bold text-slate-700 block mt-1 leading-none">{metadata.fees}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Responsible Office</span>
                  <span className="text-xs font-bold text-slate-700 block mt-1 leading-none truncate" title={activeService.office || activeService.department}>
                    {activeService.office || activeService.department}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Related Forms block */}
          {metadata && (
            <div className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl text-xs text-slate-600 leading-relaxed font-semibold">
              <span className="text-[9px] text-emerald-700 font-extrabold uppercase tracking-widest block mb-1">Related Application Forms</span>
              {metadata.relatedForms}
            </div>
          )}

          {/* Tab Swappers */}
          <div className="flex border-b border-slate-200/60 pb-0.5 text-xs overflow-x-auto gap-4 no-scrollbar">
            {tabsList.map((t) => {
              const isSelected = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as TabType)}
                  className={`pb-2 px-1 border-b-2 transition duration-150 cursor-pointer flex-shrink-0 font-bold ${
                    isSelected
                      ? 'border-[#ff9933] text-[#0f2942]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab Contents View */}
          <div className="flex-grow overflow-y-auto max-h-[580px] pr-1 scrollbar-thin rounded-xl">
            
            {/* Tab 1: Workflow Timeline */}
            {activeTab === 'workflow' && (
              <div className="flex flex-col relative border-l-2 border-slate-100 ml-3 pl-6 gap-6 pt-1 text-left">
                {serviceWorkflows.length === 0 ? (
                  <div className="text-xs text-slate-400 italic">No workflow steps catalogued.</div>
                ) : (
                  serviceWorkflows.map((step) => (
                    <div key={step.id} className="relative flex flex-col text-left">
                      {/* Stepper checkpoint circle */}
                      <span className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-[#0f2942] border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-3xs">
                        {step.stepNo}
                      </span>
                      
                      <span className="text-xs font-extrabold text-slate-800 leading-tight">{step.stepName}</span>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1.5 font-medium">
                        {step.actor} performs <span className="text-[#ff9933] font-semibold">{step.action.toLowerCase()}</span> at {step.office} {step.system ? `using ${step.system}` : ''}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Document Requirements */}
            {activeTab === 'documents' && (
              <div className="flex flex-col gap-3">
                {serviceDocuments.length === 0 ? (
                  <div className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">No documents required.</div>
                ) : (
                  serviceDocuments.map((doc) => (
                    <div key={doc.id} className="border border-slate-100 bg-slate-50/40 p-4 rounded-2xl flex justify-between items-start gap-4 hover:bg-slate-50 transition duration-150">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block leading-tight">{doc.name}</span>
                        <span className="text-[11px] text-slate-500 block mt-1.5 leading-relaxed font-medium">{doc.purpose}</span>
                      </div>
                      <span className={`text-[8.5px] px-2.5 py-1 border rounded-full uppercase leading-none font-bold tracking-wider flex-shrink-0 ${
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
            )}

            {/* Tab 3: Officers Roster */}
            {activeTab === 'officers' && (
              <div className="flex flex-col gap-3">
                {serviceOfficers.length === 0 ? (
                  <div className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">No officers listed.</div>
                ) : (
                  serviceOfficers.map((off) => (
                    <div key={off.id} className="border border-slate-100 bg-slate-50/40 p-4 rounded-2xl hover:bg-slate-50 transition duration-150">
                      <div className="flex justify-between border-b border-slate-200/50 pb-2 mb-2 font-bold">
                        <span className="text-slate-800 text-xs">{off.role}</span>
                        <span className="text-indigo-600 text-[10px] uppercase tracking-wider">{off.office}</span>
                      </div>
                      <span className="text-slate-500 text-xs block leading-relaxed font-medium">{off.responsibility}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 4: Laws */}
            {activeTab === 'laws' && (
              <div className="flex flex-col gap-3">
                {serviceLaws.length === 0 ? (
                  <div className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">No governing laws listed.</div>
                ) : (
                  serviceLaws.map((law) => (
                    <div key={law.id} className="border border-slate-100 bg-slate-50/40 p-4 rounded-2xl hover:bg-slate-50 transition duration-150">
                      <span className="text-slate-800 font-bold block leading-tight text-xs">{law.name}</span>
                      <span className="text-slate-500 text-xs block mt-1.5 leading-relaxed font-medium">{law.purpose}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 5: Locations */}
            {activeTab === 'locations' && (
              <div className="flex flex-col gap-3">
                {serviceLocations.length === 0 ? (
                  <div className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">No locations listed.</div>
                ) : (
                  serviceLocations.map((loc) => (
                    <div key={loc.id} className="border border-slate-100 bg-slate-50/40 p-4 rounded-2xl flex justify-between items-center text-xs hover:bg-slate-50 transition duration-150">
                      <div>
                        <span className="text-slate-800 font-bold block">{loc.officeName}</span>
                        <span className="text-slate-400 text-[8.5px] block uppercase mt-1 font-bold tracking-wider">{loc.officeType}</span>
                      </div>
                      <span className="text-indigo-600 font-bold border border-indigo-100 bg-indigo-50 px-2.5 py-1 rounded-full text-[9px] tracking-wide uppercase">
                        {loc.level}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 6: Outputs */}
            {activeTab === 'outputs' && (
              <div className="flex flex-col gap-3">
                {serviceOutputs.length === 0 ? (
                  <div className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">No output documents listed.</div>
                ) : (
                  serviceOutputs.map((out) => (
                    <div key={out.id} className="border border-slate-100 bg-slate-50/40 p-4 rounded-2xl hover:bg-slate-50 transition duration-150">
                      <span className="text-indigo-600 font-bold block leading-tight text-xs">{out.name}</span>
                      <span className="text-slate-500 text-xs block mt-1.5 leading-relaxed font-medium">{out.description}</span>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      ) : (
        /* Placeholder */
        <div className="flex-grow flex flex-col justify-center items-center text-center p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Layers className="w-12 h-12 text-slate-300 mb-4 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Select a Service</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
            Please click on any citizen service listed in the department directories to inspect its workflow checkpoints, document templates, and regulatory rules.
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailsPanel;
