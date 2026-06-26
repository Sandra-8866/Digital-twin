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

export interface RootRegion {
  id: string;
  name: string;
  type: string;
  csvPath: string;
}

export interface HierarchicalNode {
  id: string;
  name: string;
  type: string;
  children?: HierarchicalNode[];
}

// Centralized Category Colors
export interface ColorMapping {
  color: string;
  bgColor: string;
  iconName: string;
}

export const CATEGORY_COLORS: Record<string, ColorMapping> = {
  country: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200 text-orange-700',
    iconName: 'flag'
  },
  state: {
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    iconName: 'globe'
  },
  ut: {
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 border-teal-200 text-teal-700',
    iconName: 'shield'
  },
  ministry: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200 text-blue-700',
    iconName: 'landmark'
  },
  department: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200 text-amber-700',
    iconName: 'layers'
  },
  office: {
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 border-slate-200 text-slate-700',
    iconName: 'office'
  },
  executive: {
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    iconName: 'executive'
  },
  judiciary: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200 text-purple-700',
    iconName: 'judiciary'
  },
  constitutional: {
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-200 text-rose-700',
    iconName: 'constitutional'
  }
};

// Centralized Category Normalizer
export const normalizeCategory = (category: string, type: string, nodeId: string): string => {
  const cat = (category || '').toLowerCase();
  const t = (type || '').toLowerCase();
  const id = (nodeId || '').toLowerCase();

  if (id === 'india' || cat.includes('country') || t.includes('country')) return 'country';
  if (id === 'kerala' || cat.includes('state') || t.includes('state')) return 'state';
  if (id === 'andaman' || id === 'lakshadweep' || cat.includes('union territory') || cat.includes('ut') || cat.includes('territorial') || t.includes('ut') || t.includes('union territory')) return 'ut';
  
  if (cat.includes('ministry') || t.includes('ministry')) return 'ministry';
  if (cat.includes('department') || t.includes('department')) return 'department';
  if (cat.includes('judiciary') || cat.includes('judicial') || cat.includes('court') || t.includes('judiciary')) return 'judiciary';
  if (cat.includes('constitutional') || cat.includes('legislature') || cat.includes('election') || cat.includes('electoral') || cat.includes('authority') || cat.includes('oversight')) return 'constitutional';
  if (cat.includes('executive') || cat.includes('leadership') || cat.includes('administration') || cat.includes('governance')) return 'executive';
  if (cat.includes('office') || cat.includes('officer') || cat.includes('secretariat') || t.includes('office') || t.includes('agency')) return 'office';

  return 'office'; // default
};

// Helper function to find path to a node recursively
export const findHierarchicalPath = (
  node: HierarchicalNode,
  targetId: string,
  currentPath: HierarchicalNode[] = []
): HierarchicalNode[] | null => {
  const newPath = [...currentPath, node];
  if (node.id === targetId) return newPath;
  if (node.children) {
    for (const child of node.children) {
      const path = findHierarchicalPath(child, targetId, newPath);
      if (path) return path;
    }
  }
  return null;
};

interface GovernanceState {
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
  currentRegion: string;
  viewMode: 'hero' | 'dashboard';
  selectedNodeId: string | null;
  selectedServiceId: string | null;
  expandedNodeIds: string[];
  searchQuery: string;
  logs: TelemetryLog[];

  // Dynamic Root Regions (Level 1)
  rootRegions: RootRegion[];
  activeRegionId: string | null; // null represents the selector page
  activeTreeData: HierarchicalNode | null;
  visibleCategories: Record<string, boolean>;

  // Actions
  initStore: () => Promise<void>;
  loadRegion: (regionId: string) => Promise<void>;
  resetToSelector: () => void;
  setViewMode: (mode: 'hero' | 'dashboard') => void;
  selectNode: (id: string | null) => void;
  selectService: (id: string | null) => void;
  toggleExpandNode: (id: string) => void;
  setSearchQuery: (q: string) => void;
  addLog: (message: string, type?: TelemetryLog['type']) => void;
  resetNavigation: () => void;
  toggleCategory: (category: string) => void;
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

  rootRegions: [],
  activeRegionId: null,
  activeTreeData: null,
  visibleCategories: {
    country: true,
    state: true,
    ut: true,
    ministry: true,
    department: true,
    office: true,
    executive: true,
    judiciary: true,
    constitutional: true
  },

  initStore: async () => {
    set({ loading: true, error: null });
    try {
      const fetchCSV = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Could not load CSV: ${url}`);
        return res.text();
      };

      // 1. Fetch static relationship sheets in parallel
      const [
        servicesCSV,
        workflowsCSV,
        documentsCSV,
        officersCSV,
        locationsCSV,
        lawsCSV,
        outputsCSV,
        rootHierarchyCSV
      ] = await Promise.all([
        fetchCSV('/Data/SERVICES.csv'),
        fetchCSV('/Data/WORKFLOW STEPS.csv'),
        fetchCSV('/Data/DOCUMENTS.csv'),
        fetchCSV('/Data/OFFICERS.csv'),
        fetchCSV('/Data/LOCATIONS.csv'),
        fetchCSV('/Data/LAWS.csv'),
        fetchCSV('/Data/OUTPUTS.csv'),
        fetchCSV('/Data/ROOT_HIERARCHY.csv')
      ]);

      // 2. Parse service relational modules
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

      // 3. Parse Root Hierarchy Regions (Level 1)
      const parsedRegions = parseCSV(rootHierarchyCSV).map((row) => ({
        id: (getVal(row, 'Id') || '').trim(),
        name: (getVal(row, 'Name') || '').trim(),
        type: (getVal(row, 'Type') || '').trim(),
        csvPath: (getVal(row, 'CsvPath') || '').trim()
      })).filter(r => r.id !== '');

      if (parsedRegions.length === 0) {
        throw new Error('No regions found in ROOT_HIERARCHY.csv');
      }

      const rootRegionId = parsedRegions.find(r => r.type === 'country')?.id || parsedRegions[0]?.id;

      set({
        services: parsedServices,
        workflows: parsedWorkflows,
        documents: parsedDocuments,
        officers: parsedOfficers,
        locations: parsedLocations,
        laws: parsedLaws,
        outputs: parsedOutputs,
        rootRegions: parsedRegions,
        activeRegionId: null,
        activeTreeData: null,
        selectedNodeId: null,
        expandedNodeIds: rootRegionId ? [rootRegionId] : [],
        loading: false,
        logs: [
          {
            id: 'init-1',
            timestamp: new Date().toLocaleTimeString(),
            message: `Root Hierarchy loaded. selector page online.`,
            type: 'success'
          }
        ]
      });

    } catch (err: any) {
      set({ error: err.message || 'Error initializing datasets.', loading: false });
    }
  },

  loadRegion: async (regionId) => {
    set({ loading: true, error: null });
    try {
      const { rootRegions } = get();
      const region = rootRegions.find(r => r.id === regionId);
      if (!region) throw new Error(`Region ${regionId} not found in root hierarchy.`);

      // Fetch region CSV dynamically
      const res = await fetch(region.csvPath);
      if (!res.ok) throw new Error(`Could not load region dataset: ${region.csvPath}`);
      const csvText = await res.text();

      // Parse nodes from CSV
      const rawRows = parseCSV(csvText);
      const parsedNodes = rawRows.map((row) => {
        return {
          id: (getVal(row, 'NodeID') || getVal(row, 'Node_ID') || getVal(row, 'Node ID') || '').trim(),
          name: (getVal(row, 'NodeName') || getVal(row, 'Node_Name') || getVal(row, 'Node Name') || '').trim(),
          parentRef: (getVal(row, 'ParentNode') || getVal(row, 'ParentID') || getVal(row, 'Parent_Node') || getVal(row, 'Parent_ID') || getVal(row, 'Parent ID') || '').trim(),
          level: (getVal(row, 'Level') || getVal(row, 'HierarchyLevel') || getVal(row, 'Hierarchy_Level') || '').trim(),
          legend: (getVal(row, 'Category') || getVal(row, 'Legend') || getVal(row, 'Legend/Classification') || getVal(row, 'Legend / Classification') || '').trim(),
          type: (getVal(row, 'Type') || getVal(row, 'NodeType') || getVal(row, 'Node_Type') || '').trim(),
          status: (getVal(row, 'Status') || '').trim(),
          path: (getVal(row, 'Path') || '').trim(),
          parentId: null as string | null
        };
      }).filter(n => n.id !== '');

      if (parsedNodes.length === 0) {
        throw new Error(`No nodes found in region dataset: ${region.name}`);
      }

      // Identify root node
      const rootNode = parsedNodes.find(n => 
        n.level === '1' ||
        n.level === '0' ||
        n.level.toLowerCase() === 'l1' ||
        !n.parentRef || 
        n.parentRef === 'NULL' || 
        n.parentRef === 'None' ||
        n.parentRef === '-' ||
        !parsedNodes.some(other => other.id === n.parentRef || other.name === n.parentRef)
      ) || parsedNodes[0];

      // Resolve parentId mappings
      parsedNodes.forEach((node) => {
        if (node.id === rootNode.id) return;
        const parent = parsedNodes.find(n => n.id === node.parentRef || n.name === node.parentRef);
        if (parent) {
          node.parentId = parent.id;
        } else {
          // Attach to root node directly if parent is not found (orphan fallback)
          node.parentId = rootNode.id;
        }
      });

      // Build hierarchical tree recursively
      const buildTree = (current: typeof parsedNodes[0]): HierarchicalNode => {
        const category = normalizeCategory(current.legend, current.type, current.id);
        const children = parsedNodes.filter(n => n.parentId === current.id);
        return {
          id: current.id,
          name: current.name,
          type: category,
          children: children.map(buildTree)
        };
      };

      const regionTree = buildTree(rootNode);

      // Data-driven region name assignment
      const friendlyRegion = region.name || regionId;

      set({
        nodes: parsedNodes as any, // keep for backward compatibility
        activeRegionId: regionId,
        activeTreeData: regionTree,
        selectedNodeId: rootNode.id, // select root node by default
        expandedNodeIds: [rootNode.id], // expand root node by default
        currentRegion: friendlyRegion,
        loading: false
      });

      get().addLog(`Switched focus to ${region.name} organization chart.`, 'success');

    } catch (err: any) {
      set({ error: err.message || 'Error loading region dataset.', loading: false });
    }
  },

  resetToSelector: () => {
    const { rootRegions } = get();
    const rootRegionId = rootRegions.find(r => r.type === 'country')?.id || rootRegions[0]?.id;
    set({
      activeRegionId: null,
      activeTreeData: null,
      selectedNodeId: null,
      expandedNodeIds: rootRegionId ? [rootRegionId] : []
    });
    get().addLog('Reset layout to Regional Hierarchy Selector.', 'info');
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  selectNode: (id) => {
    const { activeRegionId, rootRegions } = get();
    if (id === null) {
      set({ selectedNodeId: null });
      return;
    }

    if (activeRegionId === null) {
      // Level 1: user clicked a region in the selector
      // Load that region's CSV and show its chart!
      const regionExists = rootRegions.some(r => r.id === id);
      if (regionExists) {
        get().loadRegion(id);
      }
    } else {
      // Level 2: user clicked a node card in the active chart
      set({ selectedNodeId: id });
      const node = get().nodes.find(n => n.id === id);
      if (node) {
        get().addLog(`Selected node: ${node.name} (${node.level})`, 'info');
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
    get().resetToSelector();
  },

  toggleCategory: (category) => {
    set((state) => {
      const nextVisible = {
        ...state.visibleCategories,
        [category]: !state.visibleCategories[category]
      };
      
      const isVisible = nextVisible[category];
      const categoryName = category.toUpperCase();
      const message = isVisible 
        ? `Restored ${categoryName} nodes to the organization chart.` 
        : `Filtered out ${categoryName} nodes. Reorganizing active hierarchy...`;
      
      const newLog: TelemetryLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        message,
        type: isVisible ? 'success' : 'info'
      };

      return {
        visibleCategories: nextVisible,
        logs: [newLog, ...state.logs].slice(0, 40)
      };
    });
  }
}));

// Pure tree-filtering algorithm for dynamic organization chart reorganization
export const getFilteredTree = (
  node: HierarchicalNode | null,
  visibleCategories: Record<string, boolean>
): HierarchicalNode | null => {
  if (!node) return null;

  const isVisible = visibleCategories[node.type] !== false;

  if (isVisible) {
    const filteredChildren: HierarchicalNode[] = [];
    
    if (node.children) {
      for (const child of node.children) {
        const processed = getFilteredTree(child, visibleCategories);
        if (processed) {
          filteredChildren.push(processed);
        } else {
          // If child is hidden, pull up its nearest visible descendants
          const descendants = getVisibleDescendants(child, visibleCategories);
          filteredChildren.push(...descendants);
        }
      }
    }

    return {
      ...node,
      children: filteredChildren
    };
  } else {
    return null;
  }
};

// Recursively gather the closest visible descendant nodes of a hidden node
export const getVisibleDescendants = (
  node: HierarchicalNode,
  visibleCategories: Record<string, boolean>
): HierarchicalNode[] => {
  const isVisible = visibleCategories[node.type] !== false;
  if (isVisible) {
    const processed = getFilteredTree(node, visibleCategories);
    return processed ? [processed] : [];
  } else {
    const descendants: HierarchicalNode[] = [];
    if (node.children) {
      for (const child of node.children) {
        descendants.push(...getVisibleDescendants(child, visibleCategories));
      }
    }
    return descendants;
  }
};
