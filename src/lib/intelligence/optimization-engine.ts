import type { MaintenanceTask } from "@/types/railway";
import { validateTaskCompatibility } from "./compatibility-engine";

export interface OptimizationWeights {
  priorityValue: number;
  utilization: number;
  coordination: number;
  durationEfficiency: number;
  compatibility: number;
}

export interface OptimizationCandidate {
  id: string;
  name: string;
  taskIds: string[];

  totalDurationMinutes: number;
  blockDurationMinutes: number;

  averagePriorityScore: number;
  utilizationPercent: number;
  departmentCount: number;

  compatibilityScore: number;

  objectiveScore: number;
  feasible: boolean;

  explanation: string[];
}

export const DEFAULT_OPTIMIZATION_WEIGHTS: OptimizationWeights = {
  priorityValue: 0.30,
  utilization: 0.20,
  coordination: 0.15,
  durationEfficiency: 0.15,
  compatibility: 0.20,
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function average(values: number[]) {
  if (values.length === 0) return 0;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function calculateUtilization(
  taskDuration: number,
  blockDuration: number,
) {
  if (blockDuration <= 0) return 0;

  return clamp(
    (taskDuration / blockDuration) * 100,
  );
}

function calculateCoordinationScore(
  departmentCount: number,
) {
  if (departmentCount >= 3) return 100;
  if (departmentCount === 2) return 75;

  return 40;
}

function calculateDurationEfficiency(
  totalDuration: number,
  blockDuration: number,
) {
  if (blockDuration <= 0) return 0;

  if (totalDuration > blockDuration) {
    return 0;
  }

  return clamp(
    (totalDuration / blockDuration) * 100,
  );
}

export function evaluateOptimizationCandidate(
  id: string,
  name: string,
  tasks: MaintenanceTask[],
  blockDurationMinutes: number,
  weights: OptimizationWeights =
    DEFAULT_OPTIMIZATION_WEIGHTS,
): OptimizationCandidate {
  const compatibility =
    validateTaskCompatibility(tasks);

  const totalDurationMinutes = tasks.reduce(
    (sum, task) =>
      sum + task.estimatedDurationMinutes,
    0,
  );

  const averagePriorityScore = Math.round(
    average(
      tasks.map((task) => task.priorityScore),
    ),
  );

  const departments = unique(
    tasks.map((task) => task.department),
  );

  const utilizationPercent = Math.round(
    calculateUtilization(
      totalDurationMinutes,
      blockDurationMinutes,
    ),
  );

  const coordinationScore =
    calculateCoordinationScore(
      departments.length,
    );

  const durationEfficiency =
    calculateDurationEfficiency(
      totalDurationMinutes,
      blockDurationMinutes,
    );

  const objectiveScore = Math.round(
    averagePriorityScore *
      weights.priorityValue +
      utilizationPercent *
        weights.utilization +
      coordinationScore *
        weights.coordination +
      durationEfficiency *
        weights.durationEfficiency +
      compatibility.score *
        weights.compatibility,
  );

  const fitsInsideBlock =
    totalDurationMinutes <=
    blockDurationMinutes;

  const feasible =
    compatibility.feasible &&
    fitsInsideBlock;

  const explanation: string[] = [];

  if (departments.length >= 3) {
    explanation.push(
      "Strong cross-department coordination opportunity.",
    );
  } else if (departments.length === 2) {
    explanation.push(
      "Combines maintenance requirements from two departments.",
    );
  }

  if (averagePriorityScore >= 70) {
    explanation.push(
      "Candidate addresses high-priority maintenance work.",
    );
  }

  if (utilizationPercent >= 80) {
    explanation.push(
      "Available maintenance block is utilized efficiently.",
    );
  }

  if (!fitsInsideBlock) {
    explanation.push(
      "Combined task duration exceeds the available block duration.",
    );
  }

  if (!compatibility.feasible) {
    explanation.push(
      "One or more compatibility constraints failed.",
    );
  }

  if (
    compatibility.overallStatus ===
    "REVIEW"
  ) {
    explanation.push(
      "Safety or operational constraints require human planner review.",
    );
  }

  return {
    id,
    name,
    taskIds: tasks.map(
      (task) => task.id,
    ),
    totalDurationMinutes,
    blockDurationMinutes,
    averagePriorityScore,
    utilizationPercent,
    departmentCount:
      departments.length,
    compatibilityScore:
      compatibility.score,
    objectiveScore: clamp(
      objectiveScore,
    ),
    feasible,
    explanation,
  };
}

export function rankOptimizationCandidates(
  candidates: OptimizationCandidate[],
) {
  return [...candidates].sort(
    (a, b) => {
      if (a.feasible !== b.feasible) {
        return a.feasible ? -1 : 1;
      }

      return (
        b.objectiveScore -
        a.objectiveScore
      );
    },
  );
}