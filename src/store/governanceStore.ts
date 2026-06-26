import { create } from 'zustand';

// Reusable administrative node model
export interface GovNode {
  id: string;
  name: string;
  parentId: string | null;
  level: string;
  legend: string;
  type: string;
  status: string;
  path: string;
}

// Services and relational modules
export interface GovService {
  id: string;
  name: string;
  department: string;
  office: string;
  description: string;
}

export interface WorkflowStep {
  id: string;
  serviceId: string;
  stepNo: number;
  stepName: string;
  actor: string;
  office: string;
  action: string;
  system: string;
}

export interface DocumentRequirement {
  id: string;
  serviceId: string;
  name: string;
  mandatory: boolean;
  purpose: string;
}

export interface OfficerRoster {
  id: string;
  serviceId: string;
  role: string;
  office: string;
  responsibility: string;
}

export interface ServiceLocation {
  id: string;
  serviceId: string;
  officeName: string;
  officeType: string;
  level: string;
}

export interface GoverningLaw {
  id: string;
  serviceId: string;
  name: string;
  purpose: string;
}

export interface ServiceOutput {
  id: string;
  serviceId: string;
  name: string;
  description: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

interface GovernanceState {
  // Abstraction layers
  nodes: GovNode[];
  services: GovService[];
  workflows: WorkflowStep[];
  documents: DocumentRequirement[];
  officers: OfficerRoster[];
  locations: ServiceLocation[];
  laws: GoverningLaw[];
  outputs: ServiceOutput[];

  loading: boolean;
  error: string | null;

  // Active navigation settings
  currentRegion: 'india' | 'Kerala' | 'Andaman & Nicobar Islands' | 'lakshadweep';
  viewMode: 'hero' | 'dashboard';
  selectedNodeId: string | null;
  selectedServiceId: string | null;
  expandedNodeIds: string[];
  searchQuery: string;
  logs: TelemetryLog[];

  // Actions
  initStore: () => Promise<void>;
  loadRegion: (region: GovernanceState['currentRegion']) => Promise<void>;
  setViewMode: (mode: 'hero' | 'dashboard') => void;
  selectNode: (id: string | null) => void;
  selectService: (id: string | null) => void;
  toggleExpandNode: (id: string) => void;
  setSearchQuery: (q: string) => void;
  addLog: (message: string, type?: TelemetryLog['type']) => void;
  resetNavigation: () => void;
}

// Robust CSV parser supporting quotes with commas
export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(val => val.replace(/^["']|["']$/g, '').trim());
};

export const parseCSV = (content: string): Record<string, string>[] => {
  const lines = content.split(/\r\n|\r|\n/).filter(l => l.trim() !== "");
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]);
  const result: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === "")) continue;
    const rowObj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      rowObj[header] = values[idx] || '';
    });
    result.push(rowObj);
  }
  return result;
};

// Tolerant key-value retriever to resolve spacing/casing variations in headers
const normalizeKey = (key: string): string => {
  return key.toLowerCase().replace(/[\s_-]+/g, '');
};

const getVal = (row: Record<string, string>, searchKey: string): string => {
  const normSearch = normalizeKey(searchKey);
  const foundKey = Object.keys(row).find(k => normalizeKey(k) === normSearch);
  return foundKey ? row[foundKey] : '';
};

export const useGovernanceStore = create<GovernanceState>((set, get) => ({
  nodes: [],
  services: [],
  workflows: [],
  documents: [],
  officers: [],
  locations: [],
  laws: [],
  outputs: [],
  
  loading: false,
  error: null,
  
  viewMode: 'hero',
  currentRegion: 'india',
  selectedNodeId: null,
  selectedServiceId: null,
  expandedNodeIds: [],
  searchQuery: '',
  logs: [],

  initStore: async () => {
    set({ loading: true, error: null });
    try {
      // 1. Fetch all static service relationship CSVs and all region CSVs in parallel
      const fetchCSV = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Could not load CSV: ${url}`);
        return res.text();
      };

      const [
        servicesCSV,
        workflowsCSV,
        documentsCSV,
        officersCSV,
        locationsCSV,
        lawsCSV,
        outputsCSV,
        indiaCSV,
        keralaCSV,
        andamanCSV,
        lakshadweepCSV
      ] = await Promise.all([
        fetchCSV('/Data/SERVICES.csv'),
        fetchCSV('/Data/WORKFLOW STEPS.csv'),
        fetchCSV('/Data/DOCUMENTS.csv'),
        fetchCSV('/Data/OFFICERS.csv'),
        fetchCSV('/Data/LOCATIONS.csv'),
        fetchCSV('/Data/LAWS.csv'),
        fetchCSV('/Data/OUTPUTS.csv'),
        fetchCSV('/Data/india.csv'),
        fetchCSV('/Data/Kerala.csv'),
        fetchCSV('/Data/Andaman & Nicobar Islands.csv'),
        fetchCSV('/Data/lakshadweep.csv')
      ]);

      // 2. Parse datasets into structured arrays using normalizer
      const parsedServices = parseCSV(servicesCSV).map((row) => ({
        id: getVal(row, 'ServiceID') || getVal(row, 'Service_ID'),
        name: getVal(row, 'ServiceName') || getVal(row, 'Service_Name'),
        department: getVal(row, 'Department'),
        office: getVal(row, 'Office'),
        description: getVal(row, 'Description')
      }));

      const parsedWorkflows = parseCSV(workflowsCSV).map((row) => ({
        id: getVal(row, 'StepID') || getVal(row, 'Step_ID'),
        serviceId: getVal(row, 'ServiceID') || getVal(row, 'Service_ID'),
        stepNo: parseInt(getVal(row, 'StepNo') || getVal(row, 'Step_No') || '0', 10),
        stepName: getVal(row, 'StepName') || getVal(row, 'Step_Name'),
        actor: getVal(row, 'Actor'),
        office: getVal(row, 'Office'),
        action: getVal(row, 'Action'),
        system: getVal(row, 'System')
      }));

      const parsedDocuments = parseCSV(documentsCSV).map((row) => ({
        id: getVal(row, 'DocumentID') || getVal(row, 'Document_ID'),
        serviceId: getVal(row, 'ServiceID') || getVal(row, 'Service_ID'),
        name: getVal(row, 'DocumentName') || getVal(row, 'Document_Name'),
        mandatory: (getVal(row, 'Mandatory') || '').toLowerCase().startsWith('y'),
        purpose: getVal(row, 'Purpose')
      }));

      const parsedOfficers = parseCSV(officersCSV).map((row) => ({
        id: getVal(row, 'OfficerID') || getVal(row, 'Officer_ID'),
        serviceId: getVal(row, 'ServiceID') || getVal(row, 'Service_ID'),
        role: getVal(row, 'OfficerRole') || getVal(row, 'Officer_Role'),
        office: getVal(row, 'Office'),
        responsibility: getVal(row, 'Responsibility')
      }));

      const parsedLocations = parseCSV(locationsCSV).map((row) => ({
        id: getVal(row, 'LocationID') || getVal(row, 'Location_ID'),
        serviceId: getVal(row, 'ServiceID') || getVal(row, 'Service_ID'),
        officeName: getVal(row, 'OfficeName') || getVal(row, 'Office_Name'),
        officeType: getVal(row, 'OfficeType') || getVal(row, 'Office_Type'),
        level: getVal(row, 'Level')
      }));

      const parsedLaws = parseCSV(lawsCSV).map((row) => ({
        id: getVal(row, 'LawID') || getVal(row, 'Law_ID'),
        serviceId: getVal(row, 'ServiceID') || getVal(row, 'Service_ID'),
        name: getVal(row, 'LawName') || getVal(row, 'Law_Name'),
        purpose: getVal(row, 'Purpose')
      }));

      const parsedOutputs = parseCSV(outputsCSV).map((row) => ({
        id: getVal(row, 'OutputID') || getVal(row, 'Output_ID'),
        serviceId: getVal(row, 'ServiceID') || getVal(row, 'Service_ID'),
        name: getVal(row, 'OutputName') || getVal(row, 'Output_Name'),
        description: getVal(row, 'Description')
      }));

      // Helper function to resolve state root for any node ID
      const getRootIdForNode = (nodeId: string): string => {
        const id = nodeId.toUpperCase();
        if (id.startsWith('KER') || id.startsWith('GOV') || id.startsWith('LEG') || id.startsWith('JUD') || id.startsWith('EXEC') || id.startsWith('ELEC') || id.startsWith('OVS') || id.startsWith('REG') || id.startsWith('DEV') || id.startsWith('ECO') || id.startsWith('LSG') || id.startsWith('PSC') || id.startsWith('LOK') || id.startsWith('HRC') || id.startsWith('PWD') || id.startsWith('HLT')) {
          return 'KER001';
        }
        if (id.startsWith('IND_ANI') || id.startsWith('ND_ANI')) {
          return 'IND_ANI_001';
        }
        if (id.startsWith('IND_LKD') || id.startsWith('IND_POI') || id.startsWith('IND_MHA') || id.startsWith('IND_ADM') || id.startsWith('IND_ADV') || id.startsWith('IND_SEC') || id.startsWith('IND_PSH') || id.startsWith('IND_FIN') || id.startsWith('IND_HOM') || id.startsWith('IND_POL') || id.startsWith('IND_MP') || id.startsWith('IND_PS') || id.startsWith('IND_SRD') || id.startsWith('IND_REV') || id.startsWith('IND_DM') || id.startsWith('IND_COL') || id.startsWith('IND_SDO') || id.startsWith('IND_DC') || id.startsWith('IND_SPA') || id.startsWith('IND_DOP') || id.startsWith('IND_KAV') || id.startsWith('IND_KIL') || id.startsWith('IND_MIN') || id.startsWith('IND_SOD') || id.startsWith('IND_PWR') || id.startsWith('IND_EDU') || id.startsWith('IND_PSA') || id.startsWith('IND_FIS') || id.startsWith('IND_HEA') || id.startsWith('IND_TOU') || id.startsWith('IND_ENV') || id.startsWith('IND_AGR') || id.startsWith('IND_PWD') || id.startsWith('IND_AH') || id.startsWith('IND_IT') || id.startsWith('IND_IND') || id.startsWith('IND_LAB') || id.startsWith('IND_ELE') || id.startsWith('IND_PAO') || id.startsWith('IND_PRS') || id.startsWith('IND_IRB') || id.startsWith('IND_JUD') || id.startsWith('IND_DSC') || id.startsWith('IND_SUB') || id.startsWith('IND_PSU') || id.startsWith('IND_LDC') || id.startsWith('D_DP_001')) {
          return 'IND_LKD_001';
        }
        return 'IND_GOI_001';
      };

      const parseRegionNodes = (csvText: string): GovNode[] => {
        const rawRows = parseCSV(csvText);
        return rawRows.map((row) => {
          return {
            id: (getVal(row, 'NodeID') || getVal(row, 'Node_ID') || '').trim(),
            name: (getVal(row, 'NodeName') || getVal(row, 'Node_Name') || '').trim(),
            parentRef: (getVal(row, 'ParentNode') || getVal(row, 'ParentID') || getVal(row, 'Parent_Node') || getVal(row, 'Parent_ID') || '').trim(),
            level: (getVal(row, 'Level') || getVal(row, 'HierarchyLevel') || getVal(row, 'Hierarchy_Level') || '').trim(),
            legend: (getVal(row, 'Category') || getVal(row, 'Legend') || getVal(row, 'Legend/Classification') || getVal(row, 'Legend / Classification') || '').trim(),
            type: (getVal(row, 'Type') || getVal(row, 'NodeType') || getVal(row, 'Node_Type') || '').trim(),
            status: (getVal(row, 'Status') || '').trim(),
            path: (getVal(row, 'Path') || '').trim(),
            parentId: null
          };
        }).filter(n => 
          n.id !== '' && 
          !n.id.toLowerCase().includes('truncated') && 
          !n.name.toLowerCase().includes('truncated') &&
          !n.id.toLowerCase().includes('note:') &&
          !n.name.toLowerCase().includes('note:')
        );
      };

      // 3. Assemble all nodes, starting with virtual country root node
      const allNodes: GovNode[] = [
        {
          id: 'INDIA_ROOT',
          name: 'India',
          parentId: null,
          level: 'L0',
          legend: 'Country',
          type: 'Root',
          status: 'P',
          path: 'India'
        },
        ...parseRegionNodes(indiaCSV),
        ...parseRegionNodes(keralaCSV),
        ...parseRegionNodes(andamanCSV),
        ...parseRegionNodes(lakshadweepCSV)
      ];

      // 4. Resolve parentIds mapping dynamically, generating virtual parent nodes for truncated nodes
      const virtualNodesMap = new Map<string, GovNode>();

      allNodes.forEach((node) => {
        if (node.id === 'INDIA_ROOT') return;

        // Connect file roots directly to INDIA_ROOT
        if (node.id === 'IND_GOI_001' || node.id === 'KER001' || node.id === 'IND_ANI_001' || node.id === 'IND_LKD_001') {
          node.parentId = 'INDIA_ROOT';
          return;
        }

        const ref = (node as any).parentRef;
        if (!ref || ref === 'NULL' || ref === 'None' || ref === '-' || ref === '') {
          node.parentId = getRootIdForNode(node.id);
        } else {
          const parent = allNodes.find(n => n.id === ref || n.name === ref);
          if (parent) {
            node.parentId = parent.id;
          } else {
            // Parent is missing (likely truncated)! Create a virtual placeholder node
            const virtualId = `VIRTUAL_${ref.replace(/\s+/g, '_')}`;
            if (!virtualNodesMap.has(virtualId)) {
              virtualNodesMap.set(virtualId, {
                id: virtualId,
                name: ref,
                parentId: getRootIdForNode(node.id),
                level: 'L5',
                legend: 'Department',
                type: 'Department',
                status: 'P',
                path: ''
              });
            }
            node.parentId = virtualId;
          }
        }
      });

      // Combine parsed nodes with virtual placeholders
      const finalNodes = [...allNodes, ...Array.from(virtualNodesMap.values())];

      // Store in memory
      set({
        services: parsedServices,
        workflows: parsedWorkflows,
        documents: parsedDocuments,
        officers: parsedOfficers,
        locations: parsedLocations,
        laws: parsedLaws,
        outputs: parsedOutputs,
        nodes: finalNodes,
        loading: false,
        logs: [
          {
            id: 'init-1',
            timestamp: new Date().toLocaleTimeString(),
            message: `Abstraction layer online. ${finalNodes.length} nodes loaded, including ${virtualNodesMap.size} restored structures.`,
            type: 'success'
          }
        ]
      });

      // 5. Load default region 'india'
      await get().loadRegion('india');

    } catch (err: any) {
      set({ error: err.message || 'Error initializing datasets.', loading: false });
    }
  },

  loadRegion: async (region) => {
    set({ currentRegion: region, selectedServiceId: null });
    
    // Focus navigation on region root node when switching region
    let activeNodeId: string | null = null;
    let expanded: string[] = [];
    if (region === 'india') {
      activeNodeId = 'INDIA_ROOT';
      expanded = ['INDIA_ROOT', 'IND_GOI_001'];
    } else if (region === 'Kerala') {
      activeNodeId = 'KER001';
      expanded = ['KER001'];
    } else if (region === 'Andaman & Nicobar Islands') {
      activeNodeId = 'IND_ANI_001';
      expanded = ['IND_ANI_001'];
    } else if (region === 'lakshadweep') {
      activeNodeId = 'IND_LKD_001';
      expanded = ['IND_LKD_001'];
    }

    set({ 
      selectedNodeId: activeNodeId,
      expandedNodeIds: expanded
    });
    
    get().addLog(`Switched focus to ${region} workspace`, 'success');
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  selectNode: (id) => {
    set({ selectedNodeId: id, selectedServiceId: null });
    if (id) {
      const node = get().nodes.find(n => n.id === id);
      if (node) {
        get().addLog(`Navigated to administrative node: ${node.name} (${node.level})`, 'info');
        
        // Ensure parent is expanded so node is visible in sidebar tree
        const expandPath: string[] = [];
        let curr = node;
        while (curr && curr.parentId) {
          expandPath.push(curr.parentId);
          const parent = get().nodes.find(n => n.id === curr.parentId);
          curr = parent!;
        }
        
        if (expandPath.length > 0) {
          const currentExpanded = new Set(get().expandedNodeIds);
          expandPath.forEach(pid => currentExpanded.add(pid));
          set({ expandedNodeIds: Array.from(currentExpanded) });
        }
      }
    }
  },

  selectService: (id) => {
    set({ selectedServiceId: id });
    if (id) {
      const service = get().services.find(s => s.id === id);
      if (service) {
        get().addLog(`Selected service: ${service.name}. Retrieving workflow relationships...`, 'info');
      }
    }
  },

  toggleExpandNode: (id) => {
    const current = get().expandedNodeIds;
    if (current.includes(id)) {
      set({ expandedNodeIds: current.filter(nid => nid !== id) });
    } else {
      set({ expandedNodeIds: [...current, id] });
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),

  addLog: (message, type = 'info') => {
    const newLog: TelemetryLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    set((state) => ({
      logs: [newLog, ...state.logs].slice(0, 40)
    }));
  },

  resetNavigation: () => {
    set({ selectedNodeId: null, selectedServiceId: null, searchQuery: '' });
    // Keep root nodes expanded
    const rootNodes = get().nodes.filter(n => n.parentId === null);
    set({ expandedNodeIds: rootNodes.map(n => n.id) });
    get().addLog('Reset explorer navigation to root overview.', 'info');
  }
}));
