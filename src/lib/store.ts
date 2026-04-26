import type {
  InternshipApplication,
  QuoteRequest,
  SimulationRun,
  TrainingStats
} from "../types";

const STORAGE_KEY = "namane-supply-os-v2";

export type SyncOperation = {
  id: string;
  type:
    | "ADD_QUOTE_REQUEST"
    | "ADD_INTERNSHIP_APPLICATION"
    | "ADD_SIMULATION_RUN"
    | "SAVE_TRAINING";
  payload: unknown;
  createdAt: string;
};

export type Snapshot = {
  quoteRequests: QuoteRequest[];
  internshipApplications: InternshipApplication[];
  simulationRuns: SimulationRun[];
  training: TrainingStats;
  queue: SyncOperation[];
};

const now = () => new Date().toISOString();

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const defaultTraining: TrainingStats = {
  completedModules: [],
  quizScores: {},
  simulationScore: 0,
  maintenanceScore: 0,
  updatedAt: now()
};

export const createInitialSnapshot = (): Snapshot => ({
  quoteRequests: [],
  internshipApplications: [],
  simulationRuns: [],
  training: defaultTraining,
  queue: []
});

const isSnapshot = (value: unknown): value is Snapshot => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<Snapshot>;

  return (
    Array.isArray(candidate.quoteRequests) &&
    Array.isArray(candidate.internshipApplications) &&
    Array.isArray(candidate.simulationRuns) &&
    typeof candidate.training === "object" &&
    Array.isArray(candidate.queue)
  );
};

export const loadSnapshot = (): Snapshot => {
  if (typeof window === "undefined") return createInitialSnapshot();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialSnapshot();

    const parsed = JSON.parse(raw);

    if (!isSnapshot(parsed)) return createInitialSnapshot();

    return {
      ...createInitialSnapshot(),
      ...parsed,
      training: {
        ...defaultTraining,
        ...parsed.training
      }
    };
  } catch {
    return createInitialSnapshot();
  }
};

export const saveSnapshot = (snapshot: Snapshot) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

const appendQueue = (
  snapshot: Snapshot,
  type: SyncOperation["type"],
  payload: unknown
): Snapshot => ({
  ...snapshot,
  queue: [
    ...snapshot.queue,
    {
      id: uid(),
      type,
      payload,
      createdAt: now()
    }
  ]
});

export const addQuoteRequest = (
  snapshot: Snapshot,
  draft: Omit<QuoteRequest, "id" | "createdAt" | "status">
): Snapshot => {
  const entry: QuoteRequest = {
    ...draft,
    id: uid(),
    status: "new",
    createdAt: now()
  };

  return appendQueue(
    {
      ...snapshot,
      quoteRequests: [entry, ...snapshot.quoteRequests]
    },
    "ADD_QUOTE_REQUEST",
    entry
  );
};

export const addInternshipApplication = (
  snapshot: Snapshot,
  draft: Omit<InternshipApplication, "id" | "createdAt" | "status">
): Snapshot => {
  const entry: InternshipApplication = {
    ...draft,
    id: uid(),
    status: "submitted",
    createdAt: now()
  };

  return appendQueue(
    {
      ...snapshot,
      internshipApplications: [entry, ...snapshot.internshipApplications]
    },
    "ADD_INTERNSHIP_APPLICATION",
    entry
  );
};

export const addSimulationRun = (
  snapshot: Snapshot,
  draft: Omit<SimulationRun, "id" | "createdAt">
): Snapshot => {
  const entry: SimulationRun = {
    ...draft,
    id: uid(),
    createdAt: now()
  };

  return appendQueue(
    {
      ...snapshot,
      simulationRuns: [entry, ...snapshot.simulationRuns]
    },
    "ADD_SIMULATION_RUN",
    entry
  );
};

export const saveTraining = (
  snapshot: Snapshot,
  stats: TrainingStats
): Snapshot => {
  return appendQueue(
    {
      ...snapshot,
      training: {
        ...stats,
        updatedAt: now()
      }
    },
    "SAVE_TRAINING",
    stats
  );
};

export const clearQueue = (snapshot: Snapshot): Snapshot => ({
  ...snapshot,
  queue: []
});

export const clearExperienceData = (snapshot: Snapshot): Snapshot => ({
  ...snapshot,
  quoteRequests: [],
  internshipApplications: [],
  simulationRuns: []
});