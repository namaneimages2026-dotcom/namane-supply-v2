import { seedItems, seedOrders } from "../data/materials";
import {
  InternshipApplication,
  InventoryItem,
  QuoteRequest,
  ScanEvent,
  SimulationRun,
  Snapshot,
  SyncOperation,
  TrainingStats,
  WorkOrder
} from "../types";

const STORAGE_KEY = "namane-supply-os.snapshot.v3";

const now = () => new Date().toISOString();
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const initialState: Snapshot = {
  items: seedItems,
  orders: seedOrders,
  scans: [],
  quoteRequests: [],
  internshipApplications: [],
  simulationRuns: [],
  training: { cash: 3500, reputation: 72, machineHealth: 85, clientTrust: 70, skill: 45 },
  queue: []
};

export const readSnapshot = (): Snapshot => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialState;
  try {
    return { ...initialState, ...(JSON.parse(raw) as Partial<Snapshot>) };
  } catch {
    return initialState;
  }
};

export const writeSnapshot = (snapshot: Snapshot) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

const appendQueue = (snapshot: Snapshot, type: SyncOperation["type"], payload: unknown): Snapshot => ({
  ...snapshot,
  queue: [...snapshot.queue, { id: uid(), type, payload, createdAt: now() }]
});

export const upsertItem = (snapshot: Snapshot, draft: Omit<InventoryItem, "updatedAt">): Snapshot => {
  const item: InventoryItem = { ...draft, updatedAt: now() };
  const next = snapshot.items.some((i) => i.id === item.id)
    ? snapshot.items.map((i) => (i.id === item.id ? item : i))
    : [...snapshot.items, item];
  return appendQueue({ ...snapshot, items: next }, "UPSERT_ITEM", item);
};

export const upsertOrder = (snapshot: Snapshot, order: Omit<WorkOrder, "updatedAt">): Snapshot => {
  const record: WorkOrder = { ...order, updatedAt: now() };
  const next = snapshot.orders.some((o) => o.id === record.id)
    ? snapshot.orders.map((o) => (o.id === record.id ? record : o))
    : [...snapshot.orders, record];
  return appendQueue({ ...snapshot, orders: next }, "UPSERT_ORDER", record);
};

export const applyScan = (snapshot: Snapshot, itemId: string, delta: number, source: ScanEvent["source"]): Snapshot => {
  const scan: ScanEvent = { id: uid(), itemId, delta, source, createdAt: now() };
  const items = snapshot.items.map((item) =>
    item.id === itemId ? { ...item, onHand: Math.max(0, item.onHand + delta), updatedAt: now() } : item
  );
  return appendQueue({ ...snapshot, items, scans: [scan, ...snapshot.scans] }, "ADD_SCAN", scan);
};

export const addQuoteRequest = (snapshot: Snapshot, draft: Omit<QuoteRequest, "id" | "createdAt">): Snapshot => {
  const entry: QuoteRequest = { ...draft, id: uid(), createdAt: now() };
  return appendQueue({ ...snapshot, quoteRequests: [entry, ...snapshot.quoteRequests] }, "ADD_QUOTE_REQUEST", entry);
};

export const addInternshipApplication = (
  snapshot: Snapshot,
  draft: Omit<InternshipApplication, "id" | "createdAt">
): Snapshot => {
  const entry: InternshipApplication = { ...draft, id: uid(), createdAt: now() };
  return appendQueue(
    { ...snapshot, internshipApplications: [entry, ...snapshot.internshipApplications] },
    "ADD_INTERNSHIP_APPLICATION",
    entry
  );
};

export const addSimulationRun = (snapshot: Snapshot, draft: Omit<SimulationRun, "id" | "createdAt">): Snapshot => {
  const entry: SimulationRun = { ...draft, id: uid(), createdAt: now() };
  return appendQueue({ ...snapshot, simulationRuns: [entry, ...snapshot.simulationRuns] }, "ADD_SIMULATION_RUN", entry);
};

export const saveTraining = (snapshot: Snapshot, stats: TrainingStats): Snapshot => {
  return appendQueue({ ...snapshot, training: stats }, "SAVE_TRAINING", stats);
};

export const clearQueue = (snapshot: Snapshot): Snapshot => ({ ...snapshot, queue: [] });

export const clearExperienceData = (snapshot: Snapshot): Snapshot => ({
  ...snapshot,
  quoteRequests: [],
  internshipApplications: [],
  simulationRuns: []
});
