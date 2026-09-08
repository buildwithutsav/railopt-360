"use client";

import { useMemo, useState } from "react";
import { maintenanceTasks, resources } from "@/data/mock-data";
import type { Department, ResourceStatus } from "@/types/railway";

type DepartmentFilter = "ALL" | Department;
type StatusFilter = "ALL" | ResourceStatus;

function departmentLabel(department: Department) {
  if (department === "ENGINEERING") return "Engineering";
  if (department === "TRACTION") return "Traction / OHE";
  return "Signal & Telecom";
}

function statusClass(status: ResourceStatus) {
  if (status === "AVAILABLE") {
    return "border-emerald-500/30 bg-emerald-500/5 text-emerald-400";
  }

  if (status === "ASSIGNED") {
    return "border-blue-500/30 bg-blue-500/5 text-blue-400";
  }

  return "border-red-500/30 bg-red-500/5 text-red-400";
}

export function ResourceCenter() {
  const [department, setDepartment] =
    useState<DepartmentFilter>("ALL");

  const [status, setStatus] =
    useState<StatusFilter>("ALL");

  const [selectedResourceId, setSelectedResourceId] =
    useState<string | null>(null);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const departmentMatch =
        department === "ALL" ||
        resource.department === department;

      const statusMatch =
        status === "ALL" ||
        resource.status === status;

      return departmentMatch && statusMatch;
    });
  }, [department, status]);

  const selectedResource = resources.find(
    (resource) => resource.id === selectedResourceId,
  );

  const assignedTasks = selectedResource
    ? maintenanceTasks.filter((task) =>
        task.requiredResourceIds.includes(selectedResource.id),
      )
    : [];

  const availableCount = resources.filter(
    (resource) => resource.status === "AVAILABLE",
  ).length;

  const assignedCount = resources.filter(
    (resource) => resource.status === "ASSIGNED",
  ).length;

  const unavailableCount = resources.filter(
    (resource) => resource.status === "UNAVAILABLE",
  ).length;

  const utilization =
    resources.length > 0
      ? Math.round(
          ((assignedCount + unavailableCount) /
            resources.length) *
            100,
        )
      : 0;

  return (
    <section className="space-y-5">
      {/* summary */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Total Resources"
          value={String(resources.length)}
          note="Prototype dataset"
        />

        <Metric
          label="Available"
          value={String(availableCount)}
          note="Ready for planning"
        />

        <Metric
          label="Assigned"
          value={String(assignedCount)}
          note="Allocated"
        />

        <Metric
          label="Unavailable"
          value={String(unavailableCount)}
          note="Requires review"
        />

        <Metric
          label="Resource Load"
          value={`${utilization}%`}
          note="Prototype indicator"
        />
      </div>

      {/* filters */}
      <div className="border border-slate-700/70 bg-slate-900/30 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-[8px] uppercase tracking-wider text-slate-600">
              Department
            </label>

            <select
              value={department}
              onChange={(event) =>
                setDepartment(
                  event.target.value as DepartmentFilter,
                )
              }
              className="mt-2 w-full border border-slate-700 bg-[#0b121b] px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Departments</option>
              <option value="ENGINEERING">
                Engineering
              </option>
              <option value="TRACTION">
                Traction / OHE
              </option>
              <option value="SNT">
                Signal & Telecom
              </option>
            </select>
          </div>

          <div>
            <label className="text-[8px] uppercase tracking-wider text-slate-600">
              Resource Status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as StatusFilter)
              }
              className="mt-2 w-full border border-slate-700 bg-[#0b121b] px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="UNAVAILABLE">
                Unavailable
              </option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        {/* resource register */}
        <div className="overflow-hidden border border-slate-700/70 bg-slate-900/30">
          <div className="border-b border-slate-700 px-5 py-4">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Resource Register
            </div>

            <div className="mt-1 text-xs text-slate-400">
              Teams and equipment available for maintenance planning
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                    Resource ID
                  </th>

                  <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                    Resource
                  </th>

                  <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                    Department
                  </th>

                  <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                    Required By
                  </th>

                  <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredResources.map((resource) => {
                  const linkedTasks = maintenanceTasks.filter(
                    (task) =>
                      task.requiredResourceIds.includes(
                        resource.id,
                      ),
                  );

                  return (
                    <tr
                      key={resource.id}
                      onClick={() =>
                        setSelectedResourceId(resource.id)
                      }
                      className="cursor-pointer border-b border-slate-800 transition hover:bg-slate-800/40 last:border-b-0"
                    >
                      <td className="px-4 py-4 font-mono text-[9px] font-semibold text-slate-200">
                        {resource.id}
                      </td>

                      <td className="px-4 py-4 text-[9px] text-slate-300">
                        {resource.name}
                      </td>

                      <td className="px-4 py-4 text-[9px] text-slate-400">
                        {departmentLabel(
                          resource.department,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {linkedTasks.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {linkedTasks.map((task) => (
                              <span
                                key={task.id}
                                className="border border-slate-700 px-2 py-1 font-mono text-[8px] text-slate-400"
                              >
                                {task.id}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[8px] text-slate-600">
                            None
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`border px-2 py-1 text-[8px] font-semibold ${statusClass(
                            resource.status,
                          )}`}
                        >
                          {resource.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-700 px-4 py-3">
            <span className="text-[8px] uppercase tracking-wider text-slate-600">
              {filteredResources.length} of {resources.length} resources shown
            </span>

            <span className="font-mono text-[8px] uppercase text-amber-500">
              Simulated Resource State
            </span>
          </div>
        </div>

        {/* planning panel */}
        <div className="space-y-4">
          <div className="border border-slate-700/70 bg-slate-900/30">
            <div className="border-b border-slate-700 px-4 py-4">
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Resource Planning Intelligence
              </div>
            </div>

            <div className="space-y-3 p-4">
              <PlanningCheck
                label="Engineering Capacity"
                value={departmentAvailability(
                  "ENGINEERING",
                )}
              />

              <PlanningCheck
                label="Traction Capacity"
                value={departmentAvailability(
                  "TRACTION",
                )}
              />

              <PlanningCheck
                label="S&T Capacity"
                value={departmentAvailability("SNT")}
              />

              <PlanningCheck
                label="Current Conflicts"
                value={
                  unavailableCount === 0
                    ? "No prototype conflict"
                    : `${unavailableCount} conflict(s)`
                }
              />
            </div>
          </div>

          {selectedResource ? (
            <div className="border border-blue-500/25 bg-blue-500/[0.03] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.16em] text-blue-400">
                    Selected Resource
                  </div>

                  <div className="mt-2 font-mono text-lg font-semibold text-slate-100">
                    {selectedResource.id}
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    {selectedResource.name}
                  </div>
                </div>

                <span
                  className={`border px-2 py-1 text-[8px] font-semibold ${statusClass(
                    selectedResource.status,
                  )}`}
                >
                  {selectedResource.status}
                </span>
              </div>

              <div className="mt-4 border-t border-slate-800 pt-4">
                <div className="text-[8px] uppercase tracking-wider text-slate-600">
                  Department
                </div>

                <div className="mt-1 text-[9px] text-slate-300">
                  {departmentLabel(
                    selectedResource.department,
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-[8px] uppercase tracking-wider text-slate-600">
                  Maintenance Dependencies
                </div>

                <div className="mt-3 space-y-2">
                  {assignedTasks.length > 0 ? (
                    assignedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="border border-slate-800 p-3"
                      >
                        <div className="font-mono text-[9px] font-semibold text-slate-200">
                          {task.id}
                        </div>

                        <div className="mt-1 text-[8px] text-slate-500">
                          {task.maintenanceType}
                        </div>

                        <div className="mt-2 font-mono text-[8px] text-slate-600">
                          {task.sectionId} · KM {task.km}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="border border-slate-800 p-3 text-[8px] text-slate-600">
                      No maintenance dependency in current simulation.
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedResourceId(null)
                }
                className="mt-4 w-full border border-slate-700 px-3 py-2 text-[8px] font-semibold text-slate-400 hover:bg-slate-800"
              >
                CLOSE RESOURCE DETAILS
              </button>
            </div>
          ) : (
            <div className="border border-slate-700/70 bg-slate-900/30 p-6 text-center">
              <div className="font-mono text-[9px] text-slate-500">
                SELECT A RESOURCE
              </div>

              <p className="mt-2 text-[8px] leading-relaxed text-slate-600">
                Choose a resource from the register to inspect its
                department, status and maintenance dependencies.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border border-amber-500/20 bg-amber-500/[0.03] px-4 py-3">
        <p className="text-[8px] leading-relaxed text-slate-500">
          Resource states shown here are synthetic prototype values.
          Future authorized deployment can integrate real workforce,
          equipment and availability systems.
        </p>
      </div>
    </section>
  );
}

function departmentAvailability(
  department: Department,
) {
  const departmentResources = resources.filter(
    (resource) => resource.department === department,
  );

  const available = departmentResources.filter(
    (resource) => resource.status === "AVAILABLE",
  ).length;

  return `${available}/${departmentResources.length} available`;
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

function PlanningCheck({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border border-slate-800 bg-[#0b121b] px-3 py-3">
      <span className="text-[8px] text-slate-500">
        {label}
      </span>

      <span className="font-mono text-[8px] text-slate-300">
        {value}
      </span>
    </div>
  );
}