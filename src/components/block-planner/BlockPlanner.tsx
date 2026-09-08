"use client";
import {
  evaluateOptimizationCandidate,
  rankOptimizationCandidates,
} from "@/lib/intelligence/optimization-engine";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  blockWindows,
  maintenanceTasks,
  railwaySections,
  resources,
} from "@/data/mock-data";
import type { MaintenanceTask } from "@/types/railway";

type ValidationStatus = "PASS" | "REVIEW";

interface ValidationCheck {
  label: string;
  detail: string;
  status: ValidationStatus;
}

function departmentLabel(department: string) {
  if (department === "ENGINEERING") return "Engineering";
  if (department === "TRACTION") return "Traction / OHE";
  return "Signal & Telecom";
}

function priorityClass(priority: string) {
  if (priority === "CRITICAL")
    return "border-red-500/30 bg-red-500/5 text-red-400";

  if (priority === "HIGH")
    return "border-amber-500/30 bg-amber-500/5 text-amber-400";

  if (priority === "MEDIUM")
    return "border-blue-500/30 bg-blue-500/5 text-blue-400";

  return "border-slate-600 bg-slate-800/30 text-slate-400";
}

function getMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function durationBetween(start: string, end: string) {
  return Math.max(0, getMinutes(end) - getMinutes(start));
}
function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(":").map(Number);

  const totalMinutes = hours * 60 + minutes + minutesToAdd;

  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;

  return `${String(newHours).padStart(2, "0")}:${String(
    newMinutes,
  ).padStart(2, "0")}`;
}

export function BlockPlanner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const opportunityId =
    searchParams.get("opportunity") ?? "OPP-S2-001";

  const proposedBlock = blockWindows[0];

  const initialTaskIds =
    proposedBlock?.includedTaskIds ?? [
      "ENG-024",
      "OHE-011",
      "SNT-018",
    ];

  const [selectedTaskIds, setSelectedTaskIds] =
    useState<string[]>(initialTaskIds);

  const [startTime, setStartTime] = useState(
    proposedBlock?.startTime ?? "14:10",
  );

  const [endTime, setEndTime] = useState(
    proposedBlock?.endTime ?? "16:10",
  );

  const [planStatus, setPlanStatus] = useState<
    "DRAFT" | "VALIDATED" | "APPROVED"
  >("DRAFT");

  const [showAlternatives, setShowAlternatives] = useState(false);
const [isOptimizing, setIsOptimizing] = useState(false);
const [unavailableResources, setUnavailableResources] = useState<string[]>([]);
const [isReplanning, setIsReplanning] = useState(false);

const [backendOptimizationResult, setBackendOptimizationResult] =
  useState<{
    status: string;
    selected_task_ids: string[];
    scheduled_tasks: {
      task_id: string;
      start_minute: number;
      end_minute: number;
      selected: boolean;
    }[];
    total_priority_value: number;
    block_duration_minutes: number;
    objective_value: number;
  } | null>(null);

const [optimizationError, setOptimizationError] = useState<string | null>(
  null,
);
  const selectedTasks = useMemo(
    () =>
      maintenanceTasks.filter((task) =>
        selectedTaskIds.includes(task.id),
      ),
    [selectedTaskIds],
  );
  const runBackendOptimization = async () => {
  try {
    setUnavailableResources([]);
    setIsOptimizing(true);
    setOptimizationError(null);

    const tasksToOptimize = selectedTasks.map((task) => ({
      id: task.id,
      department: task.department,
      section_id: task.sectionId,
      km: task.km,
      maintenance_type: task.maintenanceType,
      priority_score: task.priorityScore,
      estimated_duration_minutes: task.estimatedDurationMinutes,
      required_resource_ids: task.requiredResourceIds,
    }));

    const response = await fetch("http://127.0.0.1:8000/optimize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: tasksToOptimize,

        block: {
          id: proposedBlock?.id ?? "BLK-2026-042",
          section_id: proposedBlock?.sectionId ?? "SEC-S2",
          start_time: startTime,
          end_time: endTime,
          duration_minutes: durationBetween(startTime, endTime),
        },

        max_parallel_tasks: 3,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Optimization request failed with status ${response.status}`,
      );
    }

    const result = await response.json();

    setBackendOptimizationResult(result);
  } catch (error) {
    console.error("RAILOPT optimization error:", error);

    setOptimizationError(
      error instanceof Error
        ? error.message
        : "Unable to run optimization.",
    );
  } finally {
    setIsOptimizing(false);
  }
};
const simulateResourceFailureAndReplan = async () => {
  try {
    setIsReplanning(true);
    setOptimizationError(null);

    const failedResources = ["OHE-T2"];
    setUnavailableResources(failedResources);

    const tasksToOptimize = selectedTasks.map((task) => ({
      id: task.id,
      department: task.department,
      section_id: task.sectionId,
      km: task.km,
      maintenance_type: task.maintenanceType,
      priority_score: task.priorityScore,
      estimated_duration_minutes: task.estimatedDurationMinutes,
      required_resource_ids: task.requiredResourceIds,
    }));

    const response = await fetch("http://127.0.0.1:8000/optimize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        tasks: tasksToOptimize,

        block: {
          id: proposedBlock?.id ?? "BLK-2026-042",
          section_id: proposedBlock?.sectionId ?? "SEC-S2",
          start_time: startTime,
          end_time: endTime,
          duration_minutes: durationBetween(startTime, endTime),
        },

        max_parallel_tasks: 3,

        unavailable_resource_ids: failedResources,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Replanning request failed with status ${response.status}`,
      );
    }

    const result = await response.json();

    setBackendOptimizationResult(result);
  } catch (error) {
    console.error("RAILOPT replanning error:", error);

    setOptimizationError(
      error instanceof Error
        ? error.message
        : "Unable to dynamically replan.",
    );
  } finally {
    setIsReplanning(false);
  }
};
  const alternativePlans = useMemo(() => {
  if (selectedTasks.length === 0) return [];

  // PLAN A — current planner selection and current time window
  const planABlockDuration = durationBetween(
    startTime,
    endTime,
  );

  const planA = evaluateOptimizationCandidate(
    "PLAN-A",
    "Balanced",
    selectedTasks,
    planABlockDuration,
  );

  // PLAN B — shorter 90-minute block.
  // Greedily keeps the highest-priority tasks that fit.
  const shorterBlockDuration = 90;

  const prioritySortedTasks = [...selectedTasks].sort(
    (a, b) => b.priorityScore - a.priorityScore,
  );

  const shorterBlockTasks: MaintenanceTask[] = [];
  let usedMinutes = 0;

  for (const task of prioritySortedTasks) {
    if (
      usedMinutes + task.estimatedDurationMinutes <=
      shorterBlockDuration
    ) {
      shorterBlockTasks.push(task);
      usedMinutes += task.estimatedDurationMinutes;
    }
  }

  const planB = evaluateOptimizationCandidate(
    "PLAN-B",
    "Shorter Block",
    shorterBlockTasks,
    shorterBlockDuration,
  );

  // PLAN C — gives the complete maintenance group more time.
  const planC = evaluateOptimizationCandidate(
    "PLAN-C",
    "Maintenance First",
    selectedTasks,
    150,
  );

  return rankOptimizationCandidates([
    planA,
    planB,
    planC,
  ]);
}, [selectedTasks, startTime, endTime]);

  const planningSectionId =
    proposedBlock?.sectionId ??
    selectedTasks[0]?.sectionId ??
    "S2";

  const section = railwaySections.find(
    (item) => item.id === planningSectionId,
  );

  const eligibleTasks = maintenanceTasks.filter(
    (task) => task.sectionId === planningSectionId,
  );

  const duration = durationBetween(startTime, endTime);

  const totalWorkMinutes = selectedTasks.reduce(
    (sum, task) => sum + task.estimatedDurationMinutes,
    0,
  );

  /*
    This is a prototype planning indicator, not an official railway
    utilization formula. Parallel cross-department work can occur,
    so we avoid treating summed task duration as literal block duration.
  */
  const utilization =
    duration > 0
      ? Math.min(
          100,
          Math.round(
            (Math.min(totalWorkMinutes, duration * 1.2) /
              (duration * 1.2)) *
              100,
          ),
        )
      : 0;

  const uniqueDepartments = new Set(
    selectedTasks.map((task) => task.department),
  ).size;

  const requiredResourceIds = Array.from(
    new Set(
      selectedTasks.flatMap(
        (task) => task.requiredResourceIds,
      ),
    ),
  );

  const requiredResources = requiredResourceIds.map((id) => {
    const resource = resources.find((item) => item.id === id);

    return {
      id,
      name: resource?.name ?? id,
      status: resource?.status ?? "UNAVAILABLE",
    };
  });

  const allResourcesAvailable = requiredResources.every(
    (resource) => resource.status === "AVAILABLE",
  );

  const sameSection = selectedTasks.every(
    (task) => task.sectionId === planningSectionId,
  );

  const validationChecks: ValidationCheck[] = [
    {
      label: "Spatial compatibility",
      detail: sameSection
        ? `Selected tasks are within ${section?.code ?? planningSectionId}.`
        : "Selected tasks span multiple planning sections.",
      status: sameSection ? "PASS" : "REVIEW",
    },
    {
      label: "Cross-department coordination",
      detail: `${uniqueDepartments} department(s) represented in the candidate block.`,
      status: uniqueDepartments >= 2 ? "PASS" : "REVIEW",
    },
    {
      label: "Resource availability",
      detail: allResourcesAvailable
        ? "All required prototype resources are marked available."
        : "One or more required resources need planner review.",
      status: allResourcesAvailable ? "PASS" : "REVIEW",
    },
    {
      label: "Block duration",
      detail:
        duration > 0
          ? `${duration} minute candidate maintenance window.`
          : "End time must be later than start time.",
      status: duration > 0 ? "PASS" : "REVIEW",
    },
    {
      label: "Train interaction",
      detail:
        "Operational train impact must be evaluated in Simulation Lab before final approval.",
      status: "REVIEW",
    },
    {
      label: "Safety validation",
      detail:
        "Prototype checks passed; authorized railway safety validation remains mandatory.",
      status: "REVIEW",
    },
  ];

  const passedChecks = validationChecks.filter(
    (check) => check.status === "PASS",
  ).length;

  const toggleTask = (taskId: string) => {
    setPlanStatus("DRAFT");

    setSelectedTaskIds((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId],
    );
  };

  const validatePlan = () => {
    if (
      selectedTasks.length > 0 &&
      duration > 0 &&
      sameSection &&
      allResourcesAvailable
    ) {
      setPlanStatus("VALIDATED");
    }
  };

  const approvePlan = () => {
  if (planStatus === "VALIDATED") {
    setPlanStatus("APPROVED");

    const approvedTaskIds =
      backendOptimizationResult?.selected_task_ids.length
        ? backendOptimizationResult.selected_task_ids
        : selectedTaskIds;

    router.push(
      `/execution?block=${proposedBlock?.id ?? "BLK-2026-042"}&tasks=${approvedTaskIds.join(
        ",",
      )}&source=cp-sat`,
    );
  }
};

  return (
    <section className="space-y-5">
      {/* Context bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-blue-500/20 bg-blue-500/[0.03] px-4 py-3">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-400">
            Opportunity Handoff
          </div>

          <div className="mt-1 text-xs text-slate-300">
            Planning candidate{" "}
            <span className="font-mono font-semibold text-slate-100">
              {opportunityId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
            Prototype / Simulation
          </span>

          <StatusBadge status={planStatus} />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Candidate Block"
          value={proposedBlock?.id ?? "BLK-DRAFT"}
          note={section?.code ?? planningSectionId}
        />

        <Metric
          label="Tasks Included"
          value={String(selectedTasks.length)}
          note={`${uniqueDepartments} departments`}
        />

        <Metric
          label="Block Window"
          value={`${startTime}–${endTime}`}
          note={`${duration} min`}
        />

        <Metric
          label="Planning Utilization"
          value={`${utilization}%`}
          note="Prototype indicator"
        />

        <Metric
          label="Validation"
          value={`${passedChecks}/${validationChecks.length}`}
          note="Pre-approval checks"
        />
      </div>

      {/* Main planner */}
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          {/* Window editor */}
          <div className="border border-slate-700/70 bg-slate-900/30">
            <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Candidate Maintenance Block
                </div>

                <h2 className="mt-1 text-sm font-semibold text-slate-200">
                  {section?.code ?? planningSectionId} Block Configuration
                </h2>
              </div>

              <span className="font-mono text-[9px] text-slate-500">
                {proposedBlock?.id ?? "BLK-DRAFT"}
              </span>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-3">
              <div>
                <label className="text-[8px] uppercase tracking-wider text-slate-600">
                  Planning Section
                </label>

                <div className="mt-2 border border-slate-700 bg-[#0b121b] px-3 py-2.5 font-mono text-xs text-slate-300">
                  {section?.code ?? planningSectionId}
                </div>
              </div>

              <div>
                <label className="text-[8px] uppercase tracking-wider text-slate-600">
                  Start Time
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => {
                    setStartTime(event.target.value);
                    setPlanStatus("DRAFT");
                  }}
                  className="mt-2 w-full border border-slate-700 bg-[#0b121b] px-3 py-2 text-xs text-slate-300 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[8px] uppercase tracking-wider text-slate-600">
                  End Time
                </label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => {
                    setEndTime(event.target.value);
                    setPlanStatus("DRAFT");
                  }}
                  className="mt-2 w-full border border-slate-700 bg-[#0b121b] px-3 py-2 text-xs text-slate-300 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Timeline */}
            <div className="border-t border-slate-800 px-5 py-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[8px] uppercase tracking-wider text-slate-600">
                  Proposed Block Timeline
                </span>

                <span className="font-mono text-[9px] text-blue-400">
                  {duration} MIN WINDOW
                </span>
              </div>

              <div className="relative h-16 border border-slate-700 bg-[#0b121b]">
                <div className="absolute left-[8%] right-[8%] top-1/2 h-px bg-slate-700" />

                <div className="absolute left-[8%] top-[22px] h-5 w-5 rounded-full border-2 border-blue-500 bg-[#0b121b]" />

                <div className="absolute right-[8%] top-[22px] h-5 w-5 rounded-full border-2 border-blue-500 bg-[#0b121b]" />

                <div className="absolute left-[12%] right-[12%] top-[27px] h-2 bg-blue-500/20">
                  <div className="h-full w-full bg-blue-500/30" />
                </div>

                <span className="absolute bottom-1 left-[7%] font-mono text-[8px] text-slate-500">
                  {startTime}
                </span>

                <span className="absolute bottom-1 right-[7%] font-mono text-[8px] text-slate-500">
                  {endTime}
                </span>
              </div>
            </div>
          </div>

          {/* Task selection */}
          <div className="overflow-hidden border border-slate-700/70 bg-slate-900/30">
            <div className="border-b border-slate-700 px-5 py-4">
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Maintenance Work Package
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Select compatible tasks for this candidate block.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                      Include
                    </th>
                    <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                      Task
                    </th>
                    <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                      Department
                    </th>
                    <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                      Location
                    </th>
                    <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                      Priority
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {eligibleTasks.map((task) => {
                    const selected = selectedTaskIds.includes(
                      task.id,
                    );

                    return (
                      <tr
                        key={task.id}
                        className={`border-b border-slate-800 last:border-b-0 ${
                          selected ? "bg-blue-500/[0.03]" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleTask(task.id)}
                            className="h-3.5 w-3.5 accent-blue-500"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-mono text-[9px] font-semibold text-slate-200">
                            {task.id}
                          </div>

                          <div className="mt-1 text-[8px] text-slate-500">
                            {task.maintenanceType}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-[9px] text-slate-400">
                          {departmentLabel(task.department)}
                        </td>

                        <td className="px-4 py-3 font-mono text-[9px] text-slate-400">
                          KM {task.km}
                        </td>

                        <td className="px-4 py-3 font-mono text-[9px] text-slate-400">
                          {task.estimatedDurationMinutes} min
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`border px-2 py-1 text-[8px] font-semibold ${priorityClass(
                              task.priority,
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resource allocation */}
          <div className="border border-slate-700/70 bg-slate-900/30">
            <div className="border-b border-slate-700 px-5 py-4">
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Required Resources
              </div>
            </div>

            <div className="grid gap-px bg-slate-800 sm:grid-cols-2 lg:grid-cols-4">
              {requiredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-[#0d151f] p-4"
                >
                  <div className="font-mono text-[9px] font-semibold text-slate-200">
                    {resource.id}
                  </div>

                  <div className="mt-1 truncate text-[8px] text-slate-500">
                    {resource.name}
                  </div>

                  <div
                    className={`mt-3 text-[8px] font-semibold ${
                      resource.status === "AVAILABLE"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {resource.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Validation panel */}
        <div className="space-y-4">
          <div className="border border-slate-700/70 bg-slate-900/30">
            <div className="border-b border-slate-700 px-4 py-4">
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Constraint Validation
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Pre-approval feasibility checks
              </div>
            </div>

            <div className="divide-y divide-slate-800 px-4">
              {validationChecks.map((check) => (
                <ValidationRow
                  key={check.label}
                  check={check}
                />
              ))}
            </div>
          </div>

          <div className="border border-blue-500/25 bg-blue-500/[0.03] p-4">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-400">
              Planning Recommendation
            </div>

            <p className="mt-3 text-[9px] leading-relaxed text-slate-400">
              The selected work package demonstrates a candidate
              cross-department maintenance opportunity. Final
              recommendation depends on train-impact simulation,
              operational constraints and human planner approval.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowAlternatives(true)}
                className="border border-slate-700 px-3 py-2.5 text-[8px] font-semibold text-slate-300 hover:bg-slate-800"
              >
                <button
  type="button"
  onClick={runBackendOptimization}
  disabled={isOptimizing || selectedTasks.length === 0}
  className="border border-blue-500 bg-blue-500/10 px-3 py-2 text-[10px] font-semibold tracking-wider text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
>
  {isOptimizing ? "OPTIMIZING..." : "OPTIMIZE CP-SAT"}
</button>
                ALTERNATIVES
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/simulation?block=${proposedBlock?.id ?? "BLK-DRAFT"}`,
                  )
                }
                className="border border-slate-700 px-3 py-2.5 text-[8px] font-semibold text-slate-300 hover:bg-slate-800"
              >
                SIMULATE
              </button>
            </div>
            {optimizationError && (
  <div className="mt-3 border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
    {optimizationError}
  </div>
)}

{backendOptimizationResult && (
  <div className="mt-4 border border-emerald-500/30 bg-emerald-500/5 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400">
          {unavailableResources.length > 0
  ? "Dynamic Replanned Schedule"
  : "CP-SAT Optimized Schedule"}
        </p>

        <h3 className="mt-1 text-sm font-semibold text-emerald-300">
          {backendOptimizationResult.status}
        </h3>
      </div>

      <div className="text-right">
        <p className="text-[10px] text-slate-400">
          Total Priority
        </p>

        <p className="text-lg font-semibold text-white">
          {backendOptimizationResult.total_priority_value}
        </p>
      </div>
    </div>

    <div className="mt-4 space-y-2">
      {backendOptimizationResult.scheduled_tasks
        .filter((task) => task.selected)
        .map((task) => (
          <div
            key={task.task_id}
            className="flex items-center justify-between border border-slate-700 bg-slate-900/50 px-3 py-2"
          >
            <span className="text-xs font-medium text-slate-200">
              {task.task_id}
            </span>

            <span className="text-xs font-medium text-slate-300">
  {addMinutesToTime(startTime, task.start_minute)}
  {" → "}
  {addMinutesToTime(startTime, task.end_minute)}
</span>
          </div>
        ))}
    </div>

    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
      <div className="border border-slate-700 p-2">
        <p className="text-[9px] uppercase text-slate-500">
          Tasks Selected
        </p>
        <p className="mt-1 text-sm font-semibold text-white">
          {backendOptimizationResult.selected_task_ids.length}
        </p>
      </div>

      <div className="border border-slate-700 p-2">
        <p className="text-[9px] uppercase text-slate-500">
          Block Window
        </p>
        <p className="mt-1 text-sm font-semibold text-white">
          {backendOptimizationResult.block_duration_minutes} min
        </p>
      </div>

      <div className="border border-slate-700 p-2">
        <p className="text-[9px] uppercase text-slate-500">
          Planned Span
        </p>
        <p className="mt-1 text-sm font-semibold text-white">
          {Math.max(
            ...backendOptimizationResult.scheduled_tasks
              .filter((task) => task.selected)
              .map((task) => task.end_minute),
          )}{" "}
          min
        </p>
      </div>
    </div>
    <div className="mt-4 border-t border-slate-700 pt-4">
  <div className="flex items-center justify-between gap-3">
    <div>
      <p className="text-[10px] uppercase tracking-wider text-orange-300">
        Dynamic Replanning
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        Simulate OHE-T2 becoming unavailable during the maintenance block.
      </p>
    </div>

    <button
      type="button"
      onClick={simulateResourceFailureAndReplan}
      disabled={isReplanning}
      className="border border-orange-500/50 bg-orange-500/10 px-3 py-2 text-[10px] font-semibold tracking-wider text-orange-300 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isReplanning ? "REPLANNING..." : "SIMULATE FAILURE + REPLAN"}
    </button>
  </div>

  {unavailableResources.length > 0 && (
    <div className="mt-3 border border-orange-500/30 bg-orange-500/5 p-3">
      <p className="text-[10px] font-semibold text-orange-300">
        RESOURCE DISRUPTION DETECTED
      </p>

      <p className="mt-1 text-xs text-slate-300">
        Unavailable: {unavailableResources.join(", ")}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        CP-SAT automatically recomputed the feasible maintenance plan.
      </p>
    </div>
  )}
</div>

    <p className="mt-3 text-[9px] leading-relaxed text-slate-500">
      Prototype optimization generated using OR-Tools CP-SAT.
      Safety-critical railway constraints remain subject to authorized
      operational validation and human planner approval.
    </p>
  </div>
)}

            <button
              type="button"
              onClick={validatePlan}
              disabled={
                selectedTasks.length === 0 ||
                duration <= 0 ||
                !sameSection ||
                !allResourcesAvailable
              }
              className="mt-2 w-full bg-blue-600 px-3 py-3 text-[9px] font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              VALIDATE CANDIDATE PLAN
            </button>

            <button
              type="button"
              onClick={approvePlan}
              disabled={planStatus !== "VALIDATED"}
              className="mt-2 w-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-3 text-[9px] font-semibold text-emerald-400 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-transparent disabled:text-slate-600"
            >
              HUMAN PLANNER APPROVAL
            </button>
          </div>

          <div className="border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="text-[8px] font-semibold uppercase tracking-wider text-amber-400">
              Safety Boundary
            </div>

            <p className="mt-2 text-[9px] leading-relaxed text-slate-500">
              RAILOPT 360 is a decision-support prototype. It does
              not autonomously authorize railway traffic or
              maintenance blocks. Operational and safety approval
              remains with authorized railway personnel.
            </p>
          </div>
        </div>
      </div>

      {/* Alternative plans */}
      {showAlternatives && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
          <div className="w-full max-w-4xl border border-slate-700 bg-[#0a1119] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
              <div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-blue-400">
                  Alternative Planning
                </div>

                <h2 className="mt-1 text-base font-semibold text-slate-100">
                  Candidate Plan Comparison
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowAlternatives(false)}
                className="border border-slate-700 px-3 py-2 text-[9px] text-slate-400 hover:bg-slate-800"
              >
                CLOSE
              </button>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-3">
              {alternativePlans.map((plan, index) => {
  const window =
    plan.id === "PLAN-A"
      ? `${startTime}–${endTime}`
      : plan.id === "PLAN-B"
        ? "14:25–15:55"
        : "13:50–16:20";

  return (
    <AlternativePlan
      key={plan.id}
      name={plan.id.replace("-", " ")}
      title={plan.name}
      window={window}
      tasks={plan.taskIds.length}
      score={plan.objectiveScore}
      feasible={plan.feasible}
      description={
        plan.explanation[0] ??
        "Candidate evaluated by the RAILOPT optimization engine."
      }
      recommended={index === 0 && plan.feasible}
    />
  );
})}
            </div>

            <div className="border-t border-slate-800 px-5 py-3 text-[8px] leading-relaxed text-slate-600">
              Alternative plans are prototype scenarios for
              comparison. They are not operational railway
              schedules.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="border border-slate-700/70 bg-slate-900/30 px-4 py-4">
      <div className="text-[8px] uppercase tracking-[0.14em] text-slate-600">
        {label}
      </div>

      <div className="mt-2 font-mono text-lg font-semibold text-slate-100">
        {value}
      </div>

      <div className="mt-1 text-[8px] uppercase tracking-wider text-slate-500">
        {note}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "DRAFT" | "VALIDATED" | "APPROVED";
}) {
  const style =
    status === "APPROVED"
      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
      : status === "VALIDATED"
        ? "border-blue-500/30 text-blue-400 bg-blue-500/5"
        : "border-slate-600 text-slate-400 bg-slate-800/30";

  return (
    <span
      className={`border px-2 py-1 font-mono text-[8px] font-semibold ${style}`}
    >
      {status}
    </span>
  );
}

function ValidationRow({
  check,
}: {
  check: ValidationCheck;
}) {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[9px] font-medium text-slate-300">
          {check.label}
        </span>

        <span
          className={`font-mono text-[8px] font-semibold ${
            check.status === "PASS"
              ? "text-emerald-400"
              : "text-amber-400"
          }`}
        >
          {check.status}
        </span>
      </div>

      <p className="mt-2 text-[8px] leading-relaxed text-slate-600">
        {check.detail}
      </p>
    </div>
  );
}

function AlternativePlan({
  name,
  title,
  window,
  tasks,
  score,
  feasible,
  description,
  recommended = false,
}: {
  name: string;
  title: string;
  window: string;
  tasks: number;
  score: number;
  feasible: boolean;
  description: string;
  recommended?: boolean;
}) {
  return (
    <div
      className={`border p-4 ${
        recommended
          ? "border-blue-500/40 bg-blue-500/[0.04]"
          : "border-slate-700 bg-slate-900/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] font-semibold text-slate-200">
          {name}
        </span>

        {recommended && (
          <span className="text-[7px] font-semibold uppercase tracking-wider text-blue-400">
            Recommended
          </span>
        )}
      </div>

      <h3 className="mt-3 text-sm font-semibold text-slate-200">
        {title}
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="border border-slate-800 p-2">
          <div className="text-[7px] uppercase text-slate-600">
            Window
          </div>
          <div className="mt-1 font-mono text-[9px] text-slate-300">
            {window}
          </div>
        </div>

        <div className="border border-slate-800 p-2">
          <div className="text-[7px] uppercase text-slate-600">
            Tasks
          </div>
          <div className="mt-1 font-mono text-[9px] text-slate-300">
            {tasks}
          </div>
        </div>
        <div className="border border-slate-800 p-2">
  <div className="text-[7px] uppercase text-slate-600">
    Objective Score
  </div>

  <div className="mt-1 font-mono text-[9px] text-slate-300">
    {score}/100
  </div>
</div>

<div className="border border-slate-800 p-2">
  <div className="text-[7px] uppercase text-slate-600">
    Feasibility
  </div>

  <div
    className={`mt-1 font-mono text-[9px] font-semibold ${
      feasible
        ? "text-emerald-400"
        : "text-red-400"
    }`}
  >
    {feasible ? "FEASIBLE" : "INFEASIBLE"}
  </div>
</div>
      </div>

      <p className="mt-4 text-[8px] leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}