export type EntityId = string;

export type InventoryItem = {
  id: EntityId;
  sku: string;
  name: string;
  unit: "pcs" | "m" | "sheet" | "kg";
  onHand: number;
  reorderPoint: number;
  updatedAt: string;
};

export type WorkOrder = {
  id: EntityId;
  code: string;
  client: string;
  itemId: EntityId;
  quantity: number;
  dueDate: string;
  status: "queued" | "in_progress" | "done";
  updatedAt: string;
};

export type ScanEvent = {
  id: EntityId;
  itemId: EntityId;
  delta: number;
  source: "qr_scan" | "manual";
  createdAt: string;
};

export type QuoteRequest = {
  id: EntityId;
  customerName: string;
  phone: string;
  email: string;
  productType: string;
  material: string;
  thickness: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  artworkStatus: "vector" | "image" | "design_help";
  deadline: string;
  notes: string;
  estimateLow: number;
  estimateHigh: number;
  readinessScore: number;
  riskFlags: string[];
  recommendedNextStep: string;
  createdAt: string;
};

export type InternshipApplication = {
  id: EntityId;
  name: string;
  phone: string;
  email: string;
  area: string;
  motivation: string;
  existingSkills: string;
  availability: string;
  createdAt: string;
};

export type SimulationRun = {
  id: EntityId;
  jobTitle: string;
  material: string;
  power: number;
  speed: number;
  focus: number;
  passes: number;
  airAssist: boolean;
  price: number;
  outcome: "clean" | "burn" | "failed";
  score: number;
  createdAt: string;
};

export type TrainingStats = {
  cash: number;
  reputation: number;
  machineHealth: number;
  clientTrust: number;
  skill: number;
};

export type SyncOperation = {
  id: EntityId;
  type:
    | "UPSERT_ITEM"
    | "UPSERT_ORDER"
    | "ADD_SCAN"
    | "ADD_QUOTE_REQUEST"
    | "ADD_INTERNSHIP_APPLICATION"
    | "ADD_SIMULATION_RUN"
    | "SAVE_TRAINING";
  payload: unknown;
  createdAt: string;
};

export type Snapshot = {
  items: InventoryItem[];
  orders: WorkOrder[];
  scans: ScanEvent[];
  quoteRequests: QuoteRequest[];
  internshipApplications: InternshipApplication[];
  simulationRuns: SimulationRun[];
  training: TrainingStats;
  queue: SyncOperation[];
};

export type Connector = {
  key: string;
  label: string;
  send: (ops: SyncOperation[]) => Promise<{ sent: number; remoteRef: string }>;
};
