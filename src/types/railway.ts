/**
 * Domain types for RAILOPT 360.
 * Keep these stable so UI screens and a future FastAPI backend can share the same shapes.
 */

export type Department = "ENGINEERING" | "TRACTION" | "SNT";

export type MaintenancePriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type TaskStatus =
  | "PENDING"
  | "PLANNING"
  | "SCHEDULED"
  | "APPROVED"
  | "IN_PROGRESS"
  | "COMPLETED";

export type ConstraintStatus = "PASS" | "WARNING" | "FAIL";

export type ResourceStatus = "AVAILABLE" | "ASSIGNED" | "UNAVAILABLE";

export type TrainCategory = "Express" | "Passenger" | "Freight";
export type TrackDirection = "UP" | "DOWN";

export interface TrainPosition {
  trainId: string;
  sectionId: string;
  km: number;
  direction: TrackDirection;
}

export interface SimulationSummary {
  candidateOpportunities: number;
  proposedBlocks: number;
  affectedTrains: number;
  blockUtilisation: number;
  source: MetricSource;
}

export interface CandidateOpportunity {
  id: string;
  sectionId: string;
  startTime: string;
  endTime: string;
  taskIds: string[];
  departmentCount: number;
  source: MetricSource;
}


export interface TrainPosition {
  trainId: string;
  sectionId: string;
  km: number;
  direction: TrackDirection;
}

export interface SimulationSummary {
  candidateOpportunities: number;
  proposedBlocks: number;
  affectedTrains: number;
  blockUtilisation: number;
  source: MetricSource;
}

export interface CandidateOpportunity {
  id: string;
  sectionId: string;
  startTime: string;
  endTime: string;
  taskIds: string[];
  departmentCount: number;
  source: MetricSource;
}

export type BlockStatus = "PROPOSED" | "FEASIBLE" | "APPROVED" | "REJECTED";

/** Every performance figure in this prototype is simulated, never live IR data. */
export type MetricSource = "SIMULATION";

export interface Station {
  id: string;
  code: string;
  name: string;
  km: number;
}

export interface RailwaySection {
  id: string;
  code: string;
  fromStationId: string;
  toStationId: string;
  startKm: number;
  endKm: number;
}

export interface MaintenanceTask {
  id: string;
  department: Department;
  assetId: string;
  assetLabel: string;
  sectionId: string;
  km: number;
  maintenanceType: string;

  // Priority Intelligence inputs (0–100)
  criticality: number;
  urgency: number;
  overdueFactor: number;
  assetRisk: number;
  availabilityImpact: number;

  // Computed priority output
  priorityScore: number;
  priority: MaintenancePriority;

  dueDate: string;
  dueOffsetDays: number;
  estimatedDurationMinutes: number;
  requiredResourceIds: string[];
  status: TaskStatus;
}

export interface Train {
  id: string;
  number: string;
  category: TrainCategory;
}

export interface Resource {
  id: string;
  name: string;
  department: Department;
  status: ResourceStatus;
}

export interface BlockWindow {
  id: string;
  sectionId: string;
  fromStationId: string;
  toStationId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  includedTaskIds: string[];
  status: BlockStatus;
}

export interface PerformanceMetric {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  source: MetricSource;
  computed: boolean;
}

export interface CandidatePlan {
  id: string;
  name: string;
  blockWindowId: string;
  includedTaskIds: string[];
  status: BlockStatus;
  affectedTrains: number;
  utilisationPercent: number;
  criticalTasks: number;
  performanceMetrics: PerformanceMetric[];
}

export interface ConstraintResult {
  id: string;
  planId: string;
  constraintCode: string;
  label: string;
  status: ConstraintStatus;
  detail: string;
  source: MetricSource;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  category: string;
  message: string;
  relatedEntityId?: string;
}
