"use client";

import { useMemo, useState } from "react";
import {
  blockWindows,
  maintenanceTasks,
  resources,
  trains,
} from "@/data/mock-data";

type Period = "CURRENT" | "WEEK" | "MONTH";

interface DepartmentStat {
  name: string;
  tasks: number;
  percentage: number;
}

function departmentLabel(department: string) {
  if (department === "ENGINEERING") return "Engineering";
  if (department === "TRACTION") return "Traction / OHE";
  return "Signal & Telecom";
}

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>("CURRENT");

  const block = blockWindows[0];

  const blockTasks = useMemo(() => {
    if (!block) return [];

    return maintenanceTasks.filter((task) =>
      block.includedTaskIds.includes(task.id),
    );
  }, [block]);

  const departmentStats: DepartmentStat[] = useMemo(() => {
    const departments = [
      "ENGINEERING",
      "TRACTION",
      "SNT",
    ];

    return departments.map((department) => {
      const tasks = maintenanceTasks.filter(
        (task) => task.department === department,
      ).length;

      return {
        name: departmentLabel(department),
        tasks,
        percentage:
          maintenanceTasks.length > 0
            ? Math.round(
                (tasks / maintenanceTasks.length) * 100,
              )
            : 0,
      };
    });
  }, []);

  /*
    Prototype analytics:
    These values describe the current synthetic demonstration
    scenario. They are not Indian Railways operational KPIs.
  */

  const independentBlocks = Math.max(blockTasks.length, 1);

  const consolidatedBlocks =
    blockTasks.length > 0 ? 1 : 0;

  const blocksAvoided = Math.max(
    0,
    independentBlocks - consolidatedBlocks,
  );

  const consolidationRate =
    independentBlocks > 0
      ? Math.round(
          (blocksAvoided / independentBlocks) * 100,
        )
      : 0;

  const blockUtilization = 87;

  const affectedTrains = Math.min(2, trains.length);

  const availableResources = resources.filter(
    (resource) => resource.status === "AVAILABLE",
  ).length;

  const resourceAvailability =
    resources.length > 0
      ? Math.round(
          (availableResources / resources.length) * 100,
        )
      : 0;

  const criticalTasks = maintenanceTasks.filter(
    (task) => task.priority === "CRITICAL",
  ).length;

  const highTasks = maintenanceTasks.filter(
    (task) => task.priority === "HIGH",
  ).length;

  return (
    <section className="space-y-5">
      {/* context */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-blue-500/20 bg-blue-500/[0.03] px-4 py-3">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-400">
            Performance Intelligence
          </div>

          <div className="mt-1 text-xs text-slate-300">
            RAILOPT planning and maintenance performance
            analysis
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value as Period)
            }
            className="border border-slate-700 bg-[#0b121b] px-3 py-2 text-[9px] text-slate-300 outline-none"
          >
            <option value="CURRENT">
              Current Scenario
            </option>
            <option value="WEEK">
              Weekly Simulation
            </option>
            <option value="MONTH">
              Monthly Simulation
            </option>
          </select>

          <span className="border border-amber-500/30 bg-amber-500/5 px-2 py-1 font-mono text-[8px] font-semibold uppercase text-amber-400">
            Simulation Metrics
          </span>
        </div>
      </div>

      {/* headline KPIs */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <Metric
          label="Maintenance Tasks"
          value={String(maintenanceTasks.length)}
          note="Synthetic dataset"
        />

        <Metric
          label="Tasks Consolidated"
          value={String(blockTasks.length)}
          note="Candidate block"
        />

        <Metric
          label="Blocks Avoided"
          value={String(blocksAvoided)}
          note="Scenario comparison"
          positive
        />

        <Metric
          label="Block Utilization"
          value={`${blockUtilization}%`}
          note="Prototype indicator"
          positive
        />

        <Metric
          label="Affected Trains"
          value={String(affectedTrains)}
          note="Simulated"
        />

        <Metric
          label="Resource Availability"
          value={`${resourceAvailability}%`}
          note="Current dataset"
        />
      </div>

      {/* primary comparison */}
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="border border-slate-700/70 bg-slate-900/30">
          <div className="border-b border-slate-700 px-5 py-4">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Planning Efficiency
            </div>

            <div className="mt-1 text-xs text-slate-400">
              Independent maintenance requests vs integrated
              candidate planning
            </div>
          </div>

          <div className="grid gap-px bg-slate-800 md:grid-cols-3">
            <ComparisonCard
              label="Independent Planning"
              value={`${independentBlocks} Blocks`}
              note={`${blockTasks.length} maintenance requirements`}
            />

            <ComparisonCard
              label="RAILOPT Candidate"
              value={`${consolidatedBlocks} Block`}
              note={`${blockTasks.length} tasks coordinated`}
              highlighted
            />

            <ComparisonCard
              label="Block Reduction"
              value={`${consolidationRate}%`}
              note={`${blocksAvoided} candidate blocks avoided`}
              positive
            />
          </div>

          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[8px] uppercase tracking-wider text-slate-600">
                Consolidation Visualization
              </span>

              <span className="font-mono text-[8px] text-slate-500">
                PROTOTYPE
              </span>
            </div>

            <BarRow
              label="Independent Planning"
              value={100}
              display={`${independentBlocks} blocks`}
            />

            <BarRow
              label="RAILOPT Candidate"
              value={
                independentBlocks > 0
                  ? Math.max(
                      10,
                      Math.round(
                        (consolidatedBlocks /
                          independentBlocks) *
                          100,
                      ),
                    )
                  : 0
              }
              display={`${consolidatedBlocks} block`}
              highlighted
            />
          </div>
        </div>

        {/* maintenance intelligence */}
        <div className="border border-slate-700/70 bg-slate-900/30">
          <div className="border-b border-slate-700 px-5 py-4">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Maintenance Intelligence
            </div>

            <div className="mt-1 text-xs text-slate-400">
              Current corridor workload profile
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-slate-800">
            <MiniMetric
              label="Critical"
              value={String(criticalTasks)}
              tone="critical"
            />

            <MiniMetric
              label="High Priority"
              value={String(highTasks)}
              tone="warning"
            />

            <MiniMetric
              label="Departments"
              value="3"
            />

            <MiniMetric
              label="Resources"
              value={String(resources.length)}
            />
          </div>

          <div className="p-5">
            <div className="text-[8px] uppercase tracking-wider text-slate-600">
              Department Workload
            </div>

            <div className="mt-5 space-y-5">
              {departmentStats.map((department) => (
                <div key={department.name}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400">
                      {department.name}
                    </span>

                    <span className="font-mono text-[8px] text-slate-500">
                      {department.tasks} TASKS
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 bg-slate-800">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${department.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* block performance */}
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="border border-slate-700/70 bg-slate-900/30">
          <div className="border-b border-slate-700 px-5 py-4">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Block Performance
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[8px] uppercase tracking-wider text-slate-600">
                  Utilization
                </div>

                <div className="mt-2 font-mono text-3xl font-semibold text-slate-100">
                  {blockUtilization}%
                </div>
              </div>

              <span className="font-mono text-[8px] text-blue-400">
                SIMULATED
              </span>
            </div>

            <div className="mt-5 h-3 bg-slate-800">
              <div
                className="h-full bg-blue-500"
                style={{
                  width: `${blockUtilization}%`,
                }}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Info
                label="Block"
                value={block?.id ?? "—"}
              />

              <Info
                label="Duration"
                value={
                  block
                    ? `${block.durationMinutes} MIN`
                    : "—"
                }
              />

              <Info
                label="Tasks"
                value={String(blockTasks.length)}
              />

              <Info
                label="Departments"
                value={String(
                  new Set(
                    blockTasks.map(
                      (task) => task.department,
                    ),
                  ).size,
                )}
              />
            </div>
          </div>
        </div>

        {/* task table */}
        <div className="overflow-hidden border border-slate-700/70 bg-slate-900/30">
          <div className="border-b border-slate-700 px-5 py-4">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Candidate Block Composition
            </div>

            <div className="mt-1 text-xs text-slate-400">
              Cross-department maintenance included in the
              simulated block
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
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
                    Duration
                  </th>

                  <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                    Priority
                  </th>
                </tr>
              </thead>

              <tbody>
                {blockTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-slate-800 last:border-b-0"
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
                      {task.estimatedDurationMinutes} MIN
                    </td>

                    <td className="px-4 py-4">
                      <PriorityBadge
                        priority={task.priority}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* outcome strip */}
      <div className="grid gap-px border border-slate-700 bg-slate-800 md:grid-cols-4">
        <Outcome
          label="Maintenance Coordination"
          value={`${blockTasks.length} Tasks`}
          note="Candidate consolidation"
        />

        <Outcome
          label="Block Reduction"
          value={`${consolidationRate}%`}
          note="Scenario comparison"
          positive
        />

        <Outcome
          label="Block Utilization"
          value={`${blockUtilization}%`}
          note="Prototype metric"
          positive
        />

        <Outcome
          label="Train Interaction"
          value={`${affectedTrains} Trains`}
          note="Simulation review"
        />
      </div>

      {/* insight */}
      <div className="border border-blue-500/25 bg-blue-500/[0.03] p-5">
        <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-400">
          RAILOPT Planning Insight
        </div>

        <p className="mt-3 max-w-5xl text-[9px] leading-relaxed text-slate-400">
          In the current synthetic corridor scenario,
          RAILOPT identifies a cross-department maintenance
          opportunity and represents multiple maintenance
          requirements inside one candidate block. The
          simulation demonstrates how integrated planning can
          reduce fragmented block requests while maintaining
          visibility of train impact, resource availability
          and safety constraints.
        </p>
      </div>

      {/* disclaimer */}
      <div className="border border-amber-500/20 bg-amber-500/[0.03] px-4 py-3">
        <p className="text-[8px] leading-relaxed text-slate-500">
          All analytics shown in this prototype are generated
          from synthetic demonstration data. Values such as
          block reduction, utilization and train impact are
          simulation outputs and must not be interpreted as
          measured Indian Railways operational performance.
        </p>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  note,
  positive = false,
}: {
  label: string;
  value: string;
  note: string;
  positive?: boolean;
}) {
  return (
    <div className="border border-slate-700/70 bg-slate-900/30 px-4 py-4">
      <div className="text-[8px] uppercase tracking-[0.14em] text-slate-600">
        {label}
      </div>

      <div
        className={`mt-2 font-mono text-lg font-semibold ${
          positive
            ? "text-emerald-400"
            : "text-slate-100"
        }`}
      >
        {value}
      </div>

      <div className="mt-1 text-[8px] uppercase tracking-wider text-slate-500">
        {note}
      </div>
    </div>
  );
}

function ComparisonCard({
  label,
  value,
  note,
  highlighted = false,
  positive = false,
}: {
  label: string;
  value: string;
  note: string;
  highlighted?: boolean;
  positive?: boolean;
}) {
  return (
    <div
      className={`p-5 ${
        highlighted
          ? "bg-blue-500/[0.04]"
          : "bg-[#0d151f]"
      }`}
    >
      <div
        className={`text-[8px] uppercase tracking-wider ${
          highlighted
            ? "text-blue-400"
            : "text-slate-600"
        }`}
      >
        {label}
      </div>

      <div
        className={`mt-3 font-mono text-xl font-semibold ${
          positive
            ? "text-emerald-400"
            : "text-slate-100"
        }`}
      >
        {value}
      </div>

      <div className="mt-2 text-[8px] text-slate-500">
        {note}
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  display,
  highlighted = false,
}: {
  label: string;
  value: number;
  display: string;
  highlighted?: boolean;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-slate-400">
          {label}
        </span>

        <span className="font-mono text-[8px] text-slate-500">
          {display}
        </span>
      </div>

      <div className="mt-2 h-2 bg-slate-800">
        <div
          className={`h-full ${
            highlighted
              ? "bg-blue-500"
              : "bg-slate-600"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "critical" | "warning";
}) {
  const valueClass =
    tone === "critical"
      ? "text-red-400"
      : tone === "warning"
        ? "text-amber-400"
        : "text-slate-200";

  return (
    <div className="bg-[#0d151f] p-4">
      <div className="text-[8px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div
        className={`mt-2 font-mono text-xl font-semibold ${valueClass}`}
      >
        {value}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border border-slate-800 bg-[#0b121b] p-3">
      <div className="text-[8px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-2 font-mono text-[9px] font-semibold text-slate-300">
        {value}
      </div>
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: string;
}) {
  const style =
    priority === "CRITICAL"
      ? "border-red-500/30 text-red-400 bg-red-500/5"
      : priority === "HIGH"
        ? "border-amber-500/30 text-amber-400 bg-amber-500/5"
        : priority === "MEDIUM"
          ? "border-blue-500/30 text-blue-400 bg-blue-500/5"
          : "border-slate-600 text-slate-400";

  return (
    <span
      className={`border px-2 py-1 text-[8px] font-semibold ${style}`}
    >
      {priority}
    </span>
  );
}

function Outcome({
  label,
  value,
  note,
  positive = false,
}: {
  label: string;
  value: string;
  note: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-[#0d151f] p-5">
      <div className="text-[8px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div
        className={`mt-2 font-mono text-lg font-semibold ${
          positive
            ? "text-emerald-400"
            : "text-slate-200"
        }`}
      >
        {value}
      </div>

      <div className="mt-1 text-[8px] text-slate-500">
        {note}
      </div>
    </div>
  );
}