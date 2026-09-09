"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  maintenanceTasks,
  railwaySections,
  resources,
} from "@/data/mock-data";
import type {
  Department,
  MaintenancePriority,
  TaskStatus,
} from "@/types/railway";
import {
  CheckCircle2,
  ChevronRight,
  Filter,
  Search,
  Send,
  SlidersHorizontal,
  Wrench,
  X,
} from "lucide-react";

type SortField = "priority" | "dueDate" | "km" | "duration";

const priorityRank: Record<MaintenancePriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function priorityClass(priority: MaintenancePriority) {
  switch (priority) {
    case "CRITICAL":
      return "text-[var(--critical-red)]";
    case "HIGH":
      return "text-[var(--maintenance-amber)]";
    case "MEDIUM":
      return "text-[var(--planning-blue)]";
    default:
      return "text-[var(--secondary-text)]";
  }
}

function departmentLabel(department: Department) {
  if (department === "ENGINEERING") return "Engineering";
  if (department === "TRACTION") return "Traction / OHE";
  return "Signal & Telecom";
}

export function MaintenanceHub() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<Department | "ALL">("ALL");
  const [priority, setPriority] = useState<MaintenancePriority | "ALL">("ALL");
  const [section, setSection] = useState("ALL");
  const [status, setStatus] = useState<TaskStatus | "ALL">("ALL");
  const [sortField, setSortField] = useState<SortField>("priority");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = maintenanceTasks.filter((task) => {
      const matchesSearch =
        !normalizedSearch ||
        task.id.toLowerCase().includes(normalizedSearch) ||
        task.assetLabel.toLowerCase().includes(normalizedSearch) ||
        task.maintenanceType.toLowerCase().includes(normalizedSearch);

      const matchesDepartment =
        department === "ALL" || task.department === department;

      const matchesPriority =
        priority === "ALL" || task.priority === priority;

      const matchesSection =
        section === "ALL" || task.sectionId === section;

      const matchesStatus =
        status === "ALL" || task.status === status;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesPriority &&
        matchesSection &&
        matchesStatus
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortField === "priority") {
        return priorityRank[a.priority] - priorityRank[b.priority];
      }

      if (sortField === "dueDate") {
        return a.dueOffsetDays - b.dueOffsetDays;
      }

      if (sortField === "km") {
        return a.km - b.km;
      }

      return a.estimatedDurationMinutes - b.estimatedDurationMinutes;
    });
  }, [search, department, priority, section, status, sortField]);

  const selectedTask = maintenanceTasks.find(
    (task) => task.id === selectedTaskId,
  );

  const selectedSection = selectedTask
    ? railwaySections.find(
        (sectionItem) => sectionItem.id === selectedTask.sectionId,
      )
    : undefined;

  const selectedResources = selectedTask
    ? resources.filter((resource) =>
        selectedTask.requiredResourceIds.includes(resource.id),
      )
    : [];

  const clearFilters = () => {
    setSearch("");
    setDepartment("ALL");
    setPriority("ALL");
    setSection("ALL");
    setStatus("ALL");
    setSortField("priority");
  };

  return (
    <>
      <section className="space-y-4">
        {/* Toolbar */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-4 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary-text)]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search task ID, asset or maintenance type..."
                className="w-full rounded border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-3 text-[10px] text-[var(--primary-text)] outline-none placeholder:text-[var(--secondary-text)] focus:border-[var(--planning-blue)]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={department}
                onChange={(event) =>
                  setDepartment(event.target.value as Department | "ALL")
                }
                className="rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[9px] text-[var(--primary-text)]"
              >
                <option value="ALL">All Departments</option>
                <option value="ENGINEERING">Engineering</option>
                <option value="TRACTION">Traction / OHE</option>
                <option value="SNT">Signal & Telecom</option>
              </select>

              <select
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value as MaintenancePriority | "ALL",
                  )
                }
                className="rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[9px] text-[var(--primary-text)]"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <select
                value={section}
                onChange={(event) => setSection(event.target.value)}
                className="rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[9px] text-[var(--primary-text)]"
              >
                <option value="ALL">All Sections</option>
                {railwaySections.map((sectionItem) => (
                  <option key={sectionItem.id} value={sectionItem.id}>
                    {sectionItem.code}
                  </option>
                ))}
              </select>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TaskStatus | "ALL")
                }
                className="rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[9px] text-[var(--primary-text)]"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PLANNING">Planning</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="APPROVED">Approved</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                value={sortField}
                onChange={(event) =>
                  setSortField(event.target.value as SortField)
                }
                className="rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[9px] text-[var(--primary-text)]"
              >
                <option value="priority">Sort: Priority</option>
                <option value="dueDate">Sort: Due Date</option>
                <option value="km">Sort: KM</option>
                <option value="duration">Sort: Duration</option>
              </select>

              <button
                onClick={clearFilters}
                className="flex items-center gap-2 rounded border border-[var(--border)] px-3 py-2 text-[9px] text-[var(--secondary-text)] hover:bg-[var(--panel-hover)]"
              >
                <Filter size={12} />
                RESET
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={12}
                className="text-[var(--secondary-text)]"
              />
              <span className="text-[9px] text-[var(--secondary-text)]">
                Showing {filteredTasks.length} of {maintenanceTasks.length} tasks
              </span>
            </div>

            <span className="text-[8px] uppercase tracking-[0.12em] text-[var(--secondary-text)]">
              Simulation dataset
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  {[
                    "Task ID",
                    "Department",
                    "Asset",
                    "Section",
                    "KM",
                    "Maintenance",
                    "Priority",
                    "Due",
                    "Duration",
                    "Resources",
                    "Status",
                    "",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-3 py-3 text-[8px] font-semibold uppercase tracking-[0.13em] text-[var(--secondary-text)]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => {
                  const sectionItem = railwaySections.find(
                    (item) => item.id === task.sectionId,
                  );

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="cursor-pointer border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--panel-hover)]"
                    >
                      <td className="px-3 py-3 font-mono text-[9px] font-semibold text-[var(--primary-text)]">
                        {task.id}
                      </td>

                      <td className="px-3 py-3 text-[9px] text-[var(--primary-text)]">
                        {departmentLabel(task.department)}
                      </td>

                      <td className="px-3 py-3 text-[9px] text-[var(--secondary-text)]">
                        {task.assetLabel}
                      </td>

                      <td className="px-3 py-3 font-mono text-[9px] text-[var(--primary-text)]">
                        {sectionItem?.code}
                      </td>

                      <td className="px-3 py-3 font-mono text-[9px] text-[var(--secondary-text)]">
                        {task.km.toFixed(1)}
                      </td>

                      <td className="px-3 py-3 text-[9px] text-[var(--primary-text)]">
                        {task.maintenanceType}
                      </td>

                      <td
                        className={`px-3 py-3 text-[8px] font-semibold ${priorityClass(
                          task.priority,
                        )}`}
                      >
                        {task.priority}
                      </td>

                      <td className="px-3 py-3 font-mono text-[9px] text-[var(--secondary-text)]">
                        {task.dueOffsetDays === 0
                          ? "TODAY"
                          : `+${task.dueOffsetDays}D`}
                      </td>

                      <td className="px-3 py-3 font-mono text-[9px] text-[var(--secondary-text)]">
                        {task.estimatedDurationMinutes} min
                      </td>

                      <td className="px-3 py-3 font-mono text-[8px] text-[var(--secondary-text)]">
                        {task.requiredResourceIds.join(", ")}
                      </td>

                      <td className="px-3 py-3">
                        <span className="rounded border border-[var(--border)] px-2 py-1 text-[7px] font-semibold text-[var(--secondary-text)]">
                          {task.status}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <ChevronRight
                          size={13}
                          className="text-[var(--secondary-text)]"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTasks.length === 0 && (
            <div className="px-4 py-10 text-center text-[10px] text-[var(--secondary-text)]">
              No maintenance tasks match the current filters.
            </div>
          )}
        </div>
      </section>

      {/* Task details drawer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="h-full w-full max-w-lg overflow-y-auto border-l border-[var(--border)] bg-[var(--background)] shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between border-b border-[var(--border)] bg-[var(--background)] px-5 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--secondary-text)]">
                  Maintenance Requirement
                </p>

                <h2 className="mt-1 font-mono text-lg font-semibold text-[var(--primary-text)]">
                  {selectedTask.id}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTaskId(null)}
                className="rounded border border-[var(--border)] p-2 text-[var(--secondary-text)]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div className="grid grid-cols-2 gap-4">
                <Detail
                  label="Department"
                  value={departmentLabel(selectedTask.department)}
                />
                <Detail
                  label="Priority"
                  value={selectedTask.priority}
                  valueClass={priorityClass(selectedTask.priority)}
                />
                <Detail label="Asset" value={selectedTask.assetLabel} />
                <Detail
                  label="Section"
                  value={`${selectedSection?.code ?? "—"} · KM ${selectedTask.km}`}
                />
                <Detail
                  label="Maintenance Type"
                  value={selectedTask.maintenanceType}
                />
                <Detail
                  label="Duration"
                  value={`${selectedTask.estimatedDurationMinutes} minutes`}
                />
                <Detail label="Due Date" value={selectedTask.dueDate} />
                <Detail label="Status" value={selectedTask.status} />
              </div>

              <div>
                <h3 className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--secondary-text)]">
                  Required Resources
                </h3>

                <div className="mt-3 space-y-2">
                  {selectedResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between rounded border border-[var(--border)] bg-[var(--panel)] px-3 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <Wrench
                          size={12}
                          className="text-[var(--secondary-text)]"
                        />

                        <div>
                          <div className="font-mono text-[9px] text-[var(--primary-text)]">
                            {resource.id}
                          </div>
                          <div className="mt-1 text-[8px] text-[var(--secondary-text)]">
                            {resource.name}
                          </div>
                        </div>
                      </div>

                      <span className="text-[8px] font-semibold text-[var(--success-green)]">
                        {resource.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--secondary-text)]">
                  Planning Eligibility
                </h3>

                <div className="mt-3 divide-y divide-[var(--border)] rounded border border-[var(--border)]">
                  {[
                    ["Location Data", true],
                    ["Resource Requirement", true],
                    ["Duration Estimate", true],
                    ["Dependency Data", true],
                  ].map(([label]) => (
                    <div
                      key={String(label)}
                      className="flex items-center justify-between px-3 py-3"
                    >
                      <span className="text-[9px] text-[var(--primary-text)]">
                        {String(label)}
                      </span>

                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          size={12}
                          className="text-[var(--success-green)]"
                        />
                        <span className="font-mono text-[8px] font-semibold text-[var(--success-green)]">
                          VALID
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded border border-[var(--maintenance-amber)]/25 bg-[var(--maintenance-amber)]/5 p-3 text-[9px] leading-relaxed text-[var(--secondary-text)]">
                Planning eligibility is based on prototype dataset completeness.
                It is not an operational railway approval.
              </div>

              <button
                onClick={() =>
                  router.push(
                    `/opportunity-radar?task=${encodeURIComponent(
                      selectedTask.id,
                    )}`,
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded bg-[var(--planning-blue)] px-4 py-3 text-[9px] font-semibold text-white"
              >
                <Send size={13} />
                SEND TO OPPORTUNITY RADAR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Detail({
  label,
  value,
  valueClass = "text-[var(--primary-text)]",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="text-[8px] uppercase tracking-[0.12em] text-[var(--secondary-text)]">
        {label}
      </div>
      <div className={`mt-1 text-[10px] ${valueClass}`}>{value}</div>
    </div>
  );
}