"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  blockWindows,
  maintenanceTasks,
  resources,
} from "@/data/mock-data";
import type { MaintenanceTask } from "@/types/railway";

type ExecutionState =
  | "READY"
  | "IN_PROGRESS"
  | "COMPLETED";

type TaskExecutionState =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED";

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

export function ExecutionCenter() {
      const searchParams = useSearchParams();

  const approvedTaskIds = useMemo(() => {
    const tasksParam = searchParams.get("tasks");

    if (!tasksParam) return null;

    return tasksParam
      .split(",")
      .map((taskId) => taskId.trim())
      .filter(Boolean);
  }, [searchParams]);
  const block = blockWindows[0];

    const blockTasks = useMemo(() => {
    if (approvedTaskIds && approvedTaskIds.length > 0) {
      return maintenanceTasks.filter((task) =>
        approvedTaskIds.includes(task.id),
      );
    }

    if (!block) return [];

    return maintenanceTasks.filter((task) =>
      block.includedTaskIds.includes(task.id),
    );
  }, [block, approvedTaskIds]);

  const [executionState, setExecutionState] =
    useState<ExecutionState>("READY");

  const [taskStates, setTaskStates] = useState<
    Record<string, TaskExecutionState>
  >(() =>
    Object.fromEntries(
      blockTasks.map((task) => [task.id, "PENDING"]),
    ),
  );

  const [selectedTaskId, setSelectedTaskId] =
    useState<string | null>(null);

  const selectedTask = blockTasks.find(
    (task) => task.id === selectedTaskId,
  );

  const completedTasks = Object.values(taskStates).filter(
    (state) => state === "COMPLETED",
  ).length;

  const progress =
    blockTasks.length > 0
      ? Math.round(
          (completedTasks / blockTasks.length) * 100,
        )
      : 0;

  const startExecution = () => {
    setExecutionState("IN_PROGRESS");

    if (blockTasks[0]) {
      setTaskStates((current) => ({
        ...current,
        [blockTasks[0].id]: "IN_PROGRESS",
      }));
    }
  };

  const completeTask = (taskId: string) => {
    setTaskStates((current) => {
      const next = {
        ...current,
        [taskId]: "COMPLETED" as TaskExecutionState,
      };

      const nextPendingTask = blockTasks.find(
        (task) => next[task.id] === "PENDING",
      );

      if (nextPendingTask) {
        next[nextPendingTask.id] = "IN_PROGRESS";
      }

      return next;
    });
  };

  const completeBlock = () => {
    const allComplete = blockTasks.every(
      (task) => taskStates[task.id] === "COMPLETED",
    );

    if (allComplete) {
      setExecutionState("COMPLETED");
    }
  };

  const activeTask = blockTasks.find(
    (task) => taskStates[task.id] === "IN_PROGRESS",
  );

  const requiredResourceIds = Array.from(
    new Set(
      blockTasks.flatMap(
        (task) => task.requiredResourceIds,
      ),
    ),
  );

  return (
    <section className="space-y-5">
      {/* execution header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-blue-500/20 bg-blue-500/[0.03] px-4 py-3">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-400">
            Execution Monitoring
          </div>

          <div className="mt-1 text-xs text-slate-300">
            Candidate maintenance block{" "}
            <span className="font-mono font-semibold text-slate-100">
              {block?.id ?? "BLK-DRAFT"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[8px] uppercase text-amber-500">
            Simulation
          </span>

          <ExecutionBadge status={executionState} />
        </div>
      </div>

      {/* metrics */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Execution Progress"
          value={`${progress}%`}
          note={`${completedTasks}/${blockTasks.length} tasks`}
        />

        <Metric
          label="Block Window"
          value={
            block
              ? `${block.startTime}–${block.endTime}`
              : "—"
          }
          note={
            block
              ? `${block.durationMinutes} min`
              : "No block"
          }
        />

        <Metric
          label="Active Task"
          value={activeTask?.id ?? "—"}
          note={
            activeTask
              ? departmentLabel(activeTask.department)
              : "None"
          }
        />

        <Metric
          label="Resources"
          value={String(requiredResourceIds.length)}
          note="Required"
        />

        <Metric
          label="Execution State"
          value={executionState}
          note="Prototype"
        />
      </div>

      {/* progress bar */}
      <div className="border border-slate-700/70 bg-slate-900/30 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Block Execution Progress
            </div>

            <div className="mt-1 text-xs text-slate-400">
              Cross-department maintenance work package
            </div>
          </div>

          <span className="font-mono text-lg font-semibold text-slate-200">
            {progress}%
          </span>
        </div>

        <div className="mt-5 h-2 bg-slate-800">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between font-mono text-[8px] text-slate-600">
          <span>
            {block?.startTime ?? "--:--"}
          </span>

          <span>
            {block?.endTime ?? "--:--"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        {/* execution table */}
        <div className="overflow-hidden border border-slate-700/70 bg-slate-900/30">
          <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Maintenance Execution Queue
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Department-wise task monitoring
              </div>
            </div>

            {executionState === "READY" && (
              <button
                type="button"
                onClick={startExecution}
                className="bg-blue-600 px-4 py-2.5 text-[8px] font-semibold text-white hover:bg-blue-500"
              >
                START EXECUTION
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-800 text-left">
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
                    Planned
                  </th>

                  <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                    Priority
                  </th>

                  <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                    Status
                  </th>

                  <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {blockTasks.map((task) => {
                  const state =
                    taskStates[task.id] ?? "PENDING";

                  return (
                    <tr
                      key={task.id}
                      onClick={() =>
                        setSelectedTaskId(task.id)
                      }
                      className="cursor-pointer border-b border-slate-800 transition hover:bg-slate-800/40 last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <div className="font-mono text-[9px] font-semibold text-slate-200">
                          {task.id}
                        </div>

                        <div className="mt-1 text-[8px] text-slate-500">
                          {task.maintenanceType}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-[9px] text-slate-400">
                        {departmentLabel(
                          task.department,
                        )}
                      </td>

                      <td className="px-4 py-4 font-mono text-[9px] text-slate-400">
                        {task.sectionId} · KM {task.km}
                      </td>

                      <td className="px-4 py-4 font-mono text-[9px] text-slate-400">
                        {task.estimatedDurationMinutes} min
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`border px-2 py-1 text-[8px] font-semibold ${priorityClass(
                            task.priority,
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <TaskStateBadge state={state} />
                      </td>

                      <td
                        className="px-4 py-4"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        {state === "IN_PROGRESS" ? (
                          <button
                            type="button"
                            onClick={() =>
                              completeTask(task.id)
                            }
                            className="border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-[8px] font-semibold text-emerald-400 hover:bg-emerald-500/10"
                          >
                            COMPLETE
                          </button>
                        ) : (
                          <span className="text-[8px] text-slate-700">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* side panels */}
        <div className="space-y-4">
          <div className="border border-slate-700/70 bg-slate-900/30">
            <div className="border-b border-slate-700 px-4 py-4">
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Execution Resources
              </div>
            </div>

            <div className="space-y-2 p-4">
              {requiredResourceIds.map((resourceId) => {
                const resource = resources.find(
                  (item) => item.id === resourceId,
                );

                return (
                  <div
                    key={resourceId}
                    className="flex items-center justify-between border border-slate-800 bg-[#0b121b] px-3 py-3"
                  >
                    <div>
                      <div className="font-mono text-[9px] font-semibold text-slate-300">
                        {resourceId}
                      </div>

                      <div className="mt-1 text-[8px] text-slate-600">
                        {resource?.name ?? "Resource"}
                      </div>
                    </div>

                    <span className="text-[8px] font-semibold text-emerald-400">
                      {executionState === "IN_PROGRESS"
                        ? "DEPLOYED"
                        : executionState ===
                            "COMPLETED"
                          ? "RELEASED"
                          : "READY"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedTask ? (
            <TaskDetails
              task={selectedTask}
              state={
                taskStates[selectedTask.id] ??
                "PENDING"
              }
              onClose={() =>
                setSelectedTaskId(null)
              }
            />
          ) : (
            <div className="border border-slate-700/70 bg-slate-900/30 p-6 text-center">
              <div className="font-mono text-[9px] text-slate-500">
                SELECT EXECUTION TASK
              </div>

              <p className="mt-2 text-[8px] leading-relaxed text-slate-600">
                Select a maintenance task to inspect its
                execution details and resource requirements.
              </p>
            </div>
          )}

          {executionState === "IN_PROGRESS" && (
            <button
              type="button"
              onClick={completeBlock}
              disabled={completedTasks !== blockTasks.length}
              className="w-full border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-[9px] font-semibold text-emerald-400 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-transparent disabled:text-slate-600"
            >
              COMPLETE MAINTENANCE BLOCK
            </button>
          )}
        </div>
      </div>

      {/* planned vs actual */}
      <div className="border border-slate-700/70 bg-slate-900/30">
        <div className="border-b border-slate-700 px-5 py-4">
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Planned vs Execution
          </div>

          <div className="mt-1 text-xs text-slate-400">
            Feedback data for future planning intelligence
          </div>
        </div>

        <div className="grid gap-px bg-slate-800 md:grid-cols-4">
          <Comparison
            label="Planned Tasks"
            value={String(blockTasks.length)}
          />

          <Comparison
            label="Completed Tasks"
            value={String(completedTasks)}
          />

          <Comparison
            label="Planned Duration"
            value={
              block
                ? `${block.durationMinutes} MIN`
                : "—"
            }
          />

          <Comparison
            label="Execution Result"
            value={
              executionState === "COMPLETED"
                ? "COMPLETED"
                : "IN PROGRESS"
            }
            highlighted={
              executionState === "COMPLETED"
            }
          />
        </div>
      </div>

      {executionState === "COMPLETED" && (
        <div className="border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Execution Complete
          </div>

          <p className="mt-3 max-w-4xl text-[9px] leading-relaxed text-slate-400">
            All maintenance tasks in the simulated block
            have been completed. Execution results can now
            feed the analytics and learning layer for future
            duration estimation, resource planning and block
            optimization.
          </p>
        </div>
      )}

      <div className="border border-amber-500/20 bg-amber-500/[0.03] px-4 py-3">
        <p className="text-[8px] leading-relaxed text-slate-500">
          Execution controls represent a simulated SIH
          prototype workflow. They do not operate railway
          assets, authorize blocks, dispatch personnel or
          interface with live Indian Railways control
          systems.
        </p>
      </div>
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

      <div className="mt-2 truncate font-mono text-lg font-semibold text-slate-100">
        {value}
      </div>

      <div className="mt-1 text-[8px] uppercase tracking-wider text-slate-500">
        {note}
      </div>
    </div>
  );
}

function ExecutionBadge({
  status,
}: {
  status: ExecutionState;
}) {
  const style =
    status === "COMPLETED"
      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
      : status === "IN_PROGRESS"
        ? "border-blue-500/30 bg-blue-500/5 text-blue-400"
        : "border-slate-600 bg-slate-800/30 text-slate-400";

  return (
    <span
      className={`border px-2 py-1 font-mono text-[8px] font-semibold ${style}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function TaskStateBadge({
  state,
}: {
  state: TaskExecutionState;
}) {
  const style =
    state === "COMPLETED"
      ? "text-emerald-400"
      : state === "IN_PROGRESS"
        ? "text-blue-400"
        : "text-slate-500";

  return (
    <span
      className={`font-mono text-[8px] font-semibold ${style}`}
    >
      {state.replace("_", " ")}
    </span>
  );
}

function TaskDetails({
  task,
  state,
  onClose,
}: {
  task: MaintenanceTask;
  state: TaskExecutionState;
  onClose: () => void;
}) {
  return (
    <div className="border border-blue-500/25 bg-blue-500/[0.03] p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[8px] uppercase tracking-[0.16em] text-blue-400">
            Execution Detail
          </div>

          <div className="mt-2 font-mono text-base font-semibold text-slate-100">
            {task.id}
          </div>

          <div className="mt-1 text-[9px] text-slate-400">
            {task.maintenanceType}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="border border-slate-700 px-2 py-1 text-[8px] text-slate-500 hover:bg-slate-800"
        >
          CLOSE
        </button>
      </div>

      <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
        <Detail
          label="Department"
          value={departmentLabel(task.department)}
        />

        <Detail
          label="Location"
          value={`${task.sectionId} · KM ${task.km}`}
        />

        <Detail
          label="Planned Duration"
          value={`${task.estimatedDurationMinutes} MIN`}
        />

        <Detail
          label="Execution State"
          value={state.replace("_", " ")}
        />

        <Detail
          label="Resources"
          value={task.requiredResourceIds.join(", ")}
        />
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[8px] text-slate-600">
        {label}
      </span>

      <span className="text-right font-mono text-[8px] text-slate-300">
        {value}
      </span>
    </div>
  );
}

function Comparison({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`p-5 ${
        highlighted
          ? "bg-emerald-500/[0.04]"
          : "bg-[#0d151f]"
      }`}
    >
      <div className="text-[8px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div
        className={`mt-3 font-mono text-lg font-semibold ${
          highlighted
            ? "text-emerald-400"
            : "text-slate-200"
        }`}
      >
        {value}
      </div>
    </div>
  );
}