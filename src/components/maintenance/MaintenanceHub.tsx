"use client";

import { useMemo, useState } from "react";
import { calculatePriority } from "@/lib/intelligence/priority-engine";
import { maintenanceTasks, railwaySections } from "@/data/mock-data";
import type {
  Department,
  MaintenancePriority,
  MaintenanceTask,
} from "@/types/railway";

type DepartmentFilter = "ALL" | Department;
type PriorityFilter = "ALL" | MaintenancePriority;

const priorityStyles: Record<MaintenancePriority, string> = {
  CRITICAL: "text-red-400 border-red-500/30 bg-red-500/5",
  HIGH: "text-amber-400 border-amber-500/30 bg-amber-500/5",
  MEDIUM: "text-blue-400 border-blue-500/30 bg-blue-500/5",
  LOW: "text-slate-400 border-slate-500/30 bg-slate-500/5",
};

const departmentLabels: Record<Department, string> = {
  ENGINEERING: "Engineering",
  TRACTION: "Traction / OHE",
  SNT: "Signal & Telecom",
};

function getSectionCode(sectionId: string) {
  return (
    railwaySections.find((section) => section.id === sectionId)?.code ??
    sectionId
  );
}

function getDueLabel(task: MaintenanceTask) {
  if (task.dueOffsetDays === 0) return "TODAY";
  if (task.dueOffsetDays === 1) return "+1 DAY";
  return `+${task.dueOffsetDays} DAYS`;
}

export function MaintenanceHub() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] =
    useState<DepartmentFilter>("ALL");
  const [priority, setPriority] =
    useState<PriorityFilter>("ALL");
  const [selectedTask, setSelectedTask] =
    useState<MaintenanceTask | null>(null);

  const filteredTasks = useMemo(() => {
    return maintenanceTasks.filter((task) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        task.id.toLowerCase().includes(query) ||
        task.assetLabel.toLowerCase().includes(query) ||
        task.maintenanceType.toLowerCase().includes(query);

      const matchesDepartment =
        department === "ALL" || task.department === department;

      const matchesPriority =
        priority === "ALL" || task.priority === priority;

      return matchesSearch && matchesDepartment && matchesPriority;
    });
  }, [search, department, priority]);

  const criticalCount = maintenanceTasks.filter(
    (task) => task.priority === "CRITICAL",
  ).length;

  const dueTodayCount = maintenanceTasks.filter(
    (task) => task.dueOffsetDays === 0,
  ).length;

  return (
    <section className="space-y-5">
      {/* Summary */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Maintenance Register
            </div>

            <h2 className="mt-1 text-lg font-semibold text-slate-200">
              Corridor Maintenance Requirements
            </h2>
          </div>

          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Simulation Dataset
          </div>
        </div>

        <div className="grid grid-cols-3 border border-slate-700/70 bg-slate-900/30">
          <SummaryItem
            value={maintenanceTasks.length}
            label="Open Tasks"
          />
          <SummaryItem
            value={criticalCount}
            label="Critical Tasks"
          />
          <SummaryItem
            value={dueTodayCount}
            label="Due Today"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="border border-slate-700/70 bg-slate-900/30 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search task ID, asset or maintenance type..."
            className="border border-slate-700 bg-[#0b121b] px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <select
            value={department}
            onChange={(event) =>
              setDepartment(event.target.value as DepartmentFilter)
            }
            className="border border-slate-700 bg-[#0b121b] px-3 py-2 text-sm text-slate-300 outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="ENGINEERING">Engineering</option>
            <option value="TRACTION">Traction / OHE</option>
            <option value="SNT">Signal & Telecom</option>
          </select>

          <select
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as PriorityFilter)
            }
            className="border border-slate-700 bg-[#0b121b] px-3 py-2 text-sm text-slate-300 outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Maintenance table */}
      <div className="overflow-hidden border border-slate-700/70 bg-slate-900/30">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead className="border-b border-slate-700 bg-slate-800/40">
              <tr className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                <th className="px-4 py-3 font-semibold">Task ID</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Maintenance</th>
                <th className="px-4 py-3 font-semibold">Section</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Duration</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="cursor-pointer border-b border-slate-800 transition-colors last:border-b-0 hover:bg-slate-800/40"
                >
                  <td className="px-4 py-4 font-mono text-xs font-semibold text-slate-200">
                    {task.id}
                  </td>

                  <td className="px-4 py-4 text-xs text-slate-400">
                    {departmentLabels[task.department]}
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-xs font-medium text-slate-200">
                      {task.maintenanceType}
                    </div>

                    <div className="mt-1 text-[10px] text-slate-500">
                      {task.assetLabel}
                    </div>
                  </td>

                  <td className="px-4 py-4 font-mono text-xs text-slate-300">
                    {getSectionCode(task.sectionId)}
                  </td>

                  <td className="px-4 py-4 font-mono text-xs text-slate-400">
                    KM {task.km}
                  </td>

                  <td className="px-4 py-4 font-mono text-xs text-slate-400">
                    {task.estimatedDurationMinutes} MIN
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`border px-2 py-1 text-[9px] font-semibold tracking-wider ${
                        priorityStyles[task.priority]
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-mono text-[10px] text-slate-300">
                      {getDueLabel(task)}
                    </div>

                    <div className="mt-1 font-mono text-[9px] text-slate-600">
                      {task.dueDate}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-[10px] font-semibold text-slate-400">
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredTasks.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No maintenance tasks match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-700 px-4 py-3">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">
            {filteredTasks.length} of {maintenanceTasks.length} tasks shown
          </span>

          <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500">
            Prototype / Simulated Data
          </span>
        </div>
      </div>

      {/* Selected task details */}
      {selectedTask && (
        <div className="border border-blue-500/30 bg-blue-500/[0.03] p-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
                Selected Maintenance Requirement
              </div>

              <div className="mt-2 flex items-center gap-3">
                <span className="font-mono text-lg font-semibold text-slate-100">
                  {selectedTask.id}
                </span>

                <span
                  className={`border px-2 py-1 text-[9px] font-semibold ${
                    priorityStyles[selectedTask.priority]
                  }`}
                >
                  {selectedTask.priority}
                </span>
              </div>

              <div className="mt-2 text-sm text-slate-300">
                {selectedTask.maintenanceType}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                {selectedTask.assetLabel}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="border border-slate-700 px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 hover:bg-slate-800"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid gap-px overflow-hidden border border-slate-700 bg-slate-700 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem
              label="Section"
              value={getSectionCode(selectedTask.sectionId)}
            />

            <DetailItem
              label="Location"
              value={`KM ${selectedTask.km}`}
            />

            <DetailItem
              label="Estimated Duration"
              value={`${selectedTask.estimatedDurationMinutes} MIN`}
            />

            <DetailItem
              label="Required Resources"
              value={selectedTask.requiredResourceIds.join(", ")}
            />
          </div>
          {/* Priority Intelligence */}
<div className="mt-5 border-t border-slate-800 pt-5">
  <div className="flex items-center justify-between">
    <div>
      <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-400">
        Priority Intelligence
      </div>

      <div className="mt-1 text-[8px] text-slate-600">
        Explainable weighted decision model
      </div>
    </div>

    <div className="text-right">
      <div className="font-mono text-xl font-semibold text-slate-100">
        {selectedTask.priorityScore}
        <span className="text-[10px] text-slate-600">
          /100
        </span>
      </div>

      <div className="mt-1 font-mono text-[8px] uppercase text-amber-400">
        Computed Score
      </div>
    </div>
  </div>

  {/* factor bars */}
  <div className="mt-5 space-y-4">
    <PriorityFactor
      label="Criticality"
      value={selectedTask.criticality}
    />

    <PriorityFactor
      label="Urgency"
      value={selectedTask.urgency}
    />

    <PriorityFactor
      label="Overdue Factor"
      value={selectedTask.overdueFactor}
    />

    <PriorityFactor
      label="Asset Risk"
      value={selectedTask.assetRisk}
    />

    <PriorityFactor
      label="Availability Impact"
      value={selectedTask.availabilityImpact}
    />
  </div>

  {/* explanation */}
  <div className="mt-5 border border-blue-500/20 bg-blue-500/[0.03] p-4">
    <div className="text-[8px] font-semibold uppercase tracking-[0.16em] text-blue-400">
      Why this priority?
    </div>

    <div className="mt-3 space-y-2">
      {calculatePriority({
        criticality: selectedTask.criticality,
        urgency: selectedTask.urgency,
        overdueFactor: selectedTask.overdueFactor,
        assetRisk: selectedTask.assetRisk,
        availabilityImpact:
          selectedTask.availabilityImpact,
      }).explanation.map((reason) => (
        <div
          key={reason}
          className="flex items-start gap-2 text-[8px] leading-relaxed text-slate-400"
        >
          <span className="mt-[2px] text-blue-400">
            ›
          </span>

          <span>{reason}</span>
        </div>
      ))}
    </div>
  </div>

  <div className="mt-3 text-[7px] uppercase tracking-wider text-slate-700">
    Prototype decision model · Synthetic factor inputs
  </div>
</div>
        </div>
      )}
    </section>
  );
}

function SummaryItem({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="border-r border-slate-700 px-5 py-4 last:border-r-0">
      <div className="font-mono text-xl font-semibold text-slate-100">
        {value}
      </div>

      <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#0d151f] p-4">
      <div className="text-[9px] uppercase tracking-[0.15em] text-slate-600">
        {label}
      </div>

      <div className="mt-2 font-mono text-xs text-slate-300">
        {value}
      </div>
    </div>
  );
}
function PriorityFactor({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[8px] uppercase tracking-wider text-slate-500">
          {label}
        </span>

        <span className="font-mono text-[8px] font-semibold text-slate-300">
          {value}
        </span>
      </div>

      <div className="mt-2 h-1.5 bg-slate-800">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}