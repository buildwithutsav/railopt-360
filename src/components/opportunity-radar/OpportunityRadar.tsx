"use client";
import { validateTaskCompatibility } from "@/lib/intelligence/compatibility-engine";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  candidateOpportunities,
  maintenanceTasks,
  railwaySections,
  stations,
} from "@/data/mock-data";
import type { MaintenanceTask } from "@/types/railway";
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  MapPin,
  Radar,
  Route,
  Wrench,
  X,
} from "lucide-react";

const CORRIDOR_LENGTH = 42;

function positionFromKm(km: number) {
  return `${(km / CORRIDOR_LENGTH) * 100}%`;
}

function priorityClass(priority: string) {
  if (priority === "CRITICAL") return "text-red-400 border-red-500/30";
  if (priority === "HIGH") return "text-amber-400 border-amber-500/30";
  if (priority === "MEDIUM") return "text-blue-400 border-blue-500/30";

  return "text-slate-400 border-slate-500/30";
}

function departmentLabel(department: string) {
  if (department === "ENGINEERING") return "Engineering";
  if (department === "TRACTION") return "Traction / OHE";
  return "Signal & Telecom";
}

export function OpportunityRadar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedTaskId = searchParams.get("task");

  const [selectedOpportunity, setSelectedOpportunity] = useState(
    candidateOpportunities[0]?.id ?? "",
  );

  const [showDetails, setShowDetails] = useState(false);

  const opportunity =
    candidateOpportunities.find(
      (item) => item.id === selectedOpportunity,
    ) ?? candidateOpportunities[0];

  const opportunityTasks = useMemo(() => {
    if (!opportunity) return [];

    return maintenanceTasks.filter((task) =>
      opportunity.taskIds.includes(task.id),
    );
  }, [opportunity]);

  const requestedTask = requestedTaskId
    ? maintenanceTasks.find((task) => task.id === requestedTaskId)
    : undefined;

  const section = opportunity
    ? railwaySections.find(
        (item) => item.id === opportunity.sectionId,
      )
    : undefined;

  const compatibilityResult = useMemo(() => {
  if (opportunityTasks.length < 2) {
    return null;
  }

  return validateTaskCompatibility(opportunityTasks);
}, [opportunityTasks]);

const compatibilityChecks =
  compatibilityResult?.checks ?? [];

  return (
    <>
      <section className="space-y-5">
        {requestedTask && (
          <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-blue-400">
                Maintenance Hub Input
              </div>

              <div className="mt-1 text-[10px] text-slate-300">
                Evaluating opportunities related to{" "}
                <span className="font-mono font-semibold text-slate-100">
                  {requestedTask.id}
                </span>{" "}
                · {requestedTask.maintenanceType}
              </div>
            </div>

            <span className="font-mono text-[9px] text-slate-500">
              KM {requestedTask.km}
            </span>
          </div>
        )}

        {/* Summary */}
        <div className="grid gap-3 md:grid-cols-4">
          <Metric
            label="Candidate Opportunities"
            value="4"
            note="Simulation"
          />

          <Metric
            label="Selected Opportunity"
            value="S2"
            note="RPN → DBR"
          />

          <Metric
            label="Tasks Combined"
            value={String(opportunityTasks.length)}
            note="3 departments"
          />

          <Metric
            label="Candidate Window"
            value={
              opportunity
                ? "TO BE SCHEDULED"
                : "—"
            }
            note="Simulation"
          />
        </div>

        {/* Main radar workspace */}
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="overflow-hidden rounded-lg border border-slate-700/70 bg-slate-900/30">
            <div className="flex items-center justify-between border-b border-slate-700/70 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <Radar size={14} className="text-blue-400" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Spatial Opportunity Radar
                  </span>
                </div>

                <h2 className="mt-1 text-sm font-semibold text-slate-200">
                  UDR – Mavli Maintenance Corridor
                </h2>
              </div>

              <span className="text-[9px] uppercase tracking-[0.12em] text-slate-500">
                Prototype analysis
              </span>
            </div>

            {/* Corridor */}
            <div className="px-8 pb-7 pt-10">
              <div className="relative h-40">
                {/* Section backgrounds */}
                {railwaySections.map((item) => {
                  const left =
                    (item.startKm / CORRIDOR_LENGTH) * 100;

                  const width =
                    ((item.endKm - item.startKm) /
                      CORRIDOR_LENGTH) *
                    100;

                  const selected =
                    item.id === opportunity?.sectionId;

                  return (
                    <div
                      key={item.id}
                      className={`absolute top-7 h-20 border-x ${
                        selected
                          ? "border-blue-500/40 bg-blue-500/5"
                          : "border-slate-800"
                      }`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                      }}
                    >
                      <div
                        className={`absolute left-1/2 top-2 -translate-x-1/2 font-mono text-[9px] ${
                          selected
                            ? "text-blue-400"
                            : "text-slate-600"
                        }`}
                      >
                        {item.code}
                      </div>
                    </div>
                  );
                })}

                {/* Track */}
                <div className="absolute left-0 right-0 top-[72px] h-px bg-slate-600" />

                {/* Stations */}
                {stations.map((station) => (
                  <div
                    key={station.id}
                    className="absolute top-[64px] -translate-x-1/2"
                    style={{
                      left: positionFromKm(station.km),
                    }}
                  >
                    <div className="h-4 w-4 rounded-full border-2 border-slate-500 bg-[#0b121b]" />

                    <div className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap text-center">
                      <div className="font-mono text-[9px] font-semibold text-slate-300">
                        {station.code}
                      </div>

                      <div className="mt-1 font-mono text-[8px] text-slate-600">
                        {station.km} KM
                      </div>
                    </div>
                  </div>
                ))}

                {/* Maintenance markers */}
                {maintenanceTasks.map((task, index) => {
                  const included =
                    opportunity?.taskIds.includes(task.id);

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setShowDetails(true)}
                      className="absolute z-20 -translate-x-1/2"
                      style={{
                        left: positionFromKm(task.km),
                        top: included
                          ? index % 2 === 0
                            ? "0px"
                            : "98px"
                          : "104px",
                      }}
                    >
                      <div
                        className={`flex items-center gap-1 whitespace-nowrap rounded border bg-[#0d151f] px-2 py-1 font-mono text-[8px] ${
                          included
                            ? priorityClass(task.priority)
                            : "border-slate-700 text-slate-600"
                        }`}
                      >
                        <Wrench size={9} />
                        {task.id}
                      </div>

                      {included && (
                        <div className="mx-auto h-3 w-px bg-blue-500/50" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
                <div className="flex items-center gap-6">
                  <Legend
                    className="border-red-500"
                    label="Critical"
                  />
                  <Legend
                    className="border-amber-500"
                    label="High"
                  />
                  <Legend
                    className="border-blue-500"
                    label="Medium"
                  />
                </div>

                <span className="text-[8px] uppercase tracking-wider text-slate-600">
                  Location-based opportunity visualization
                </span>
              </div>
            </div>
          </div>

          {/* Opportunity card */}
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/[0.03]">
            <div className="border-b border-blue-500/20 px-4 py-4">
              <div className="flex items-center gap-2">
                <CircleDot size={13} className="text-blue-400" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-blue-400">
                  Selected Opportunity
                </span>
              </div>

              <h2 className="mt-2 font-mono text-lg font-semibold text-slate-100">
                {opportunity?.id}
              </h2>

              <div className="mt-1 text-[10px] text-slate-500">
                {section?.code} · Rana Pratap Nagar → Debari
              </div>
            </div>

            <div className="space-y-5 p-4">
              <div className="grid grid-cols-2 gap-3">
                <Info
                  label="Window"
                  value={
                    opportunity
                      ? "TO BE SCHEDULED"
                      : "—"
                  }
                />

                <Info
                  label="Departments"
                  value={String(
                    opportunity?.departmentCount ?? 0,
                  )}
                />

                <Info
                  label="Tasks"
                  value={String(opportunityTasks.length)}
                />

                <Info
                  label="Section"
                  value={section?.code ?? "—"}
                />
              </div>

              <div>
                <div className="text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Candidate Work Package
                </div>

                <div className="mt-3 space-y-2">
                  {opportunityTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              </div>

              <div className="rounded border border-amber-500/20 bg-amber-500/5 p-3 text-[9px] leading-relaxed text-slate-400">
                Opportunity detection indicates potential
                compatibility only. Train impact, resources,
                constraints and safety conditions must be validated
                before a block can be recommended.
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="w-full border border-slate-700 px-3 py-2.5 text-[9px] font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                VIEW COMPATIBILITY CHECKS
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/block-planner?opportunity=${opportunity?.id}`,
                  )
                }
                className="flex w-full items-center justify-center gap-2 bg-blue-600 px-3 py-2.5 text-[9px] font-semibold text-white transition hover:bg-blue-500"
              >
                SEND TO BLOCK PLANNER
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Compatibility matrix */}
        <div className="overflow-hidden rounded-lg border border-slate-700/70 bg-slate-900/30">
          <div className="border-b border-slate-700 px-5 py-4">
            <div className="flex items-center gap-2">
              <Route size={13} className="text-slate-400" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Cross-Department Compatibility Matrix
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-4 py-3 text-[8px] uppercase tracking-wider text-slate-600">
                    Task
                  </th>
                  <th className="px-4 py-3 text-[8px] uppercase tracking-wider text-slate-600">
                    Department
                  </th>
                  <th className="px-4 py-3 text-[8px] uppercase tracking-wider text-slate-600">
                    Location
                  </th>
                  <th className="px-4 py-3 text-[8px] uppercase tracking-wider text-slate-600">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-[8px] uppercase tracking-wider text-slate-600">
                    Resource
                  </th>
                  <th className="px-4 py-3 text-[8px] uppercase tracking-wider text-slate-600">
                    Opportunity
                  </th>
                </tr>
              </thead>

              <tbody>
                {opportunityTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-slate-800 last:border-b-0"
                  >
                    <td className="px-4 py-3 font-mono text-[9px] font-semibold text-slate-200">
                      {task.id}
                    </td>

                    <td className="px-4 py-3 text-[9px] text-slate-400">
                      {departmentLabel(task.department)}
                    </td>

                    <td className="px-4 py-3 font-mono text-[9px] text-slate-400">
                      S2 · KM {task.km}
                    </td>

                    <td className="px-4 py-3 font-mono text-[9px] text-slate-400">
                      {task.estimatedDurationMinutes} min
                    </td>

                    <td className="px-4 py-3 font-mono text-[8px] text-slate-500">
                      {task.requiredResourceIds.join(", ")}
                    </td>

                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-[8px] font-semibold text-emerald-400">
                        <CheckCircle2 size={11} />
                        CANDIDATE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Compatibility drawer */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-slate-700 bg-[#0a1119] p-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-blue-400">
                  Opportunity Validation
                </div>

                <h2 className="mt-1 text-lg font-semibold text-slate-100">
                  Compatibility Checks
                </h2>

                <div className="mt-1 font-mono text-[9px] text-slate-500">
                  {opportunity?.id}
                </div>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="border border-slate-700 p-2 text-slate-500 hover:text-slate-200"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-6 divide-y divide-slate-800 border-y border-slate-800">
              {compatibilityChecks.map((check) => (
                <div key={check.label} className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-medium text-slate-200">
                      {check.label}
                    </span>

                    <span
                      className={`font-mono text-[8px] font-semibold ${
  check.status === "PASS"
    ? "text-emerald-400"
    : check.status === "FAIL"
      ? "text-red-400"
      : "text-amber-400"
}`}
                    >
                      {check.status}
                    </span>
                  </div>

                  <p className="mt-2 text-[9px] leading-relaxed text-slate-500">
                    {check.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 border border-amber-500/20 bg-amber-500/5 p-3 text-[9px] leading-relaxed text-slate-400">
              These are prototype compatibility checks. A candidate
              opportunity is not equivalent to an approved railway
              maintenance block.
            </div>

            <button
              onClick={() => {
                setShowDetails(false);

                router.push(
                  `/block-planner?opportunity=${opportunity?.id}`,
                );
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 bg-blue-600 px-4 py-3 text-[9px] font-semibold text-white"
            >
              CONTINUE TO BLOCK PLANNER
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
    </>
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
    <div className="rounded-lg border border-slate-700/70 bg-slate-900/30 px-4 py-4">
      <div className="text-[8px] uppercase tracking-[0.14em] text-slate-600">
        {label}
      </div>

      <div className="mt-2 font-mono text-xl font-semibold text-slate-100">
        {value}
      </div>

      <div className="mt-1 text-[8px] uppercase tracking-wider text-slate-500">
        {note}
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
    <div className="border border-slate-700/70 bg-slate-900/40 p-3">
      <div className="text-[8px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-2 font-mono text-[10px] font-semibold text-slate-200">
        {value}
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: MaintenanceTask }) {
  return (
    <div className="flex items-center justify-between border border-slate-700/70 bg-slate-900/40 px-3 py-2">
      <div className="flex items-center gap-2">
        <MapPin size={11} className="text-blue-400" />

        <div>
          <div className="font-mono text-[9px] font-semibold text-slate-200">
            {task.id}
          </div>

          <div className="mt-1 text-[8px] text-slate-500">
            {departmentLabel(task.department)} · KM {task.km}
          </div>
        </div>
      </div>

      <span
        className={`text-[8px] font-semibold ${priorityClass(
          task.priority,
        )}`}
      >
        {task.priority}
      </span>
    </div>
  );
}

function Legend({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full border ${className}`} />
      <span className="text-[8px] uppercase text-slate-600">
        {label}
      </span>
    </div>
  );
}