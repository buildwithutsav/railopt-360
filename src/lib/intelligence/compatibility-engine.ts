import type { MaintenanceTask } from "@/types/railway";

export type CompatibilityStatus = "PASS" | "REVIEW" | "FAIL";

export interface CompatibilityCheck {
  code:
    | "SECTION"
    | "SPATIAL"
    | "RESOURCE"
    | "DURATION"
    | "DEPARTMENT"
    | "SAFETY";
  label: string;
  status: CompatibilityStatus;
  detail: string;
}

export interface CompatibilityConfig {
  maxSpatialSpanKm: number;
  maxCombinedDurationMinutes: number;
}

export interface CompatibilityResult {
  feasible: boolean;
  overallStatus: CompatibilityStatus;
  score: number;
  checks: CompatibilityCheck[];
  conflictingResources: string[];
}

export const DEFAULT_COMPATIBILITY_CONFIG: CompatibilityConfig = {
  maxSpatialSpanKm: 2,
  maxCombinedDurationMinutes: 150,
};

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function findResourceConflicts(tasks: MaintenanceTask[]) {
  const usage = new Map<string, number>();

  for (const task of tasks) {
    for (const resourceId of task.requiredResourceIds) {
      usage.set(resourceId, (usage.get(resourceId) ?? 0) + 1);
    }
  }

  return Array.from(usage.entries())
    .filter(([, count]) => count > 1)
    .map(([resourceId]) => resourceId);
}

function getOverallStatus(
  checks: CompatibilityCheck[],
): CompatibilityStatus {
  if (checks.some((check) => check.status === "FAIL")) {
    return "FAIL";
  }

  if (checks.some((check) => check.status === "REVIEW")) {
    return "REVIEW";
  }

  return "PASS";
}

function calculateCompatibilityScore(
  checks: CompatibilityCheck[],
) {
  const weights: Record<CompatibilityCheck["code"], number> = {
    SECTION: 25,
    SPATIAL: 20,
    RESOURCE: 20,
    DURATION: 15,
    DEPARTMENT: 10,
    SAFETY: 10,
  };

  let score = 0;

  for (const check of checks) {
    const weight = weights[check.code];

    if (check.status === "PASS") {
      score += weight;
    } else if (check.status === "REVIEW") {
      score += weight * 0.5;
    }
  }

  return Math.round(score);
}

export function validateTaskCompatibility(
  tasks: MaintenanceTask[],
  config: CompatibilityConfig = DEFAULT_COMPATIBILITY_CONFIG,
): CompatibilityResult {
  if (tasks.length < 2) {
    return {
      feasible: false,
      overallStatus: "FAIL",
      score: 0,
      checks: [
        {
          code: "SECTION",
          label: "Task Group Validation",
          status: "FAIL",
          detail:
            "At least two maintenance tasks are required for compatibility evaluation.",
        },
      ],
      conflictingResources: [],
    };
  }

  const sectionIds = unique(tasks.map((task) => task.sectionId));
  const sameSection = sectionIds.length === 1;

  const kms = tasks.map((task) => task.km);
  const minKm = Math.min(...kms);
  const maxKm = Math.max(...kms);
  const spatialSpanKm = Number((maxKm - minKm).toFixed(2));

  const conflictingResources = findResourceConflicts(tasks);

  const totalDurationMinutes = tasks.reduce(
    (sum, task) => sum + task.estimatedDurationMinutes,
    0,
  );

  const departments = unique(tasks.map((task) => task.department));

  const checks: CompatibilityCheck[] = [
    {
      code: "SECTION",
      label: "Section Compatibility",
      status: sameSection ? "PASS" : "FAIL",
      detail: sameSection
        ? `All tasks belong to ${sectionIds[0]}.`
        : `Tasks belong to multiple sections: ${sectionIds.join(", ")}.`,
    },

    {
      code: "SPATIAL",
      label: "Spatial Compatibility",
      status:
        sameSection &&
        spatialSpanKm <= config.maxSpatialSpanKm
          ? "PASS"
          : "FAIL",
      detail:
        spatialSpanKm <= config.maxSpatialSpanKm
          ? `Task locations span ${spatialSpanKm} km.`
          : `Task span ${spatialSpanKm} km exceeds the prototype limit of ${config.maxSpatialSpanKm} km.`,
    },

    {
      code: "RESOURCE",
      label: "Resource Compatibility",
      status:
        conflictingResources.length === 0
          ? "PASS"
          : "FAIL",
      detail:
        conflictingResources.length === 0
          ? "No duplicate resource requirements detected."
          : `Conflicting resources: ${conflictingResources.join(", ")}.`,
    },

    {
      code: "DURATION",
      label: "Duration Feasibility",
      status:
        totalDurationMinutes <= config.maxCombinedDurationMinutes
          ? "PASS"
          : "FAIL",
      detail:
        totalDurationMinutes <= config.maxCombinedDurationMinutes
          ? `Combined maintenance duration is ${totalDurationMinutes} minutes.`
          : `Combined duration ${totalDurationMinutes} minutes exceeds the prototype limit of ${config.maxCombinedDurationMinutes} minutes.`,
    },

    {
      code: "DEPARTMENT",
      label: "Department Coordination",
      status: departments.length >= 2 ? "PASS" : "REVIEW",
      detail:
        departments.length >= 2
          ? `${departments.length} departments are represented in this opportunity.`
          : "Only one department is represented; coordination benefit is limited.",
    },

    {
      code: "SAFETY",
      label: "Safety Constraint Validation",
      status: "REVIEW",
      detail:
        "Safety and operational rules require planner validation because the prototype is not connected to authorized railway safety systems.",
    },
  ];

  const overallStatus = getOverallStatus(checks);
  const score = calculateCompatibilityScore(checks);

  return {
    feasible: overallStatus !== "FAIL",
    overallStatus,
    score,
    checks,
    conflictingResources,
  };
}