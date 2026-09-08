import { calculatePriority } from "@/lib/intelligence/priority-engine";
import type {
  ActivityEvent,
  BlockWindow,
  CandidateOpportunity,
  CandidatePlan,
  ConstraintResult,
  MaintenanceTask,
  PerformanceMetric,
  RailwaySection,
  Resource,
  SimulationSummary,
  Station,
  Train,
  TrainPosition,
} from "@/types/railway";

/**
 * Single corridor dataset for the prototype.
 * Screens must import from this file instead of defining local mock arrays.
 *
 * Planning date: 2026-09-08.
 */

export const PLANNING_DATE = "2026-09-08";

export const stations: Station[] = [
  { id: "STN-UDR", code: "UDR", name: "Udaipur City", km: 0 },
  { id: "STN-RPN", code: "RPN", name: "Rana Pratap Nagar", km: 7 },
  { id: "STN-DBR", code: "DBR", name: "Debari", km: 20 },
  { id: "STN-MVJ", code: "MVJ", name: "Mavli Junction", km: 42 },
];

export const railwaySections: RailwaySection[] = [
  {
    id: "SEC-S1",
    code: "S1",
    fromStationId: "STN-UDR",
    toStationId: "STN-RPN",
    startKm: 0,
    endKm: 7,
  },
  {
    id: "SEC-S2",
    code: "S2",
    fromStationId: "STN-RPN",
    toStationId: "STN-DBR",
    startKm: 7,
    endKm: 20,
  },
  {
    id: "SEC-S3",
    code: "S3",
    fromStationId: "STN-DBR",
    toStationId: "STN-MVJ",
    startKm: 20,
    endKm: 42,
  },
];
function createMaintenanceTask(
  task: Omit<MaintenanceTask, "priority" | "priorityScore">,
): MaintenanceTask {
  const result = calculatePriority({
    criticality: task.criticality,
    urgency: task.urgency,
    overdueFactor: task.overdueFactor,
    assetRisk: task.assetRisk,
    availabilityImpact: task.availabilityImpact,
  });

  return {
    ...task,
    priorityScore: result.score,
    priority: result.priority,
  };
}

export const maintenanceTasks: MaintenanceTask[] = [
  createMaintenanceTask({
    id: "ENG-024",
    department: "ENGINEERING",
    assetId: "RS-204",
    assetLabel: "Rail Segment RS-204",
    sectionId: "SEC-S2",
    km: 12.4,
    maintenanceType: "Rail Defect Inspection",

    criticality: 95,
    urgency: 95,
    overdueFactor: 45,
    assetRisk: 90,
    availabilityImpact: 85,

    dueDate: "2026-09-08",
    dueOffsetDays: 0,
    estimatedDurationMinutes: 60,
    requiredResourceIds: ["TRACK-T1", "IV-02"],
    status: "PENDING",
  }),

  createMaintenanceTask({
    id: "OHE-011",
    department: "TRACTION",
    assetId: "CW-44",
    assetLabel: "Contact Wire CW-44",
    sectionId: "SEC-S2",
    km: 13.1,
    maintenanceType: "Contact Wire Inspection",

    criticality: 80,
    urgency: 75,
    overdueFactor: 30,
    assetRisk: 75,
    availabilityImpact: 70,

    dueDate: "2026-09-09",
    dueOffsetDays: 1,
    estimatedDurationMinutes: 45,
    requiredResourceIds: ["OHE-T2"],
    status: "PENDING",
  }),

  createMaintenanceTask({
    id: "SNT-018",
    department: "SNT",
    assetId: "S-28",
    assetLabel: "Signal S-28",
    sectionId: "SEC-S2",
    km: 13.8,
    maintenanceType: "Signal Equipment Test",

    criticality: 82,
    urgency: 70,
    overdueFactor: 20,
    assetRisk: 78,
    availabilityImpact: 75,

    dueDate: "2026-09-10",
    dueOffsetDays: 2,
    estimatedDurationMinutes: 30,
    requiredResourceIds: ["SNT-T3"],
    status: "PENDING",
  }),

  createMaintenanceTask({
    id: "ENG-031",
    department: "ENGINEERING",
    assetId: "RS-310",
    assetLabel: "Track Segment RS-310",
    sectionId: "SEC-S3",
    km: 26.2,
    maintenanceType: "Track Geometry Check",

    criticality: 60,
    urgency: 45,
    overdueFactor: 10,
    assetRisk: 55,
    availabilityImpact: 45,

    dueDate: "2026-09-12",
    dueOffsetDays: 4,
    estimatedDurationMinutes: 45,
    requiredResourceIds: ["TRACK-T1"],
    status: "PENDING",
  }),
];
export const trains: Train[] = [
  { id: "TRN-12991", number: "12991", category: "Express" },
  { id: "TRN-19665", number: "19665", category: "Passenger" },
  { id: "TRN-FRT-42", number: "FRT-42", category: "Freight" },
];

export const trainPositions: TrainPosition[] = [
  {
    trainId: "TRN-12991",
    sectionId: "SEC-S1",
    km: 4.2,
    direction: "DOWN",
  },
  {
    trainId: "TRN-19665",
    sectionId: "SEC-S2",
    km: 17.1,
    direction: "UP",
  },
  {
    trainId: "TRN-FRT-42",
    sectionId: "SEC-S3",
    km: 31.4,
    direction: "DOWN",
  },
];

export const resources: Resource[] = [
  {
    id: "TRACK-T1",
    name: "Track Team T1",
    department: "ENGINEERING",
    status: "AVAILABLE",
  },
  {
    id: "OHE-T2",
    name: "OHE Team T2",
    department: "TRACTION",
    status: "AVAILABLE",
  },
  {
    id: "SNT-T3",
    name: "S&T Team T3",
    department: "SNT",
    status: "AVAILABLE",
  },
  {
    id: "IV-02",
    name: "Inspection Vehicle IV-02",
    department: "ENGINEERING",
    status: "AVAILABLE",
  },
];

export const blockWindows: BlockWindow[] = [
  {
    id: "BLK-2026-042",
    sectionId: "SEC-S2",
    fromStationId: "STN-RPN",
    toStationId: "STN-DBR",
    startTime: "14:10",
    endTime: "16:10",
    durationMinutes: 120,
    includedTaskIds: ["ENG-024", "OHE-011", "SNT-018"],
    status: "PROPOSED",
  },
  {
    id: "BLK-2026-043",
    sectionId: "SEC-S2",
    fromStationId: "STN-RPN",
    toStationId: "STN-DBR",
    startTime: "13:40",
    endTime: "16:20",
    durationMinutes: 160,
    includedTaskIds: ["ENG-024", "OHE-011", "SNT-018", "ENG-026"],
    status: "FEASIBLE",
  },
  {
    id: "BLK-2026-044",
    sectionId: "SEC-S2",
    fromStationId: "STN-RPN",
    toStationId: "STN-DBR",
    startTime: "15:00",
    endTime: "16:30",
    durationMinutes: 90,
    includedTaskIds: ["ENG-024", "OHE-011"],
    status: "FEASIBLE",
  },
];

const makeMetrics = (
  affectedTrains: number,
  utilisationPercent: number,
): PerformanceMetric[] => [
  {
    key: "affectedTrains",
    label: "Affected trains",
    value: affectedTrains,
    unit: "trains",
    source: "SIMULATION",
    computed: true,
  },
  {
    key: "blockUtilisation",
    label: "Block utilisation",
    value: utilisationPercent,
    unit: "%",
    source: "SIMULATION",
    computed: true,
  },
];

export const candidatePlans: CandidatePlan[] = [
  {
    id: "PLAN-A",
    name: "Balanced Plan",
    blockWindowId: "BLK-2026-042",
    includedTaskIds: ["ENG-024", "OHE-011", "SNT-018"],
    status: "PROPOSED",
    affectedTrains: 2,
    utilisationPercent: 87,
    criticalTasks: 1,
    performanceMetrics: makeMetrics(2, 87),
  },
  {
    id: "PLAN-B",
    name: "Maximum Maintenance Completion",
    blockWindowId: "BLK-2026-043",
    includedTaskIds: ["ENG-024", "OHE-011", "SNT-018", "ENG-026"],
    status: "FEASIBLE",
    affectedTrains: 4,
    utilisationPercent: 91,
    criticalTasks: 1,
    performanceMetrics: makeMetrics(4, 91),
  },
  {
    id: "PLAN-C",
    name: "Minimum Train Impact",
    blockWindowId: "BLK-2026-044",
    includedTaskIds: ["ENG-024", "OHE-011"],
    status: "FEASIBLE",
    affectedTrains: 1,
    utilisationPercent: 78,
    criticalTasks: 1,
    performanceMetrics: makeMetrics(1, 78),
  },
];

export const candidateOpportunities: CandidateOpportunity[] = [
  {
    id: "OPP-S2-001",
    sectionId: "SEC-S2",
    startTime: "14:10",
    endTime: "16:10",
    taskIds: ["ENG-024", "OHE-011", "SNT-018"],
    departmentCount: 3,
    source: "SIMULATION",
  },
];

export const simulationSummary: SimulationSummary = {
  candidateOpportunities: 4,
  proposedBlocks: 1,
  affectedTrains: 2,
  blockUtilisation: 87,
  source: "SIMULATION",
};

export const constraintResults: ConstraintResult[] = [
  {
    id: "CONSTRAINT-LOCATION",
    planId: "PLAN-A",
    constraintCode: "LOCATION",
    label: "Location Compatibility",
    status: "PASS",
    detail: "All selected tasks fall within the proposed S2 maintenance zone.",
    source: "SIMULATION",
  },
  {
    id: "CONSTRAINT-TIME",
    planId: "PLAN-A",
    constraintCode: "TIME",
    label: "Time Compatibility",
    status: "PASS",
    detail: "Task durations fit within the proposed block window.",
    source: "SIMULATION",
  },
  {
    id: "CONSTRAINT-RESOURCE",
    planId: "PLAN-A",
    constraintCode: "RESOURCE",
    label: "Resources",
    status: "PASS",
    detail: "Required teams and inspection vehicle are available in the prototype scenario.",
    source: "SIMULATION",
  },
  {
    id: "CONSTRAINT-DEPENDENCY",
    planId: "PLAN-A",
    constraintCode: "DEPENDENCY",
    label: "Dependencies",
    status: "PASS",
    detail: "No task dependency conflict is present in the current scenario.",
    source: "SIMULATION",
  },
  {
    id: "CONSTRAINT-SAFETY",
    planId: "PLAN-A",
    constraintCode: "SAFETY",
    label: "Safety Rules",
    status: "PASS",
    detail: "Prototype safety constraints pass. This is not an operational safety approval.",
    source: "SIMULATION",
  },
  {
    id: "CONSTRAINT-TRAIN",
    planId: "PLAN-A",
    constraintCode: "TRAIN_CONFLICT",
    label: "Train Conflict",
    status: "WARNING",
    detail: "Two trains are estimated to be affected in the prototype scenario.",
    source: "SIMULATION",
  },
];

export const activityEvents: ActivityEvent[] = [
  {
    id: "ACT-001",
    timestamp: "22:31",
    category: "PLANNING",
    message: "Candidate BLK-2026-042 ranked as preferred plan",
    relatedEntityId: "BLK-2026-042",
  },
  {
    id: "ACT-002",
    timestamp: "22:30",
    category: "VALIDATION",
    message: "Constraint validation completed for S2",
    relatedEntityId: "SEC-S2",
  },
  {
    id: "ACT-003",
    timestamp: "22:28",
    category: "OPPORTUNITY",
    message: "Cross-department maintenance overlap detected in S2",
    relatedEntityId: "SEC-S2",
  },
  {
    id: "ACT-004",
    timestamp: "22:26",
    category: "DATA",
    message: "Maintenance planning dataset loaded",
  },
];

export const corridor = {
  id: "UDR-MVJ",
  name: "Udaipur City – Mavli Junction",
  stationIds: stations.map((station) => station.id),
  sectionIds: railwaySections.map((section) => section.id),
} as const;

export const mockDataset = {
  planningDate: PLANNING_DATE,
  corridor,
  stations,
  railwaySections,
  maintenanceTasks,
  trains,
  trainPositions,
  resources,
  blockWindows,
  candidatePlans,
  candidateOpportunities,
  simulationSummary,
  constraintResults,
  activityEvents,
} as const;