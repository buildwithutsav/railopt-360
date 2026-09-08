import type { MaintenanceTask } from "@/types/railway";

export interface OpportunityCheck {
  code:
    | "SAME_SECTION"
    | "SPATIAL_PROXIMITY"
    | "DEPARTMENT_DIVERSITY"
    | "RESOURCE_CONFLICT"
    | "DURATION_FIT"
    | "PRIORITY_VALUE";
  label: string;
  passed: boolean;
  detail: string;
}

export interface DiscoveredOpportunity {
  id: string;
  taskIds: string[];
  sectionId: string;
  centerKm: number;
  spanKm: number;
  departments: string[];
  totalDurationMinutes: number;
  averagePriorityScore: number;
  compatibilityScore: number;
  checks: OpportunityCheck[];
}

export interface OpportunityEngineConfig {
  maxDistanceKm: number;
  maxCombinedDurationMinutes: number;
}

export const DEFAULT_OPPORTUNITY_CONFIG: OpportunityEngineConfig = {
  maxDistanceKm: 2,
  maxCombinedDurationMinutes: 150,
};

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

function getResourceConflicts(tasks: MaintenanceTask[]) {
  const seen = new Set<string>();
  const conflicts = new Set<string>();

  for (const task of tasks) {
    for (const resourceId of task.requiredResourceIds) {
      if (seen.has(resourceId)) {
        conflicts.add(resourceId);
      }

      seen.add(resourceId);
    }
  }

  return Array.from(conflicts);
}

function calculateCompatibilityScore(
  checks: OpportunityCheck[],
) {
  const weights: Record<
    OpportunityCheck["code"],
    number
  > = {
    SAME_SECTION: 25,
    SPATIAL_PROXIMITY: 25,
    DEPARTMENT_DIVERSITY: 15,
    RESOURCE_CONFLICT: 15,
    DURATION_FIT: 10,
    PRIORITY_VALUE: 10,
  };

  return checks.reduce((score, check) => {
    if (!check.passed) return score;

    return score + weights[check.code];
  }, 0);
}

export function evaluateOpportunity(
  tasks: MaintenanceTask[],
  config: OpportunityEngineConfig =
    DEFAULT_OPPORTUNITY_CONFIG,
): DiscoveredOpportunity | null {
  if (tasks.length < 2) {
    return null;
  }

  const sectionIds = unique(
    tasks.map((task) => task.sectionId),
  );

  const sameSection = sectionIds.length === 1;

  const kms = tasks.map((task) => task.km);

  const minKm = Math.min(...kms);
  const maxKm = Math.max(...kms);
  const spanKm = Number((maxKm - minKm).toFixed(2));

  const centerKm = Number(
    average(kms).toFixed(2),
  );

  const departments = unique(
    tasks.map((task) => task.department),
  );

  const totalDurationMinutes = tasks.reduce(
    (total, task) =>
      total + task.estimatedDurationMinutes,
    0,
  );

  const averagePriorityScore = Math.round(
    average(
      tasks.map((task) => task.priorityScore),
    ),
  );

  const resourceConflicts =
    getResourceConflicts(tasks);

  const checks: OpportunityCheck[] = [
    {
      code: "SAME_SECTION",
      label: "Same Railway Section",
      passed: sameSection,
      detail: sameSection
        ? `All tasks belong to ${sectionIds[0]}.`
        : `Tasks span ${sectionIds.length} railway sections.`,
    },

    {
      code: "SPATIAL_PROXIMITY",
      label: "Spatial Proximity",
      passed:
        sameSection &&
        spanKm <= config.maxDistanceKm,
      detail:
        spanKm <= config.maxDistanceKm
          ? `Maintenance locations span ${spanKm} km.`
          : `Spatial span ${spanKm} km exceeds prototype threshold of ${config.maxDistanceKm} km.`,
    },

    {
      code: "DEPARTMENT_DIVERSITY",
      label: "Cross-Department Opportunity",
      passed: departments.length >= 2,
      detail:
        departments.length >= 2
          ? `${departments.length} departments can potentially coordinate.`
          : "Tasks currently belong to one department.",
    },

    {
      code: "RESOURCE_CONFLICT",
      label: "Resource Compatibility",
      passed: resourceConflicts.length === 0,
      detail:
        resourceConflicts.length === 0
          ? "No duplicate required resources detected."
          : `Shared resource conflict: ${resourceConflicts.join(
              ", ",
            )}.`,
    },

    {
      code: "DURATION_FIT",
      label: "Combined Duration",
      passed:
        totalDurationMinutes <=
        config.maxCombinedDurationMinutes,
      detail:
        totalDurationMinutes <=
        config.maxCombinedDurationMinutes
          ? `Combined task duration is ${totalDurationMinutes} minutes.`
          : `Combined duration ${totalDurationMinutes} minutes exceeds prototype threshold.`,
    },

    {
      code: "PRIORITY_VALUE",
      label: "Maintenance Value",
      passed: averagePriorityScore >= 50,
      detail: `Average computed priority score is ${averagePriorityScore}/100.`,
    },
  ];

  const compatibilityScore =
    calculateCompatibilityScore(checks);

  return {
    id: `OPP-${tasks
      .map((task) => task.id)
      .join("-")}`,
    taskIds: tasks.map((task) => task.id),
    sectionId:
      sectionIds.length === 1
        ? sectionIds[0]
        : "MULTI_SECTION",
    centerKm,
    spanKm,
    departments,
    totalDurationMinutes,
    averagePriorityScore,
    compatibilityScore,
    checks,
  };
}

export function discoverOpportunities(
  tasks: MaintenanceTask[],
  config: OpportunityEngineConfig =
    DEFAULT_OPPORTUNITY_CONFIG,
): DiscoveredOpportunity[] {
  const opportunities: DiscoveredOpportunity[] =
    [];

  const tasksBySection = new Map<
    string,
    MaintenanceTask[]
  >();

  for (const task of tasks) {
    const sectionTasks =
      tasksBySection.get(task.sectionId) ?? [];

    sectionTasks.push(task);
    tasksBySection.set(
      task.sectionId,
      sectionTasks,
    );
  }

  for (const sectionTasks of tasksBySection.values()) {
    if (sectionTasks.length < 2) continue;

    const sortedTasks = [...sectionTasks].sort(
      (a, b) => a.km - b.km,
    );

    for (
      let start = 0;
      start < sortedTasks.length;
      start++
    ) {
      const candidate: MaintenanceTask[] = [];

      for (
        let end = start;
        end < sortedTasks.length;
        end++
      ) {
        candidate.push(sortedTasks[end]);

        if (candidate.length < 2) continue;

        const opportunity = evaluateOpportunity(
          candidate,
          config,
        );

        if (!opportunity) continue;

        const spatialCheck =
          opportunity.checks.find(
            (check) =>
              check.code ===
              "SPATIAL_PROXIMITY",
          );

        if (!spatialCheck?.passed) {
          break;
        }

        if (
          opportunity.compatibilityScore >= 60
        ) {
          opportunities.push(opportunity);
        }
      }
    }
  }

  return opportunities.sort(
    (a, b) =>
      b.compatibilityScore -
        a.compatibilityScore ||
      b.averagePriorityScore -
        a.averagePriorityScore ||
      b.taskIds.length - a.taskIds.length,
  );
}